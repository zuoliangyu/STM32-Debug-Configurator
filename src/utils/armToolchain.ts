/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * ARM工具链检测模块
 * 提供ARM工具链路径检测和信息获取功能
 * 支持Windows、macOS和Linux平台的ARM工具链安装检测
 * 
 * @fileoverview ARM工具链检测工具类
 * @author 左岚
 * @since 0.2.3
 */

import * as path from 'path';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import { expandPath, normalizePath, isValidExecutablePath, buildExecutablePath } from './pathUtils';
import { COMMON_ARM_TOOLCHAIN_PATHS, ST_BUNDLE_ARM_TOOLCHAIN_GLOB } from './toolchainPaths';

/**
 * ARM工具链信息接口
 * 定义工具链版本和路径信息结构
 */
export interface ToolchainInfo {
    /** 工具链版本字符串 */
    version: string;
    /** GCC编译器路径 */
    gccPath: string;
    /** 工具链根目录路径 */
    rootPath: string;
    /** 目标架构 */
    target: string;
    /** 工具链供应商信息 */
    vendor?: string;
    /** 检测时间戳 */
    detectedAt?: number;
}

/**
 * ARM工具链可执行文件集合接口
 * 定义工具链中常用工具的路径信息
 */
export interface ToolchainExecutables {
    /** arm-none-eabi-gcc 编译器 */
    gcc: string;
    /** arm-none-eabi-g++ C++编译器 */
    gpp: string;
    /** arm-none-eabi-as 汇编器 */
    as: string;
    /** arm-none-eabi-ld 链接器 */
    ld: string;
    /** arm-none-eabi-ar 归档工具 */
    ar: string;
    /** arm-none-eabi-objcopy 对象拷贝工具 */
    objcopy: string;
    /** arm-none-eabi-objdump 对象反汇编工具 */
    objdump: string;
    /** arm-none-eabi-size 大小分析工具 */
    size: string;
    /** arm-none-eabi-nm 符号表工具 */
    nm: string;
    /** arm-none-eabi-gdb 调试器 */
    gdb: string;
}

/**
 * ARM工具链验证结果接口
 * 定义验证工具链安装完整性的结果
 */
export interface ToolchainValidationResult {
    /** 验证是否通过 */
    isValid: boolean;
    /** 验证的工具链信息 */
    toolchainInfo: ToolchainInfo | null;
    /** 可用的可执行文件路径 */
    executables: Partial<ToolchainExecutables>;
    /** 缺失的工具列表 */
    missingTools: string[];
    /** 验证错误信息 */
    errors: string[];
}

// 向后兼容的导出函数
export const normalizeToolchainPath = normalizePath;
export const checkArmToolchainPath = isValidExecutablePath;

function checkCortexDebugConfig(): string | null {
    const config = vscode.workspace.getConfiguration('cortex-debug');
    const userToolchainPath = config.get<string>('armToolchainPath');
    
    if (!userToolchainPath) {
        return null;
    }
    
    let gccPath = userToolchainPath;
    if (!gccPath.includes('arm-none-eabi-gcc')) {
        gccPath = buildExecutablePath(path.join(gccPath, 'bin'), 'arm-none-eabi-gcc');
    }
    
    const normalizedPath = normalizePath(gccPath);
    return isValidExecutablePath(normalizedPath) ? normalizedPath : null;
}

function findInPath(): Promise<string | null> {
    return new Promise((resolve) => {
        const executableName = process.platform === 'win32' ? 'arm-none-eabi-gcc.exe' : 'arm-none-eabi-gcc';
        const command = process.platform === 'win32' ? `where ${executableName}` : `which ${executableName}`;
        
        exec(command, (error, stdout) => {
            if (error) {
                resolve(null);
                return;
            }
            
            const firstPath = stdout.split(/\r?\n/)[0].trim();
            const normalizedPath = normalizePath(firstPath);
            resolve(isValidExecutablePath(normalizedPath) ? normalizedPath : null);
        });
    });
}

function findInCommonPaths(): string | null {
    if (process.platform !== 'win32') {
        return null;
    }

    for (const pathTemplate of COMMON_ARM_TOOLCHAIN_PATHS) {
        const expandedPaths = expandPath(pathTemplate);
        for (const testPath of expandedPaths) {
            const normalizedPath = normalizePath(testPath);
            if (isValidExecutablePath(normalizedPath)) {
                return normalizedPath;
            }
        }
    }

    return null;
}

