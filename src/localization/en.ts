/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * 英文本地化字符串模块
 * 定义STM32调试配置器扩展的所有英文界面文本
 * 包括表单标签、按钮文本、提示信息等
 * 
 * @fileoverview 英文本地化字符串
 * @author 左岚
 * @since 0.1.0
 */

import { LocalizedStrings } from './index';

/**
 * 英文本地化字符串对象
 * 包含扩展所有用户界面文本的英文版本
 */
export const en: LocalizedStrings = {
    // Main UI
    title: "STM32 Debug Configuration",
    subtitle: "Fill in the details below to generate a `launch.json` configuration for Cortex-Debug.",
    generateButton: "Generate Configuration",
    
    // Form labels
    elfSource: "Executable (.elf) Path Source",
    autoDetectElf: "Auto-detect (Requires ST's STM32 Extension)",
    manualElf: "Manual Path",
    manualElfPath: "Manual .elf Path",
    deviceName: "Device Name (e.g., STM32F407ZG)",
    gdbServer: "GDB Server",
    openocdPath: "OpenOCD Path (Required when using OpenOCD)",
    openocdPathOptional: "OpenOCD Path (Required when using OpenOCD)",
    armToolchainPath: "ARM Toolchain Path (Required when using OpenOCD)",
    browseButton: "Browse",
    envSetupButton: "ENV Setup",
    searchInterface: "Search interface files...",
    searchTarget: "Search target files...",
    scanButton: "Scan",
    viewEnvGuide: "View environment setup guide",
    interfaceFile: "Interface File",
    targetFile: "Target File / ID",
    svdFile: "SVD File Path (Optional)",
    adapterSpeed: "Adapter Speed (kHz)",
    
    // Live Watch
    liveWatchEnable: "Enable Live Watch",
    liveWatchVariables: "Variables to Watch",
    liveWatchFrequency: "Update Frequency (samples/second)",
    liveWatchVariablesPlaceholder: "Enter variable names (one per line or comma-separated):\nvariable1\nvariable2\nmyStruct.field",
    liveWatchVariablesHelp: "Specify global variables, function parameters, or structure fields to monitor in real-time",
    liveWatchFrequencyHelp: "Higher values provide more frequent updates but may impact debugging performance",
    addVariable: "Add Variable",
    removeVariable: "Remove",
    variableName: "Variable Name",
    currentVariables: "Current Variables",
    
    // Language switching
    language: "Language",
    switchToEnglish: "English",
    switchToChinese: "中文",
    
    // Messages
    noOpenocdFound: "OpenOCD not found.",
    noArmToolchainFound: "ARM Toolchain not found.",
    downloadOpenocd: "Download it here",
    openocdDetected: "OpenOCD found at:",
    armToolchainDetected: "ARM Toolchain found at:",
    configGenerated: "launch.json has been updated successfully!",
    liveWatchStatus: "Live Watch enabled with {0} variables at {1}Hz.",
    variableAdded: "Variable '{0}' added successfully",
    variableRemoved: "Variable '{0}' removed successfully",
    
    // Placeholders and help text
    devicePlaceholder: "e.g., STM32F407ZG",
    deviceDetectedHint: "Auto-detected {0} from {1}",
    armToolchainCandidates: "Detected toolchains (pick one to switch)",
    transportInterface: "Transport (SWD / JTAG)",
    executable: "Executable (.elf / .axf / .bin / .hex)",
    executablePlaceholder: "${workspaceFolder}/build/Debug/project.elf",
    executablePickHint: "— pick a firmware file —",
    executableDetectedHint: "Detected {0} firmware file(s); using {1}",
    svdPlaceholder: "e.g., ${workspaceFolder}/STM32F407.svd",
    autoDetecting: "Auto-detecting...",
    autoDetectionFailed: "Auto-detection failed. Please specify the path manually.",
    noCfgFiles: "No .cfg files found",
    providePath: "Provide valid OpenOCD path to populate...",
    
    // Footer
    createdBy: "Created by 左岚",
    
    // Additional messages
    noVariables: "No variables added yet",
    
    // Toolchain Detection
    toolchainDetectionTitle: "Toolchain Detection",
    detectingToolchains: "Detecting toolchains...",
    toolchainDetectionComplete: "Toolchain detection complete",
    openocdDetectionStatus: "OpenOCD Detection Status",
    armToolchainDetectionStatus: "ARM Toolchain Detection Status", 
    detectionSuccess: "Success",
    detectionFailed: "Failed",
    notFound: "Not found",
    foundAt: "Found at",
    version: "Version",
    target: "Target",
    downloadOpenOCD: "Download OpenOCD",
    downloadArmToolchain: "Download ARM Toolchain",
    configureManually: "Manual configuration",
    continue: "Continue",
    cancel: "Cancel",
    confirmPath: "Confirm path",
    enterPathManually: "Enter path manually",
    selectPath: "Select path",
    invalidPath: "Invalid path",
    configurationSaved: "Configuration saved",
    toolchainConfiguration: "Toolchain Configuration",
    autoDetectionResults: "Automatically detect and configure toolchains",
    recommendedDownloadLinks: "Recommended Download Links",
    toolchainDetectionWizard: "Toolchain Detection Wizard",
    
    // New toolchain setup buttons
    setupToolchain: "Setup Toolchain",
    detectArmToolchain: "Detect ARM Toolchain",
    toolchainSetupTitle: "Toolchain Setup",
    automaticDetection: "Automatic Detection",
    manualConfiguration: "Manual Configuration",
    setupToolchainDescription: "Configure ARM development toolchain for STM32 debugging",
    detectToolchainDescription: "Automatically detect and configure ARM toolchain and OpenOCD",
    manualConfigDescription: "Manually specify toolchain paths in settings",
    toolchainSetupFailed: "Toolchain setup failed",
    toolchainSetupSuccess: "Toolchain setup completed successfully",
    
    // Path validation error messages
    openocdPathRequired: "OpenOCD path is required when using OpenOCD!",
    armToolchainPathRequired: "ARM toolchain path is required when using OpenOCD!",
    configurationBlocked: "Configuration creation blocked. Please configure the required toolchain paths first.",
    missingToolchainPaths: "Missing required toolchain paths"
};