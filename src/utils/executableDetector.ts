/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * 工作区固件文件检测
 * 在常见 build 输出目录里找 .elf / .axf / .bin / .hex，让用户在 webview 里挑选
 *
 * @fileoverview Firmware file auto-detection
 * @author 左岚
 */

import * as fs from 'fs';
import * as path from 'path';
import type * as vscodeTypes from 'vscode';

export type FirmwareKind = 'elf' | 'axf' | 'bin' | 'hex';

export interface DetectedExecutable {
    /** 工作区相对路径，比如 build/Debug/aa.elf */
    relativePath: string;
    /** 直接写进 launch.json 的格式：${workspaceFolder}/... */
    workspaceUri: string;
    /** 文件类型 */
    kind: FirmwareKind;
    /** 包含的目录类型（粗粒度，便于排序） */
    variant: 'Debug' | 'Release' | 'RelWithDebInfo' | 'other';
    /** 最近修改时间戳 */
    mtime: number;
    /** 文件大小（字节），便于 UI 上展示 */
    size: number;
}

const FIRMWARE_EXTS: FirmwareKind[] = ['elf', 'axf', 'bin', 'hex'];

/** 调试用：.elf / .axf 比 .bin / .hex 优先（前者带符号可断点） */
const KIND_RANK: Record<FirmwareKind, number> = {
    elf: 0,
    axf: 1,
    hex: 2,
    bin: 3
};

/** Debug 构建优先，因为有调试符号 */
const VARIANT_RANK: Record<DetectedExecutable['variant'], number> = {
    Debug: 0,
    RelWithDebInfo: 1,
    Release: 2,
    other: 3
};

/** 跳过扫描的目录。CMakeFiles 里有 CMake 探测编译器 ABI 用的小 .bin，不是真正的固件 */
const SKIP_DIRS = new Set(['node_modules', '.git', '.vscode', '.cache', 'CMakeFiles']);

/** 单类型扫描的最大文件数，防大仓库拖慢 */
const MAX_FILES = 30;

function classifyVariant(relPath: string): DetectedExecutable['variant'] {
    const lower = relPath.toLowerCase().replace(/\\/g, '/');
    if (/(^|\/)debug(\/|$)/.test(lower)) {
        return 'Debug';
    }
    if (/(^|\/)release(\/|$)/.test(lower)) {
        return 'Release';
    }
    if (/(^|\/)relwithdebinfo(\/|$)/.test(lower)) {
        return 'RelWithDebInfo';
    }
    return 'other';
}

function classifyKind(filename: string): FirmwareKind | null {
    const lower = filename.toLowerCase();
    for (const ext of FIRMWARE_EXTS) {
        if (lower.endsWith('.' + ext)) {
            return ext;
        }
    }
    return null;
}

async function walkAndCollect(rootDir: string): Promise<string[]> {
    const found: string[] = [];
    const stack: string[] = [rootDir];

    while (stack.length > 0 && found.length < MAX_FILES) {
        const dir = stack.pop()!;
        let entries: fs.Dirent[];
        try {
            entries = await fs.promises.readdir(dir, { withFileTypes: true });
        } catch {
            continue;
        }

        for (const entry of entries) {
            if (found.length >= MAX_FILES) {
                break;
            }
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!SKIP_DIRS.has(entry.name)) {
                    stack.push(full);
                }
            } else if (entry.isFile() && classifyKind(entry.name)) {
                found.push(full);
            }
        }
    }
    return found;
}

/**
 * 在指定目录下扫描所有固件文件（不依赖 vscode，可独立测试）
 * 排序规则：先按 variant（Debug 优先），再按 kind（elf/axf 优先），最后按修改时间倒序
 */
export async function detectExecutablesInDir(rootDir: string): Promise<DetectedExecutable[]> {
    const files = await walkAndCollect(rootDir);
    if (files.length === 0) {
        return [];
    }

    const items: DetectedExecutable[] = [];
    for (const file of files) {
        const kind = classifyKind(path.basename(file));
        if (!kind) {
            continue;
        }
        let stat: fs.Stats;
        try {
            stat = await fs.promises.stat(file);
        } catch {
            continue;
        }
        const rel = path.relative(rootDir, file).replace(/\\/g, '/');
        items.push({
            relativePath: rel,
            workspaceUri: '${workspaceFolder}/' + rel,
            kind,
            variant: classifyVariant(rel),
            mtime: stat.mtimeMs,
            size: stat.size
        });
    }

    items.sort((a, b) => {
        if (VARIANT_RANK[a.variant] !== VARIANT_RANK[b.variant]) {
            return VARIANT_RANK[a.variant] - VARIANT_RANK[b.variant];
        }
        if (KIND_RANK[a.kind] !== KIND_RANK[b.kind]) {
            return KIND_RANK[a.kind] - KIND_RANK[b.kind];
        }
        return b.mtime - a.mtime;
    });

    return items;
}

/**
 * 在 VS Code workspace 里检测固件文件
 */
export async function detectExecutables(folder?: vscodeTypes.WorkspaceFolder): Promise<DetectedExecutable[]> {
    const vscode = require('vscode') as typeof vscodeTypes;
    const target = folder ?? vscode.workspace.workspaceFolders?.[0];
    if (!target) {
        return [];
    }
    return detectExecutablesInDir(target.uri.fsPath);
}