/**
 * 在 STM32 VS Code Extension bundle 目录里查找所有版本的工具链
 * 多版本时按字符串倒序排列（13.3.1+st.8 < 13.3.1+st.9 < 14.3.1+st.2）
 */
function findAllInStBundle(): string[] {
    if (process.platform !== 'win32') {
        return [];
    }
    return expandPath(ST_BUNDLE_ARM_TOOLCHAIN_GLOB)
        .map(normalizePath)
        .filter(isValidExecutablePath)
        .sort()
        .reverse();
}

function findInStBundle(): string | null {
    return findAllInStBundle()[0] ?? null;
}

function findAllInCommonPaths(): string[] {
    if (process.platform !== 'win32') {
        return [];
    }
    const out: string[] = [];
    for (const pathTemplate of COMMON_ARM_TOOLCHAIN_PATHS) {
        for (const expanded of expandPath(pathTemplate)) {
            const normalized = normalizePath(expanded);
            if (isValidExecutablePath(normalized) && !out.includes(normalized)) {
                out.push(normalized);
            }
        }
    }
    return out;
}

/** 工具链候选项来源 */
export type ToolchainSource = 'userConfig' | 'stBundle' | 'path' | 'common';

export interface ToolchainCandidate {
    /** GCC 可执行文件绝对路径 */
    path: string;
    /** 来源 */
    source: ToolchainSource;
    /** 版本（异步检测后填充，可能为 'Unknown'） */
    version: string;
    /** 用于 UI 显示的标签 */
    label: string;
}

const SOURCE_LABEL: Record<ToolchainSource, string> = {
    userConfig: 'cortex-debug 用户配置',
    stBundle: 'STM32 官方扩展 bundle',
    path: 'PATH 环境变量',
    common: '常见安装路径'
};

/**
 * 枚举所有检测到的 ARM 工具链候选项
 * 与 findArmToolchainPath 不同——这个函数返回**所有**找到的工具链，
 * 用于让用户在 UI 上选择，而不是只返回最高优先级的那一个。
 *
 * 顺序：ST bundle (多版本) → 用户配置 → PATH → 其他常见路径
 * 同一个路径不会出现两次。
 */
export async function enumerateArmToolchains(): Promise<ToolchainCandidate[]> {
    const seen = new Set<string>();
    const out: ToolchainCandidate[] = [];

    const add = (path: string, source: ToolchainSource) => {
        const key = path.toLowerCase();
        if (seen.has(key)) {
            return;
        }
        seen.add(key);
        out.push({ path, source, version: 'Unknown', label: SOURCE_LABEL[source] });
    };

    for (const p of findAllInStBundle()) {
        add(p, 'stBundle');
    }
    const userPath = checkCortexDebugConfig();
    if (userPath) {
        add(userPath, 'userConfig');
    }
    const pathHit = await findInPath();
    if (pathHit) {
        add(pathHit, 'path');
    }
    for (const p of findAllInCommonPaths()) {
        add(p, 'common');
    }

    // 取版本号填充 label
    await Promise.all(
        out.map(async (c) => {
            try {
                const info = await getArmToolchainInfo(c.path);
                c.version = info.version;
                c.label = `${SOURCE_LABEL[c.source]} · ${info.version}`;
            } catch {
                c.label = SOURCE_LABEL[c.source];
            }
        })
    );

    return out;
}

/**
 * 判断给定路径是否位于 STM32 VS Code Extension 的 bundle 目录下
 */
export function isStBundleArmToolchainPath(toolchainPath: string): boolean {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData) {
        return false;
    }
    const normalized = normalizePath(toolchainPath).toLowerCase();
    const prefix = (normalizePath(localAppData) + '/stm32cube/bundles/').toLowerCase();
    return normalized.startsWith(prefix);
}

/**
 * 把绝对路径转成可移植的 ${env:LOCALAPPDATA}/... 形式
 * 仅对 ST bundle 路径生效；非 bundle 路径原样返回
 */
export function toPortableArmToolchainPath(toolchainPath: string): string {
    const localAppData = process.env.LOCALAPPDATA;
    if (!localAppData || !isStBundleArmToolchainPath(toolchainPath)) {
        return toolchainPath;
    }
    const normalized = normalizePath(toolchainPath);
    const normalizedRoot = normalizePath(localAppData);
    return '${env:LOCALAPPDATA}' + normalized.substring(normalizedRoot.length);
}

