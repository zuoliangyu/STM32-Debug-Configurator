/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * 本地化字符串接口模块
 * 定义扩展的本地化字符串结构，确保所有语言版本都包含相同的键
 * 用于约束中文和英文本地化文件的结构一致性
 * 
 * @fileoverview 本地化字符串接口定义
 * @author 左岚
 * @since 0.1.0
 */

/**
 * 本地化字符串接口
 * 定义扩展中所有可本地化的字符串的键名和类型
 * 所有语言版本都必须实现此接口以确保一致性
 * 
 * @interface LocalizedStrings
 * @since 0.1.0
 */
export interface LocalizedStrings {
    // 主界面文本
    /** 主标题 */
    title: string;
    /** 副标题 */
    subtitle: string;
    /** 生成按钮文本 */
    generateButton: string;
    
    // 表单标签
    /** ELF文件来源 */
    elfSource: string;
    /** 自动检测ELF文件 */
    autoDetectElf: string;
    /** 手动指定ELF文件 */
    manualElf: string;
    /** 手动ELF路径 */
    manualElfPath: string;
    /** 设备名称 */
    deviceName: string;
    /** GDB服务器 */
    gdbServer: string;
    /** OpenOCD路径 */
    openocdPath: string;
    /** OpenOCD路径（可选） */
    openocdPathOptional: string;
    /** ARM工具链路径（可选） */
    armToolchainPath: string;
    /** 浏览按钮 */
    browseButton: string;
    /** 环境配置按钮 */
    envSetupButton: string;
    /** 搜索接口文件 */
    searchInterface: string;
    /** 搜索目标文件 */
    searchTarget: string;
    /** 扫描按钮 */
    scanButton: string;
    /** 查看环境配置指南 */
    viewEnvGuide: string;
    /** 接口文件 */
    interfaceFile: string;
    /** 目标文件/ID */
    targetFile: string;
    /** SVD文件 */
    svdFile: string;
    /** 适配器速度 */
    adapterSpeed: string;
    
    // 实时监视
    /** 启用实时监视 */
    liveWatchEnable: string;
    /** 监视变量 */
    liveWatchVariables: string;
    /** 更新频率 */
    liveWatchFrequency: string;
    /** 变量占位符 */
    liveWatchVariablesPlaceholder: string;
    /** 变量帮助信息 */
    liveWatchVariablesHelp: string;
    /** 频率帮助信息 */
    liveWatchFrequencyHelp: string;
    /** 添加变量按钮 */
    addVariable: string;
    /** 移除变量按钮 */
    removeVariable: string;
    /** 变量名称 */
    variableName: string;
    /** 当前变量 */
    currentVariables: string;
    
    // 语言切换
    /** 语言设置 */
    language: string;
    /** 切换到英文 */
    switchToEnglish: string;
    /** 切换到中文 */
    switchToChinese: string;
    
    // 消息文本
    /** 未OpenOCD未找到 */
    noOpenocdFound: string;
    /** ARM工具链未找到 */
    noArmToolchainFound: string;
    /** 下载OpenOCD链接 */
    downloadOpenocd: string;
    /** OpenOCD检测到 */
    openocdDetected: string;
    /** ARM工具链检测到 */
    armToolchainDetected: string;
    /** 配置生成成功 */
    configGenerated: string;
    /** 实时监视状态 */
    liveWatchStatus: string;
    /** 变量添加成功 */
    variableAdded: string;
    /** 变量移除成功 */
    variableRemoved: string;
    
    // 占位符和帮助文本
    /** 设备名占位符 */
    devicePlaceholder: string;
    /** 自动检测到设备型号的提示 */
    deviceDetectedHint: string;
    /** SVD文件占位符 */
    svdPlaceholder: string;
    /** 自动检测中 */
    autoDetecting: string;
    /** 自动检测失败 */
    autoDetectionFailed: string;
    /** 没有配置文件 */
    noCfgFiles: string;
    /** 请提供路径 */
    providePath: string;
    
    // 页脚
    /** 创作者 */
    createdBy: string;
    
    // 附加消息
    /** 没有变量 */
    noVariables: string;
    
    // 工具链检测
    /** 工具链检测标题 */
    toolchainDetectionTitle: string;
    /** 检测工具链中 */
    detectingToolchains: string;
    /** 工具链检测完成 */
    toolchainDetectionComplete: string;
    /** OpenOCD检测状态 */
    openocdDetectionStatus: string;
    /** ARM工具链检测状态 */
    armToolchainDetectionStatus: string;
    /** 检测成功 */
    detectionSuccess: string;
    /** 检测失败 */
    detectionFailed: string;
    /** 未找到 */
    notFound: string;
    /** 找到于 */
    foundAt: string;
    /** 版本 */
    version: string;
    /** 目标 */
    target: string;
    /** 下载OpenOCD */
    downloadOpenOCD: string;
    /** 下载ARM工具链 */
    downloadArmToolchain: string;
    /** 手动配置路径 */
    configureManually: string;
    /** 继续 */
    continue: string;
    /** 取消 */
    cancel: string;
    /** 确认路径 */
    confirmPath: string;
    /** 手动输入路径 */
    enterPathManually: string;
    /** 选择路径 */
    selectPath: string;
    /** 路径无效 */
    invalidPath: string;
    /** 配置已保存 */
    configurationSaved: string;
    /** 工具链配置 */
    toolchainConfiguration: string;
    /** 自动检测结果 */
    autoDetectionResults: string;
    /** 推荐下载链接 */
    recommendedDownloadLinks: string;
    /** 工具链检测向导 */
    toolchainDetectionWizard: string;
    
    // 新的工具链设置按钮
    /** 设置工具链 */
    setupToolchain: string;
    /** 检测ARM工具链 */
    detectArmToolchain: string;
    /** 工具链设置标题 */
    toolchainSetupTitle: string;
    /** 自动检测 */
    automaticDetection: string;
    /** 手动配置 */
    manualConfiguration: string;
    /** 设置工具链描述 */
    setupToolchainDescription: string;
    /** 检测工具链描述 */
    detectToolchainDescription: string;
    /** 手动配置描述 */
    manualConfigDescription: string;
    /** 工具链设置失败 */
    toolchainSetupFailed: string;
    /** 工具链设置成功 */
    toolchainSetupSuccess: string;
    
    // 路径验证错误消息
    /** OpenOCD路径必需错误 */
    openocdPathRequired: string;
    /** ARM工具链路径必需错误 */
    armToolchainPathRequired: string;
    /** 配置被阻止错误 */
    configurationBlocked: string;
    /** 缺少工具链路径错误 */
    missingToolchainPaths: string;
}