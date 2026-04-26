#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * armToolchain helpers 测试
 * 验证 ST bundle 路径识别 + 可移植路径转换
 */

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const Module = require('module');

// 把 require('vscode') 拦截成空对象，让被测模块在 Node 环境下能被 require
const stubPath = path.join(__dirname, '_vscode-stub.js');
fs.writeFileSync(
    stubPath,
    'module.exports = { workspace: { getConfiguration: () => ({ get: () => null }) } };\n'
);
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
    if (request === 'vscode') {
        return stubPath;
    }
    return origResolve.call(this, request, ...rest);
};

const distPath = path.join(__dirname, '..', 'out', 'utils', 'armToolchain.js');
if (!fs.existsSync(distPath)) {
    console.error(`✗ ${distPath} not found. Run \`npm run compile\` first.`);
    cleanup();
    process.exit(1);
}

const { isStBundleArmToolchainPath, toPortableArmToolchainPath, deriveGdbPath } = require(distPath);
const { expandPath } = require(path.join(__dirname, '..', 'out', 'utils', 'pathUtils.js'));

function cleanup() {
    try { fs.unlinkSync(stubPath); } catch {}
}

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failed++;
        console.log(`  ✗ ${name}\n    ${err.message}`);
    }
}

const localAppData = process.env.LOCALAPPDATA;
if (!localAppData) {
    console.log('LOCALAPPDATA not set; skipping (Windows-only).');
    cleanup();
    process.exit(0);
}

console.log('armToolchain helpers — automated tests');
console.log('='.repeat(60));

const stBundleBin = path.join(localAppData, 'stm32cube/bundles/gnu-tools-for-stm32/13.3.1+st.9/bin').replace(/\\/g, '/');
const stBundleGcc = stBundleBin + '/arm-none-eabi-gcc.exe';
const independentGcc = 'E:/path/c_c++/Arm GNU Toolchain arm-none-eabi/bin/arm-none-eabi-gcc.exe';

console.log('\n[unit] isStBundleArmToolchainPath');
test('returns true for ST bundle bin path', () => {
    assert.strictEqual(isStBundleArmToolchainPath(stBundleBin), true);
});
test('returns true for ST bundle gcc.exe path', () => {
    assert.strictEqual(isStBundleArmToolchainPath(stBundleGcc), true);
});
test('returns false for unrelated absolute path', () => {
    assert.strictEqual(isStBundleArmToolchainPath(independentGcc), false);
});
test('case-insensitive on the prefix', () => {
    const upper = stBundleBin.toUpperCase();
    assert.strictEqual(isStBundleArmToolchainPath(upper), true);
});

console.log('\n[unit] toPortableArmToolchainPath');
test('converts ST bundle bin path to ${env:LOCALAPPDATA}/...', () => {
    const result = toPortableArmToolchainPath(stBundleBin);
    assert.strictEqual(result, '${env:LOCALAPPDATA}/stm32cube/bundles/gnu-tools-for-stm32/13.3.1+st.9/bin');
});
test('converts ST bundle gcc.exe path to ${env:LOCALAPPDATA}/...', () => {
    const result = toPortableArmToolchainPath(stBundleGcc);
    assert.strictEqual(result, '${env:LOCALAPPDATA}/stm32cube/bundles/gnu-tools-for-stm32/13.3.1+st.9/bin/arm-none-eabi-gcc.exe');
});
test('leaves non-bundle path unchanged', () => {
    assert.strictEqual(toPortableArmToolchainPath(independentGcc), independentGcc);
});

console.log('\n[unit] deriveGdbPath');
test('derives gdb from gcc.exe path inside ST bundle (returns portable form)', () => {
    const result = deriveGdbPath(stBundleGcc);
    assert.strictEqual(
        result,
        '${env:LOCALAPPDATA}/stm32cube/bundles/gnu-tools-for-stm32/13.3.1+st.9/bin/arm-none-eabi-gdb.exe'
    );
});
test('derives gdb from bin dir path inside ST bundle', () => {
    const result = deriveGdbPath(stBundleBin);
    assert.strictEqual(
        result,
        '${env:LOCALAPPDATA}/stm32cube/bundles/gnu-tools-for-stm32/13.3.1+st.9/bin/arm-none-eabi-gdb.exe'
    );
});
test('derives gdb from non-bundle gcc.exe path (absolute)', () => {
    const result = deriveGdbPath(independentGcc);
    assert.strictEqual(
        result,
        'E:/path/c_c++/Arm GNU Toolchain arm-none-eabi/bin/arm-none-eabi-gdb.exe'
    );
});

console.log('\n[integration] expandPath wildcard against real ST bundle');
const stBundleGlob = '%LOCALAPPDATA%\\stm32cube\\bundles\\gnu-tools-for-stm32\\*\\bin\\arm-none-eabi-gcc.exe';
const matches = expandPath(stBundleGlob);
test('finds at least one ST bundle gcc.exe via wildcard', () => {
    assert.ok(
        matches.length > 0,
        `expected ≥1 match, got ${JSON.stringify(matches)}`
    );
});
test('all matches actually exist on disk', () => {
    matches.forEach((m) => {
        assert.ok(fs.existsSync(m), `${m} should exist`);
    });
});
console.log(`    expanded ${matches.length} match(es): ${matches.join(', ')}`);

console.log('\n' + '='.repeat(60));
console.log(`Total: ${passed + failed}   Passed: ${passed}   Failed: ${failed}`);

cleanup();
process.exit(failed > 0 ? 1 : 0);
