#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * target.cfg 智能匹配的纯逻辑测试
 * 把 main.js 里 inferTargetCfg 的逻辑复刻一份在这里测，避免引入 DOM 依赖
 */

const assert = require('assert');

function inferTargetCfg(deviceName, availableTargets) {
    if (!deviceName || !Array.isArray(availableTargets) || availableTargets.length === 0) {
        return null;
    }
    const m = deviceName.match(/^STM32([A-Z])(\d)/i);
    if (!m) {
        return null;
    }
    const series = (m[1] + m[2]).toLowerCase();
    const partMatch = deviceName.match(/^STM32([A-Z]\d+)/i);
    const candidates = [
        `stm32${series}x.cfg`,
        `stm32${series}xx.cfg`
    ];
    if (partMatch) {
        candidates.unshift(`stm32${partMatch[1].toLowerCase()}.cfg`);
    }
    const lookup = new Map(availableTargets.map((t) => [t.toLowerCase(), t]));
    for (const c of candidates) {
        if (lookup.has(c)) {
            return lookup.get(c);
        }
    }
    return null;
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

console.log('inferTargetCfg — automated tests');
console.log('='.repeat(60));

const realisticTargets = [
    'stm32f1x.cfg', 'stm32f2x.cfg', 'stm32f3x.cfg', 'stm32f4x.cfg', 'stm32f7x.cfg',
    'stm32g0x.cfg', 'stm32g4x.cfg', 'stm32h7x.cfg', 'stm32l0.cfg', 'stm32l1.cfg',
    'stm32l4x.cfg', 'stm32l5x.cfg', 'stm32u5x.cfg', 'stm32wbx.cfg', 'stm32wlx.cfg',
    '1986ве1т.cfg', 'altera-fpgasoc.cfg'
];

console.log('\n[unit] series mapping');
test('STM32H743ZITx → stm32h7x.cfg', () => {
    assert.strictEqual(inferTargetCfg('STM32H743ZITx', realisticTargets), 'stm32h7x.cfg');
});
test('STM32F407ZGTx → stm32f4x.cfg', () => {
    assert.strictEqual(inferTargetCfg('STM32F407ZGTx', realisticTargets), 'stm32f4x.cfg');
});
test('STM32F103C8 → stm32f1x.cfg', () => {
    assert.strictEqual(inferTargetCfg('STM32F103C8', realisticTargets), 'stm32f1x.cfg');
});
test('STM32L432KCU6 → stm32l4x.cfg', () => {
    assert.strictEqual(inferTargetCfg('STM32L432KCU6', realisticTargets), 'stm32l4x.cfg');
});
test('STM32G474RE → stm32g4x.cfg', () => {
    assert.strictEqual(inferTargetCfg('STM32G474RE', realisticTargets), 'stm32g4x.cfg');
});
test('STM32U585AII6Q → stm32u5x.cfg', () => {
    assert.strictEqual(inferTargetCfg('STM32U585AII6Q', realisticTargets), 'stm32u5x.cfg');
});

console.log('\n[unit] device-specific cfg wins over series-wide cfg');
test('STM32H743ZITx prefers stm32h743.cfg if present', () => {
    const targets = ['stm32h7x.cfg', 'stm32h743.cfg'];
    assert.strictEqual(inferTargetCfg('STM32H743ZITx', targets), 'stm32h743.cfg');
});

console.log('\n[unit] no-match cases');
test('returns null when device name is empty', () => {
    assert.strictEqual(inferTargetCfg('', realisticTargets), null);
});
test('returns null when targets list is empty', () => {
    assert.strictEqual(inferTargetCfg('STM32H743ZITx', []), null);
});
test('returns null when no cfg matches the series', () => {
    assert.strictEqual(inferTargetCfg('STM32X999', realisticTargets), null);
});
test('returns null for non-STM32 names', () => {
    assert.strictEqual(inferTargetCfg('1986ве1т', realisticTargets), null);
});

console.log('\n[unit] case insensitivity');
test('matches case-insensitively against target list', () => {
    const targets = ['STM32H7X.cfg', 'other.cfg'];
    assert.strictEqual(inferTargetCfg('STM32H743ZITx', targets), 'STM32H7X.cfg');
});

console.log('\n' + '='.repeat(60));
console.log(`Total: ${passed + failed}   Passed: ${passed}   Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