/**
 * 把工具链路径规范化成 bin 目录形式
 * 输入可以是 .../bin/arm-none-eabi-gcc.exe 或 .../bin
 * 输出始终是 bin 目录，并对 ST bundle 走 ${env:LOCALAPPDATA} 可移植转换
 *
 * cortex-debug 的 armToolchainPath 字段期望的是 bin 目录而不是 gcc.exe 路径
 */
export function toolchainBinDir(toolchainPath: string): string {
    const normalized = normalizePath(toolchainPath);
    let binDir: string;
    if (/\/arm-none-eabi-gcc(\.exe)?$/i.test(normalized)) {
        binDir = path.dirname(normalized);
    } else {
        binDir = normalized.replace(/\/+$/, '');
    }
    return toPortableArmToolchainPath(binDir);
}

/**
 * 根据用户填的 ARM 工具链路径推导出 arm-none-eabi-gdb 的完整路径
 * 输入可以是 gcc.exe 的完整路径，也可以是 bin 目录
 * 输出会先做 ST bundle → ${env:LOCALAPPDATA} 的可移植转换
 */
export function deriveGdbPath(toolchainPath: string): string {
    const normalized = normalizePath(toolchainPath);
    let binDir: string;
    if (/arm-none-eabi-gcc(\.exe)?$/i.test(normalized)) {
        binDir = path.dirname(normalized);
    } else {
        binDir = normalized.replace(/\/+$/, '');
    }
    const gdbExe = process.platform === 'win32' ? 'arm-none-eabi-gdb.exe' : 'arm-none-eabi-gdb';
    return toPortableArmToolchainPath(`${binDir}/${gdbExe}`);
}

/**
 * 使用多种检测方法查找ARM工具链路径
 * 按以下顺序检测：
 * 1. VSCode Cortex-Debug扩展配置的路径（用户显式设置）
 * 2. STM32 VS Code Extension 自动下载的 bundle（同机有 ST 官方扩展时优先采用）
 * 3. PATH环境变量中的arm-none-eabi-gcc
 * 4. 其他常见安装路径（仅Windows）
 *
 * @returns ARM GCC可执行文件的完整路径，如果未找到则返回null
 * @since 0.2.3
 */
export async function findArmToolchainPath(): Promise<string | null> {
    // Method 1: 用户在 cortex-debug 里显式配置过的路径
    const configPath = checkCortexDebugConfig();
    if (configPath) {
        return configPath;
    }

    // Method 2: STM32 VS Code Extension bundle（最贴合 ST 官方推荐工具链）
    const stBundlePath = findInStBundle();
    if (stBundlePath) {
        return stBundlePath;
    }

    // Method 3: PATH 环境变量
    const pathResult = await findInPath();
    if (pathResult) {
        return pathResult;
    }

    // Method 4: 其他常见安装路径
    return findInCommonPaths();
}

function parseVersionOutput(stdout: string, toolchainPath: string): ToolchainInfo {
    const lines = stdout.split('\n');
    const versionLine = lines[0] || '';
    
    // 提取版本号
    const versionMatch = versionLine.match(/(\d+\.\d+\.\d+)/);    
    const version = versionMatch ? versionMatch[1] : 'Unknown';
    
    // 提取目标架构信息
    const targetMatch = versionLine.match(/\(([^)]+)\)/);
    const target = targetMatch ? targetMatch[1] : 'arm-none-eabi';
    
    // 提取供应商信息
    let vendor = 'Unknown';
    if (versionLine.toLowerCase().includes('gnu')) {
        if (versionLine.toLowerCase().includes('arm')) {
            vendor = 'GNU Arm Embedded Toolchain';
        } else {
            vendor = 'GNU Toolchain';
        }
    } else if (versionLine.toLowerCase().includes('xpack')) {
        vendor = 'xPack GNU Arm Embedded GCC';
    }
    
    const normalizedPath = normalizePath(toolchainPath);
    const binDir = path.dirname(normalizedPath);
    const rootPath = normalizePath(path.dirname(binDir));
    
    return { 
        version, 
        gccPath: normalizedPath, 
        rootPath, 
        target, 
        vendor,
        detectedAt: Date.now()
    };
}

/**
 * 配置选项接口
 * 定义生成Cortex Debug配置的可选参数
 */
export interface CortexDebugConfig {
    /** 配置名称 */
    name?: string;
    /** 目标MCU类型 */
    device?: string;
    /** OpenOCD脚本路径 */
    configFiles?: string[];
    /** SVD文件路径 */
    svdFile?: string;
    /** 编程文件路径 */
    executable?: string;
    /** 附加的调试器参数 */
    debuggerArgs?: string[];
    /** 是否在启动时停止 */
    runToEntryPoint?: string;
    /** 工作目录 */
    cwd?: string;
}

