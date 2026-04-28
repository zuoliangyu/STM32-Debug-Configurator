/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * OpenOCD工具类模块
 * 提供OpenOCD路径检测和配置文件读取功能
 * 支持Windows、macOS和Linux平台的OpenOCD安装检测
 * 
 * @fileoverview OpenOCD工具类
 * @author 左岚
 * @since 0.1.0
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import * as vscode from 'vscode';
import { findOpenOCDPathEnhanced } from './openocdEnvHelper';

// OpenOCD环境变量检测已移至 openocdEnvHelper.ts

/**
 * Windows平台上常见的OpenOCD安装路径
 * 包括STM32CubeIDE、独立安装、xPack等各种安装方式
 */
const COMMON_OPENOCD_PATHS = [
    // STM32 VS Code Extension 自动下载的 OpenOCD bundle
    '%LOCALAPPDATA%\\stm32cube\\bundles\\openocd\\*\\bin\\openocd.exe',
    // STM32CubeIDE installations
    'C:\\ST\\STM32CubeIDE_*\\STM32CubeIDE\\plugins\\com.st.stm32cube.ide.mcu.externaltools.openocd.win32_*\\tools\\bin\\openocd.exe',
    // Standalone OpenOCD installations
    'C:\\OpenOCD\\bin\\openocd.exe',
    'C:\\Program Files\\OpenOCD\\bin\\openocd.exe',
    'C:\\Program Files (x86)\\OpenOCD\\bin\\openocd.exe',
    // xPack OpenOCD installations
    '%USERPROFILE%\\AppData\\Roaming\\xPacks\\@xpack-dev-tools\\openocd\\*\\bin\\openocd.exe',
    '%LOCALAPPDATA%\\xPacks\\@xpack-dev-tools\\openocd\\*\\bin\\openocd.exe',
    // User local installations
    '%USERPROFILE%\\OpenOCD\\bin\\openocd.exe',
    '%USERPROFILE%\\Tools\\OpenOCD\\bin\\openocd.exe'
];

/**
 * 展开路径中的环境变量和通配符
 * 解析路径中的%VAR%格式环境变量和*通配符
 * 
 * @param pathStr - 包含环境变量或通配符的路径字符串
 * @returns 展开后的路径数组，如果包含通配符则可能返回多个路径
 * @example
 * ```typescript
 * expandPath('%USERPROFILE%\\OpenOCD\\bin\\openocd.exe');
 * expandPath('C:\\ST\\STM32CubeIDE_*\\tools\\bin\\openocd.exe');
 * ```
 * @private
 */
function expandPath(pathStr: string): string[] {
    // Expand environment variables
    let expanded = pathStr.replace(/%([^%]+)%/g, (_, varName) => {
        return process.env[varName] || '';
    });

    // Handle USERPROFILE specifically
    expanded = expanded.replace(/\$\{USERPROFILE\}/g, os.homedir());
    expanded = expanded.replace(/\$\{LOCALAPPDATA\}/g, process.env.LOCALAPPDATA || '');

    if (!expanded.includes('*')) {
        return [expanded];
    }

    try {
        const starIdx = expanded.indexOf('*');
        const beforeStar = expanded.substring(0, starIdx);
        const afterStar = expanded.substring(starIdx + 1);

        const lastSepIdx = Math.max(beforeStar.lastIndexOf('/'), beforeStar.lastIndexOf('\\'));
        if (lastSepIdx < 0) {
            return [];
        }
        const baseDir = beforeStar.substring(0, lastSepIdx);
        const namePrefix = beforeStar.substring(lastSepIdx + 1);

        if (!baseDir || !fs.existsSync(baseDir)) {
            return [];
        }

        const entries = fs.readdirSync(baseDir);
        const matches: string[] = [];
        for (const entry of entries) {
            if (namePrefix && !entry.startsWith(namePrefix)) {
                continue;
            }
            const testPath = path.join(baseDir, entry) + afterStar;
            if (fs.existsSync(testPath)) {
                matches.push(testPath);
            }
        }
        return matches.sort().reverse();
    } catch (error) {
        // Ignore glob expansion errors
    }
    return [];
}

/**
 * 检查指定路径是否存在OpenOCD可执行文件
 * 验证路径是否存在并且是一个文件
 * 
 * @param execPath - 要检查的OpenOCD可执行文件路径
 * @returns 如果路径存在且为文件则返回true，否则返回false
 * @private
 */
function checkOpenOCDPath(execPath: string): boolean {
    try {
        if (!execPath || !execPath.trim()) {
            return false;
        }
        const exists = fs.existsSync(execPath);
        if (!exists) {
            return false;
        }
        const stats = fs.statSync(execPath);
        return stats.isFile();
    } catch (error) {
        return false;
    }
}

// 环境变量检测功能已移至 openocdEnvHelper.ts

/**
 * 使用多种检测方法查找OpenOCD路径
 * 按以下顺序检测：
 * 1. 用户配置的路径
 * 2. OpenOCD专用环境变量（OPENOCD_PATH, OPENOCD_HOME等）
 * 3. PATH环境变量直接扫描
 * 4. where/which命令（备用方案）
 * 5. 常见安装路径（仅Windows）
 * 
 * @returns OpenOCD可执行文件的完整路径，如果未找到则返回null
 * @example
 * ```typescript
 * const openocdPath = await findOpenOCDPath();
 * if (openocdPath) {
 *   console.log('Found OpenOCD at:', openocdPath);
 * } else {
 *   console.log('OpenOCD not found');
 * }
 * ```
 * @since 0.1.0
 */
