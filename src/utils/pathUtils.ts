/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * 路径处理工具模块
 * 提供跨平台路径处理、环境变量展开和通配符解析功能
 * 
 * @fileoverview 路径处理工具类
 * @author 左岚
 * @since 0.2.3
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * 展开路径中的环境变量和通配符
 * 解析路径中的%VAR%格式环境变量和*通配符
 * 
 * @param pathStr - 包含环境变量或通配符的路径字符串
 * @returns 展开后的路径数组，如果包含通配符则可能返回多个路径
 * @example
 * ```typescript
 * expandPath('%USERPROFILE%\\Tools\\bin\\executable.exe');
 * expandPath('C:\\Program Files\\Tool\\*\\bin\\executable.exe');
 * ```
 */
export function expandPath(pathStr: string): string[] {
    // Expand environment variables
    let expanded = pathStr.replace(/%([^%]+)%/g, (_, varName) => {
        return process.env[varName] || '';
    });
    
    // Handle USERPROFILE and LOCALAPPDATA specifically
    expanded = expanded.replace(/\$\{USERPROFILE\}/g, os.homedir());
    expanded = expanded.replace(/\$\{LOCALAPPDATA\}/g, process.env.LOCALAPPDATA || '');
    
    // If path contains wildcards, try to resolve them
    if (expanded.includes('*')) {
        return resolveWildcardPath(expanded);
    }
    
    return [expanded];
}

/**
 * 解析包含通配符的路径
 * 处理路径中的星号通配符，返回匹配的真实路径
 *
 * 仅处理第一个星号。星号必须出现在某一段路径里 (例如 dir/STAR/sub 或 dir/prefixSTAR/sub)。
 * 多个星号串联或跨段时不展开。
 *
 * @param pathWithWildcard - 包含星号通配符的路径
 * @returns 匹配的真实路径数组，按字符串倒序排列 (一般等同于"版本倒序")
 * @private
 */
function resolveWildcardPath(pathWithWildcard: string): string[] {
    try {
        const starIdx = pathWithWildcard.indexOf('*');
        const beforeStar = pathWithWildcard.substring(0, starIdx);
        const afterStar = pathWithWildcard.substring(starIdx + 1);

        // 找到星号左侧最近的分隔符。分隔符左边是要扫描的父目录，右边是 entry 名前缀。
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
        // 忽略展开错误
    }
    return [];
}

/**
 * 路径标准化函数
 * 将Windows风格的反斜杠路径转换为正斜杠，并处理路径格式
 * 
 * @param inputPath - 输入的文件路径
 * @returns 标准化后的路径，使用正斜杠分隔符
 * @example
 * ```typescript
 * normalizePath('C:\\Program Files\\tool\\bin\\executable.exe');
 * // 返回: 'C:/Program Files/tool/bin/executable.exe'
 * ```
 */
export function normalizePath(inputPath: string): string {
    if (!inputPath) {
        return '';
    }
    
    // 将反斜杠转换为正斜杠
    let normalized = inputPath.replace(/\\/g, '/');
    
    // 处理重复的斜杠
    normalized = normalized.replace(/\/+/g, '/');
    
    // 移除末尾的斜杠（除非是根路径）
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    
    return normalized;
}

/**
 * 检查文件路径是否存在且为文件
 * 安全地检查路径有效性，避免异常抛出
 * 
 * @param filePath - 要检查的文件路径
 * @returns 如果路径存在且为文件则返回true，否则返回false
 */
export function isValidExecutablePath(filePath: string): boolean {
    try {
        if (!filePath) {
            return false;
        }
        
        const normalizedPath = normalizePath(filePath);
        return fs.existsSync(normalizedPath) && fs.statSync(normalizedPath).isFile();
    } catch {
        return false;
    }
}

/**
 * 构建可执行文件路径
 * 根据平台自动添加正确的可执行文件扩展名
 * 
 * @param basePath - 基础路径（通常是bin目录）
 * @param executableName - 可执行文件名（不含扩展名）
 * @returns 完整的可执行文件路径
 */
export function buildExecutablePath(basePath: string, executableName: string): string {
    const extension = process.platform === 'win32' ? '.exe' : '';
    const fullName = executableName + extension;
    return path.join(basePath, fullName);
}