/**
 * 生成Cortex Debug调试配置
 * 根据ARM工具链路径生成VS Code的launch.json配置
 * 
 * @param toolchainPath - ARM工具链路径
 * @param options - 可选配置参数
 * @returns 生成的Cortex Debug配置对象
 * @since 0.2.3
 */
export async function generateCortexDebugConfig(
    toolchainPath: string, 
    options: CortexDebugConfig = {}
): Promise<object> {
    const validation = await validateArmToolchainPath(toolchainPath);
    
    if (!validation.isValid || !validation.toolchainInfo) {
        throw new Error(`Invalid ARM toolchain path: ${validation.errors.join(', ')}`);
    }

    const {
        name = 'Debug STM32',
        device = 'STM32F103C8',
        configFiles = [
            'interface/stlink.cfg',
            'target/stm32f1x.cfg'
        ],
        svdFile,
        executable = '${workspaceFolder}/build/firmware.elf',
        debuggerArgs = [],
        runToEntryPoint = 'main',
        cwd = '${workspaceFolder}'
    } = options;

    const config = {
        name,
        cwd,
        executable,
        request: 'launch',
        type: 'cortex-debug',
        runToEntryPoint,
        servertype: 'openocd',
        device,
        configFiles,
        toolchainPath: validation.toolchainInfo.rootPath,
        armToolchainPath: validation.toolchainInfo.rootPath,
        debuggerPath: validation.executables.gdb || buildExecutablePath(
            path.join(validation.toolchainInfo.rootPath, 'bin'), 
            'arm-none-eabi-gdb'
        ),
        debuggerArgs: [
            '-q',
            '--interpreter=mi2',
            ...debuggerArgs
        ],
        swoConfig: {
            enabled: true,
            cpuFrequency: 72000000,
            swoFrequency: 2000000,
            source: 'probe',
            decoders: [
                {
                    type: 'console',
                    label: 'ITM',
                    port: 0
                }
            ]
        },
        graphConfig: [
            {
                label: 'CPU Usage',
                timespan: 30,
                maximum: 100,
                minimum: 0,
                plots: [
                    {
                        label: 'Core',
                        expr: 'cpuUsage',
                        color: '#ff6b6b'
                    }
                ]
            }
        ]
    };

    // 添加SVD文件配置（如果提供）
    if (svdFile) {
        (config as any).svdFile = svdFile;
    }

    return config;
}

/**
 * 生成完整的launch.json文件内容
 * 创建VS Code项目的.vscode/launch.json文件内容
 * 
 * @param toolchainPath - ARM工具链路径
 * @param configs - 多个调试配置选项
 * @returns launch.json的完整内容对象
 * @since 0.2.3
 */
export async function generateLaunchJsonContent(
    toolchainPath: string,
    configs: CortexDebugConfig[] = [{}]
): Promise<object> {
    const configurations = [];
    
    for (const config of configs) {
        try {
            const debugConfig = await generateCortexDebugConfig(toolchainPath, config);
            configurations.push(debugConfig);
        } catch (error) {
            console.error('Error generating debug configuration:', error);
            // 继续处理其他配置
        }
    }
    
    if (configurations.length === 0) {
        throw new Error('No valid debug configurations could be generated');
    }

    return {
        version: '0.2.0',
        configurations
    };
}

/**
 * 获取ARM工具链信息
 * 通过执行arm-none-eabi-gcc --version命令获取工具链的详细信息
 * 
 * @param toolchainPath - ARM GCC可执行文件的完整路径
 * @returns 包含工具链版本、路径和目标信息的对象
 * @since 0.2.3
 */
/**
 * 获取ARM工具链中所有可执行文件的路径
 * 根据工具链根路径构建各种工具的完整路径
 * 
 * @param toolchainRootPath - 工具链根目录路径
 * @returns 包含所有可执行文件路径的对象
 * @since 0.2.3
 */
