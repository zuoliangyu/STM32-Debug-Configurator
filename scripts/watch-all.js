#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * 联合 watch：tsc --watch + 监听 src/webview 自动复制到 out/webview
 * 用法：npm run watch
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src', 'webview');
const OUT = path.resolve(__dirname, '..', 'out', 'webview');

function ensureDir(p) {
    fs.mkdirSync(p, { recursive: true });
}

function copyFileSafe(srcFile) {
    try {
        const rel = path.relative(SRC, srcFile);
        const dest = path.join(OUT, rel);
        ensureDir(path.dirname(dest));
        fs.copyFileSync(srcFile, dest);
        const ts = new Date().toISOString().substring(11, 19);
        console.log(`[${ts}] copied webview/${rel.replace(/\\/g, '/')}`);
    } catch (e) {
        console.warn('[watch-all] copy failed:', e.message);
    }
}

function copyAllOnce() {
    const walk = (dir) => {
        for (const name of fs.readdirSync(dir)) {
            const full = path.join(dir, name);
            const stat = fs.statSync(full);
            if (stat.isDirectory()) {
                walk(full);
            } else {
                copyFileSafe(full);
            }
        }
    };
    if (fs.existsSync(SRC)) {
        ensureDir(OUT);
        walk(SRC);
    }
}

// 1. 初始全量复制一次
copyAllOnce();

// 2. 起 tsc --watch
const tsc = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['tsc', '--watch', '-p', './'],
    { stdio: 'inherit' }
);

// 3. 监听 src/webview 变化，复制到 out
fs.watch(SRC, { recursive: true }, (eventType, filename) => {
    if (!filename) {
        return;
    }
    const full = path.join(SRC, filename);
    fs.stat(full, (err, stat) => {
        if (err || !stat.isFile()) {
            return;
        }
        copyFileSafe(full);
    });
});

console.log(`[watch-all] watching ${SRC} → ${OUT}`);

const cleanup = () => {
    tsc.kill();
    process.exit(0);
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
