/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * 中文本地化字符串模块
 * 定义STM32调试配置器扩展的所有中文界面文本
 * 包括表单标签、按钮文本、提示信息等
 * 
 * @fileoverview 中文本地化字符串
 * @author 左岚
 * @since 0.1.0
 */

import { LocalizedStrings } from './index';

/**
 * 中文本地化字符串对象
 * 包含扩展所有用户界面文本的中文版本
 */
export const zh: LocalizedStrings = {
    // Main UI
    title: "STM32 调试配置",
    subtitle: "请填写下方详细信息，为 Cortex-Debug 生成 `launch.json` 配置。",
    generateButton: "生成配置",
    
    // Form labels
    elfSource: "可执行文件 (.elf) 路径来源",
    autoDetectElf: "自动检测 (需要ST的STM32扩展)",
    manualElf: "手动路径",
    manualElfPath: "手动 .elf 路径",
    deviceName: "设备名称 (和你的设备名称保持一致，比如STM32F407ZG )",
    gdbServer: "GDB 服务器",
    openocdPath: "OpenOCD 路径 (使用OpenOCD时必须)",
    openocdPathOptional: "OpenOCD 路径 (使用OpenOCD时必须)",
    browseButton: "浏览",
    envSetupButton: "环境配置",
    searchInterface: "搜索接口文件...",
    searchTarget: "搜索目标文件...",
    scanButton: "扫描",
    viewEnvGuide: "查看环境配置指南",
    interfaceFile: "接口文件",
    targetFile: "目标文件 / ID",
    svdFile: "SVD 文件路径 (可选)",
    adapterSpeed: "适配器速度 (kHz)",
    
    // Live Watch
    liveWatchEnable: "启用实时监视",
    liveWatchVariables: "监视变量",
    liveWatchFrequency: "更新频率 (采样/秒)",
    liveWatchVariablesPlaceholder: "输入变量名 (每行一个或逗号分隔):\nvariable1\nvariable2\nmyStruct.field",
    liveWatchVariablesHelp: "指定要实时监控的全局变量、函数参数或结构体字段",
    liveWatchFrequencyHelp: "更高的值提供更频繁的更新，但可能影响调试性能",
    addVariable: "添加变量",
    removeVariable: "移除",
    variableName: "变量名",
    currentVariables: "当前变量",
    
    // Language switching
    language: "语言",
    switchToEnglish: "English",
    switchToChinese: "中文",
    
    // Messages
    noOpenocdFound: "未找到 OpenOCD。",
    downloadOpenocd: "点此下载",
    openocdDetected: "OpenOCD 检测到位置:",
    configGenerated: "launch.json 已成功更新!",
    liveWatchStatus: "实时监视已启用，{0} 个变量，频率 {1}Hz。",
    variableAdded: "变量 '{0}' 添加成功",
    variableRemoved: "变量 '{0}' 移除成功",
    
    // ARM Toolchain
    armToolchainPath: "ARM 工具链路径 (使用OpenOCD时必须)",
    noArmToolchainFound: "未找到 ARM 工具链。",
    armToolchainDetected: "ARM 工具链检测到位置:",
    
    // Placeholders and help text
    devicePlaceholder: "例如: STM32F407ZG",
    deviceDetectedHint: "已从 {1} 自动识别为 {0}",
    armToolchainCandidates: "检测到多个工具链（选择切换）",
    transportInterface: "传输方式",
    cardProject: "项目",
    cardDevice: "目标设备",
    cardGdbServer: "GDB 服务器",
    cardToolchain: "ARM 工具链",
    cardAdvanced: "高级选项",
    executable: "可执行文件 (.elf / .axf / .bin / .hex)",
    executablePlaceholder: "${workspaceFolder}/build/Debug/project.elf",
    executablePickHint: "— 选择一个固件文件 —",
    executableDetectedHint: "扫描到 {0} 个固件文件；当前使用 {1}",
    cfgPickerSearch: "输入关键词过滤…",
    cfgPickerEmpty: "没有匹配项",
    cfgPickerNoOptions: "请先填写有效的 OpenOCD 路径以加载 cfg 文件",
    svdPlaceholder: "例如: ${workspaceFolder}/STM32F407.svd",
    autoDetecting: "自动检测中...",
    autoDetectionFailed: "自动检测失败。请手动指定路径。",
    noCfgFiles: "未找到 .cfg 文件",
    providePath: "请提供有效的 OpenOCD 路径以填充...",
    
    // Footer
    createdBy: "由 左岚 创建",
    
    // Additional messages
    noVariables: "尚未添加变量",
    
    // 工具链检测
    toolchainDetectionTitle: "工具链检测",
    detectingToolchains: "正在检测工具链...",
    toolchainDetectionComplete: "工具链检测完成",
    openocdDetectionStatus: "OpenOCD 检测状态",
    armToolchainDetectionStatus: "ARM 工具链检测状态",
    detectionSuccess: "成功",
    detectionFailed: "失败", 
    notFound: "未找到",
    foundAt: "检测到位置",
    version: "版本",
    target: "目标",
    downloadOpenOCD: "下载 OpenOCD",
    downloadArmToolchain: "下载 ARM 工具链",
    configureManually: "手动配置",
    continue: "继续",
    cancel: "取消",
    confirmPath: "确认路径",
    enterPathManually: "手动输入路径",
    selectPath: "选择路径",
    invalidPath: "路径无效",
    configurationSaved: "配置已保存",
    toolchainConfiguration: "工具链配置",
    autoDetectionResults: "自动检测和配置工具链",
    recommendedDownloadLinks: "推荐下载链接",
    toolchainDetectionWizard: "工具链检测向导",
    
    // 新的工具链设置按钮
    setupToolchain: "设置工具链",
    detectArmToolchain: "检测 ARM 工具链",
    toolchainSetupTitle: "工具链设置",
    automaticDetection: "自动检测",
    manualConfiguration: "手动配置",
    setupToolchainDescription: "为 STM32 调试配置 ARM 开发工具链",
    detectToolchainDescription: "自动检测和配置 ARM 工具链和 OpenOCD",
    manualConfigDescription: "在设置中手动指定工具链路径",
    toolchainSetupFailed: "工具链设置失败",
    toolchainSetupSuccess: "工具链设置成功完成",
    
    // 路径验证错误消息
    openocdPathRequired: "使用 OpenOCD 时必须配置 OpenOCD 路径！",
    armToolchainPathRequired: "使用 OpenOCD 时必须配置 ARM 工具链路径！",
    configurationBlocked: "配置创建已阻止，请先配置必需的工具链路径。",
    missingToolchainPaths: "缺少必需的工具链路径"
};