export function getArmToolchainExecutables(toolchainRootPath: string): ToolchainExecutables {
    const binPath = path.join(toolchainRootPath, 'bin');
    const toolNames = ['gcc', 'g++', 'as', 'ld', 'ar', 'objcopy', 'objdump', 'size', 'nm', 'gdb'];
    
    return {
        gcc: buildExecutablePath(binPath, 'arm-none-eabi-gcc'),
        gpp: buildExecutablePath(binPath, 'arm-none-eabi-g++'),
        as: buildExecutablePath(binPath, 'arm-none-eabi-as'),
        ld: buildExecutablePath(binPath, 'arm-none-eabi-ld'),
        ar: buildExecutablePath(binPath, 'arm-none-eabi-ar'),
        objcopy: buildExecutablePath(binPath, 'arm-none-eabi-objcopy'),
        objdump: buildExecutablePath(binPath, 'arm-none-eabi-objdump'),
        size: buildExecutablePath(binPath, 'arm-none-eabi-size'),
        nm: buildExecutablePath(binPath, 'arm-none-eabi-nm'),
        gdb: buildExecutablePath(binPath, 'arm-none-eabi-gdb')
    };
}

/**
 * 验证ARM工具链路径的完整性
 * 检查工具链安装是否完整，包括必要的可执行文件
 * 
 * @param toolchainPath - ARM GCC可执行文件路径或工具链根目录路径
 * @returns 详细的验证结果，包括可用工具和缺失工具信息
 * @since 0.2.3
 */
export async function validateArmToolchainPath(toolchainPath: string): Promise<ToolchainValidationResult> {
    const result: ToolchainValidationResult = {
        isValid: false,
        toolchainInfo: null,
        executables: {},
        missingTools: [],
        errors: []
    };

    if (!toolchainPath) {
        result.errors.push('Toolchain path is empty');
        return result;
    }

    try {
        let gccPath = normalizePath(toolchainPath);
        let rootPath = '';

        // 确定GCC路径和根路径
        if (toolchainPath.includes('arm-none-eabi-gcc')) {
            // 输入的是GCC可执行文件路径
            if (!isValidExecutablePath(gccPath)) {
                result.errors.push('GCC executable not found at specified path');
                return result;
            }
            const binDir = path.dirname(gccPath);
            rootPath = path.dirname(binDir);
        } else {
            // 输入的是工具链根目录
            rootPath = gccPath;
            gccPath = buildExecutablePath(path.join(rootPath, 'bin'), 'arm-none-eabi-gcc');
            
            if (!isValidExecutablePath(gccPath)) {
                result.errors.push('GCC executable not found in toolchain bin directory');
                return result;
            }
        }

        // 获取工具链信息
        result.toolchainInfo = await getArmToolchainInfo(gccPath);
        
        // 检查所有可执行文件
        const allExecutables = getArmToolchainExecutables(rootPath);
        const coreTools = ['gcc', 'gpp', 'as', 'ld', 'ar', 'objcopy', 'objdump'] as const;
        const optionalTools = ['size', 'nm', 'gdb'] as const;
        
        // 验证核心工具
        for (const tool of coreTools) {
            const toolPath = allExecutables[tool];
            if (isValidExecutablePath(toolPath)) {
                result.executables[tool] = toolPath;
            } else {
                result.missingTools.push(`arm-none-eabi-${tool}`);
            }
        }
        
        // 验证可选工具（不影响总体有效性）
        for (const tool of optionalTools) {
            const toolPath = allExecutables[tool];
            if (isValidExecutablePath(toolPath)) {
                result.executables[tool] = toolPath;
            }
        }
        
        // 判断工具链是否有效（至少要有GCC）
        result.isValid = result.missingTools.length === 0 && 
                        result.toolchainInfo !== null && 
                        result.toolchainInfo.version !== 'Unknown';
        
        if (result.missingTools.length > 0) {
            result.errors.push(`Missing essential tools: ${result.missingTools.join(', ')}`);
        }
        
    } catch (error) {
        result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
}

export async function getArmToolchainInfo(toolchainPath: string): Promise<ToolchainInfo> {
    const defaultInfo: ToolchainInfo = {
        version: 'Unknown',
        gccPath: normalizePath(toolchainPath),
        rootPath: '',
        target: 'arm-none-eabi',
        detectedAt: Date.now()
    };
    
    if (!toolchainPath || !checkArmToolchainPath(toolchainPath)) {
        return defaultInfo;
    }
    
    return new Promise((resolve) => {
        const normalizedPath = normalizePath(toolchainPath);
        const command = `"${normalizedPath}" --version`;
        
        exec(command, { timeout: 5000 }, (error, stdout) => {
            if (error) {
                console.error('Error getting ARM toolchain version:', error);
                resolve(defaultInfo);
                return;
            }
            
            try {
                const info = parseVersionOutput(stdout, toolchainPath);
                info.detectedAt = Date.now();
                resolve(info);
            } catch (parseError) {
                console.error('Error parsing ARM toolchain version output:', parseError);
                resolve(defaultInfo);
            }
        });
    });
}