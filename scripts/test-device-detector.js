#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * deviceDetector 自动化测试
 * 在真实 STM32 工程上验证 detectStm32DeviceInDir 与各 parser 行为。
 *
 * 用法：node scripts/test-device-detector.js [project-dir]
 * 默认 project-dir = C:/Users/zuolan/Desktop/aa
 */

const path = require('path');
const fs = require('fs');
const assert = require('assert');

const distPath = path.join(__dirname, '..', 'out', 'utils', 'deviceDetector.js');
if (!fs.existsSync(distPath)) {
    console.error(`✗ ${distPath} not found. Run \`npm run compile\` first.`);
    process.exit(1);
}

const {
    detectStm32DeviceInDir,
    parseIoc,
    parseCproject,
    parseCmake
} = require(distPath);

const projectDir = process.argv[2] || 'C:/Users/zuolan/Desktop/aa';

let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
    try {
        await fn();
        passed++;
        results.push({ name, ok: true });
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failed++;
        results.push({ name, ok: false, err });
        console.log(`  ✗ ${name}`);
        console.log(`    ${err.message}`);
    }
}

async function main() {
    console.log('STM32 Device Detector — automated tests');
    console.log('='.repeat(60));

    console.log('\n[unit] parseIoc');
    await test('extracts STM32H743ZITx from Mcu.UserName line', () => {
        const sample = 'Mcu.Family=STM32H7\nMcu.Name=STM32H743ZITx\nMcu.UserName=STM32H743ZITx\n';
        assert.strictEqual(parseIoc(sample), 'STM32H743ZITx');
    });
    await test('returns null when UserName missing', () => {
        assert.strictEqual(parseIoc('Mcu.Family=STM32H7\n'), null);
    });
    await test('handles trailing whitespace', () => {
        assert.strictEqual(parseIoc('Mcu.UserName=STM32F407ZGTx   \n'), 'STM32F407ZGTx');
    });

    console.log('\n[unit] parseCproject');
    await test('extracts MCU from value attribute', () => {
        const xml = '<option superClass="x" value="STM32F407ZGTx" />';
        assert.strictEqual(parseCproject(xml), 'STM32F407ZGTx');
    });
    await test('returns null when no STM32 value', () => {
        assert.strictEqual(parseCproject('<option value="other" />'), null);
    });

    console.log('\n[unit] parseCmake');
    await test('extracts full part number', () => {
        assert.strictEqual(parseCmake('set(MCU STM32H743ZITx)'), 'STM32H743ZITx');
    });
    await test('rejects family-only macro like STM32H743xx', () => {
        // STM32H743xx 不算完整型号（缺位号），parseCmake 设计上要求 [A-Z][A-Z0-9]+ 结尾
        assert.strictEqual(parseCmake('STM32H743xx'), null);
    });

    console.log(`\n[integration] real project: ${projectDir}`);
    if (!fs.existsSync(projectDir)) {
        console.log(`  ⚠ project dir not found, skipping integration test`);
    } else {
        let result;
        await test('detectStm32DeviceInDir returns a result', async () => {
            result = await detectStm32DeviceInDir(projectDir);
            assert.ok(result, `expected detection result, got ${result}`);
        });
        if (result) {
            await test('detected device matches expected STM32H743ZITx', () => {
                assert.strictEqual(result.device, 'STM32H743ZITx');
            });
            await test('source type is ioc (preferred over cmake)', () => {
                assert.strictEqual(result.sourceType, 'ioc');
            });
            await test('source path points at aa.ioc', () => {
                assert.ok(
                    result.source.toLowerCase().endsWith('.ioc'),
                    `source ${result.source} did not end with .ioc`
                );
            });
            console.log(`    detected: ${result.device}  (source: ${result.source}, type: ${result.sourceType})`);
        }
    }

    console.log('\n[integration] non-existent dir returns null');
    await test('returns null for missing directory', async () => {
        const r = await detectStm32DeviceInDir(path.join(__dirname, '__nonexistent__'));
        assert.strictEqual(r, null);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${passed + failed}   Passed: ${passed}   Failed: ${failed}`);
    process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
