/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * STM32 设备型号检测
 * 从工作区里的 STM32CubeMX (.ioc) / STM32CubeIDE (.cproject) / CMake 工程文件中
 * 解析出 cortex-debug 配置所需的 device 字段（如 STM32H743ZITx）。
 *
 * @fileoverview Device name auto-detection
 * @author 左岚
 */

import * as fs from 'fs';
import * as path from 'path';
import type * as vscodeTypes from 'vscode';

export interface DetectedDevice {
    /** 完整型号字符串，如 STM32H743ZITx */
    device: string;
    /** 检测来源（相对于扫描根目录的路径） */
    source: string;
    /** 来源类型 */
    sourceType: 'ioc' | 'cproject' | 'cmake';
}

/** STM32 完整型号正则：STM32 + 系列字母 + 数字 + 至少一个后缀字母 */
const STM32_PART_REGEX = /STM32[A-Z]\w{2,}/;

/** 跳过扫描的目录（性能 + 噪音） */
const SKIP_DIRS = new Set(['node_modules', '.git', 'build', 'Debug', 'Release', '.vscode', 'out', '.cache']);

/** 单类型扫描的最大文件数，避免大仓库拖慢启动 */
const MAX_FILES_PER_TYPE = 10;

export function parseIoc(content: string): string | null {
    const match = content.match(/^Mcu\.UserName\s*=\s*(STM32\S+)\s*$/m);
    return match ? match[1] : null;
}

export function parseCproject(content: string): string | null {
    // CubeIDE 在 <option ... value="STM32F407ZGTx"/> 这种节点里写完整型号
    const match = content.match(/value="(STM32[A-Z]\w{4,})"/);
    return match ? match[1] : null;
}

export function parseCmake(content: string): string | null {
    // CubeMX 生成的 CMakeLists 通常只有 STM32H743xx 这种家族级宏，不够精确
    // 仅当能匹配到完整 part number（位号必须是大写字母，可带小写后缀如 STM32H743ZITx）
    const match = content.match(/STM32[A-Z]\d+[A-Z][A-Za-z0-9]+/);
    return match ? match[0] : null;
}

/** 收集 rootDir 下匹配 predicate 的文件路径，跳过 SKIP_DIRS */
async function walkAndCollect(
    rootDir: string,
    predicate: (name: string) => boolean,
    limit: number
): Promise<string[]> {
    const found: string[] = [];
    const stack: string[] = [rootDir];

    while (stack.length > 0 && found.length < limit) {
        const dir = stack.pop()!;
        let entries: fs.Dirent[];
        try {
            entries = await fs.promises.readdir(dir, { withFileTypes: true });
        } catch {
            continue;
        }

        for (const entry of entries) {
            if (found.length >= limit) {
                break;
            }
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!SKIP_DIRS.has(entry.name)) {
                    stack.push(full);
                }
            } else if (entry.isFile() && predicate(entry.name)) {
                found.push(full);
            }
        }
    }
    return found;
}

interface DetectorRule {
    predicate: (name: string) => boolean;
    parser: (content: string) => string | null;
    sourceType: DetectedDevice['sourceType'];
}

const RULES: DetectorRule[] = [
    {
        predicate: (n) => n.toLowerCase().endsWith('.ioc'),
        parser: parseIoc,
        sourceType: 'ioc'
    },
    {
        predicate: (n) => n === '.cproject',
        parser: parseCproject,
        sourceType: 'cproject'
    },
    {
        predicate: (n) => n === 'CMakeLists.txt',
        parser: parseCmake,
        sourceType: 'cmake'
    }
];

/**
 * 在指定目录扫描 STM32 设备型号（不依赖 VS Code API，可独立测试）
 * @param rootDir 扫描根目录
 * @returns 检测到的设备信息，未找到返回 null
 */
export async function detectStm32DeviceInDir(rootDir: string): Promise<DetectedDevice | null> {
    for (const rule of RULES) {
        const files = await walkAndCollect(rootDir, rule.predicate, MAX_FILES_PER_TYPE);
        for (const file of files) {
            try {
                const content = await fs.promises.readFile(file, 'utf8');
                const device = rule.parser(content);
                if (device && STM32_PART_REGEX.test(device)) {
                    return {
                        device,
                        source: path.relative(rootDir, file).replace(/\\/g, '/'),
                        sourceType: rule.sourceType
                    };
                }
            } catch (error) {
                console.warn(`[DeviceDetector] failed to read ${file}:`, error);
            }
        }
    }
    return null;
}

/**
 * 在 VS Code workspace 里检测 STM32 设备型号
 * 顺序：.ioc → .cproject → CMakeLists.txt
 *
 * @param folder 要扫描的 workspace folder，不传则使用第一个
 * @returns 检测到的设备信息，未找到返回 null
 */
export async function detectStm32Device(folder?: vscodeTypes.WorkspaceFolder): Promise<DetectedDevice | null> {
    // 延迟加载 vscode，便于 deviceDetector 在 Node 环境下被独立测试
    const vscode = require('vscode') as typeof vscodeTypes;
    const target = folder ?? vscode.workspace.workspaceFolders?.[0];
    if (!target) {
        return null;
    }
    return detectStm32DeviceInDir(target.uri.fsPath);
}
