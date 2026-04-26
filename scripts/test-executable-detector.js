#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * executableDetector 自动化测试
 */

const path = require('path');
const fs = require('fs');
const assert = require('assert');

const distPath = path.join(__dirname, '..', 'out', 'utils', 'executableDetector.js');
if (!fs.existsSync(distPath)) {
    console.error(`✗ ${distPath} not found. Run \`npm run compile\` first.`);
    process.exit(1);
}

const { detectExecutablesInDir } = require(distPath);
const projectDir = process.argv[2] || 'C:/Users/zuolan/Desktop/aa';

let passed = 0;
let failed = 0;

async function test(name, fn) {
    try {
        await fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failed++;
        console.log(`  ✗ ${name}\n    ${err.message}`);
    }
}

async function main() {
    console.log('executableDetector — automated tests');
    console.log('='.repeat(60));

    if (!fs.existsSync(projectDir)) {
        console.log(`⚠ project dir ${projectDir} not found, skipping integration test`);
        process.exit(0);
    }

    console.log(`\n[integration] real project: ${projectDir}`);
    let result;
    await test('detectExecutablesInDir returns at least one firmware file', async () => {
        result = await detectExecutablesInDir(projectDir);
        assert.ok(result.length > 0, `expected ≥1 firmware file, got ${result.length}`);
    });
    if (result && result.length > 0) {
        await test('top candidate is .elf in build/Debug', () => {
            const top = result[0];
            assert.strictEqual(top.kind, 'elf');
            assert.strictEqual(top.variant, 'Debug');
        });
        await test('workspaceUri uses ${workspaceFolder}/...', () => {
            assert.ok(
                result[0].workspaceUri.startsWith('${workspaceFolder}/'),
                `bad workspaceUri: ${result[0].workspaceUri}`
            );
        });
        await test('all entries have positive size and mtime', () => {
            for (const item of result) {
                assert.ok(item.size > 0, `${item.relativePath} has 0 size`);
                assert.ok(item.mtime > 0, `${item.relativePath} has 0 mtime`);
            }
        });
        console.log('\n  Detected files (sorted):');
        for (const item of result) {
            const sizeKb = (item.size / 1024).toFixed(1);
            console.log(`    [${item.variant}] ${item.relativePath} · ${item.kind.toUpperCase()} · ${sizeKb} KB`);
        }
    }

    console.log('\n[integration] non-existent dir returns empty array');
    await test('returns [] for missing directory', async () => {
        const r = await detectExecutablesInDir(path.join(__dirname, '__nonexistent__'));
        assert.ok(Array.isArray(r) && r.length === 0);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${passed + failed}   Passed: ${passed}   Failed: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