export function findOpenOCDPath(): Promise<string | null> {
    // 优先使用增强的检测逻辑
    return findOpenOCDPathEnhanced().then(result => {
        if (result) {
            return result;
        }
        
        // 如果增强检测未找到，则使用传统方法作为备用
        return new Promise((resolve) => {
            console.log('[OpenOCD检测] 使用传统方法作为备用...');
            
            // 检查常见安装路径（仅Windows）
            if (process.platform === 'win32') {
                console.log('[OpenOCD检测] 检查Windows常见安装路径...');
                for (const pathTemplate of COMMON_OPENOCD_PATHS) {
                    const expandedPaths = expandPath(pathTemplate);
                    for (const testPath of expandedPaths) {
                        if (checkOpenOCDPath(testPath)) {
                            console.log(`[OpenOCD检测] ✓ 在常见路径中找到OpenOCD: ${testPath}`);
                            resolve(testPath);
                            return;
                        }
                    }
                }
                console.log('[OpenOCD检测] 在常见安装路径中未找到OpenOCD');
            }
            
            // 最终未找到
            console.log('[OpenOCD检测] ✗ 所有方法都未能找到OpenOCD');
            resolve(null);
        });
    });
}

/**
 * 从给定根目录向下搜索 scripts 目录
 * 限制搜索深度避免遍历整个磁盘
 */
function findScriptsDirRecursive(
    root: string,
    maxDepth: number,
    isMatch: (p: string) => boolean
): string | undefined {
    if (maxDepth < 0) {
        return undefined;
    }
    let entries: fs.Dirent[];
    try {
        entries = fs.readdirSync(root, { withFileTypes: true });
    } catch {
        return undefined;
    }
    for (const entry of entries) {
        if (!entry.isDirectory()) {
            continue;
        }
        const sub = path.join(root, entry.name);
        if (isMatch(sub)) {
            return sub;
        }
        const nested = findScriptsDirRecursive(sub, maxDepth - 1, isMatch);
        if (nested) {
            return nested;
        }
    }
    return undefined;
}

/**
 * 获取OpenOCD配置文件
 * 根据OpenOCD可执行文件路径，读取其scripts目录下的接口和目标配置文件
 * 
 * @param openocdExePath - OpenOCD可执行文件的完整路径
 * @returns 包含接口和目标配置文件名列表的对象
 * @returns interfaces - 可用的接口配置文件名数组
 * @returns targets - 可用的目标配置文件名数组
 * @throws {Error} 当读取配置文件失败时记录错误并返回空数组
 * @example
 * ```typescript
 * const configs = await getOpenOCDConfigFiles('/path/to/openocd.exe');
 * console.log('Interfaces:', configs.interfaces);
 * console.log('Targets:', configs.targets);
 * ```
 * @since 0.1.0
 */
export async function getOpenOCDConfigFiles(openocdExePath: string): Promise<{ interfaces: string[], targets: string[] }> {
    if (!openocdExePath) {
        return { interfaces: [], targets: [] };
    }

    try {
        const binDir = path.dirname(openocdExePath);
        const installRoot = path.dirname(binDir);

        // OpenOCD scripts 目录的常见布局：
        //   xpack:                <root>/scripts/
        //   官方 / sysprogs:      <root>/share/openocd/scripts/
        //   解压时多嵌一层 openocd: <root>/openocd/scripts/  或  <root>/openocd/share/openocd/scripts/
        //   极少见的并列布局:      <binDir>/scripts/
        //   显式环境变量:          OPENOCD_SCRIPTS
        const candidates = [
            process.env.OPENOCD_SCRIPTS,
            path.join(installRoot, 'share', 'openocd', 'scripts'),
            path.join(installRoot, 'scripts'),
            path.join(installRoot, 'openocd', 'scripts'),
            path.join(installRoot, 'openocd', 'share', 'openocd', 'scripts'),
            path.join(binDir, 'scripts')
        ].filter((p): p is string => !!p);

        const isValidScriptsDir = (p: string): boolean => {
            try {
                return fs.existsSync(p)
                    && fs.existsSync(path.join(p, 'interface'))
                    && fs.existsSync(path.join(p, 'target'));
            } catch {
                return false;
            }
        };

        let scriptsPath = candidates.find(isValidScriptsDir);

        // 兜底：以安装根为起点向下扫两层，找到第一个同时含 interface/ 和 target/ 的目录
        if (!scriptsPath) {
            scriptsPath = findScriptsDirRecursive(installRoot, 2, isValidScriptsDir);
        }

        if (!scriptsPath) {
            console.warn(
                `[OpenOCD] 未在 ${openocdExePath} 附近找到 scripts 目录，已尝试: ${candidates.join(', ')}`
            );
            return { interfaces: [], targets: [] };
        }

        console.log(`[OpenOCD] 使用 scripts 目录: ${scriptsPath}`);

        const interfaceDir = path.join(scriptsPath, 'interface');
        const targetDir = path.join(scriptsPath, 'target');

        /**
         * 安全读取目录中的.cfg文件
         * 在读取目录失败时返回空数组而不抛出异常
         * 
         * @param dir - 要读取的目录路径
         * @returns 目录中所有.cfg文件名的数组
         */
        const readDirSafe = async (dir: string): Promise<string[]> => {
            try {
                const files = await fs.promises.readdir(dir);
                return files.filter(f => f.endsWith('.cfg'));
            } catch {
                return [];
            }
        };

        const interfaces = await readDirSafe(interfaceDir);
        const targets = await readDirSafe(targetDir);

        return { interfaces, targets };

    } catch (e) {
        console.error("Error reading OpenOCD scripts directory:", e);
        return { interfaces: [], targets: [] };
    }
}