/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * ARM工具链安装路径配置模块
 * 定义各种平台常见的ARM工具链安装路径
 * 
 * @fileoverview ARM工具链路径配置
 * @author 左岚
 * @since 0.2.3
 */

/**
 * STM32 VS Code Extension 自动下载的工具链 bundle 路径
 * 优先级最高：检测到时直接采用，且在生成 launch.json 时会转成 ${env:LOCALAPPDATA}/... 形式
 */
export const ST_BUNDLE_ARM_TOOLCHAIN_GLOB =
    '%LOCALAPPDATA%\\stm32cube\\bundles\\gnu-tools-for-stm32\\*\\bin\\arm-none-eabi-gcc.exe';

/**
 * Windows平台上常见的ARM工具链安装路径
 * 包括GNU Arm Embedded Toolchain、STM32CubeIDE、PlatformIO等各种安装方式
 */
export const COMMON_ARM_TOOLCHAIN_PATHS = [
    // GNU Arm Embedded Toolchain官方安装路径
    'C:\\Program Files (x86)\\GNU Arm Embedded Toolchain\\*\\bin\\arm-none-eabi-gcc.exe',
    'C:\\Program Files\\GNU Arm Embedded Toolchain\\*\\bin\\arm-none-eabi-gcc.exe',
    // STM32CubeIDE内置工具链
    'C:\\ST\\STM32CubeIDE_*\\STM32CubeIDE\\plugins\\com.st.stm32cube.ide.mcu.externaltools.gnu-tools-for-stm32.*\\tools\\bin\\arm-none-eabi-gcc.exe',
    // xPack GNU Arm Embedded GCC
    '%USERPROFILE%\\AppData\\Roaming\\xPacks\\@xpack-dev-tools\\arm-none-eabi-gcc\\*\\bin\\arm-none-eabi-gcc.exe',
    '%LOCALAPPDATA%\\xPacks\\@xpack-dev-tools\\arm-none-eabi-gcc\\*\\bin\\arm-none-eabi-gcc.exe',
    // PlatformIO工具链
    '%USERPROFILE%\\.platformio\\packages\\toolchain-gccarmnoneeabi\\bin\\arm-none-eabi-gcc.exe',
    // MSYS2/MinGW64安装
    'C:\\msys64\\mingw64\\bin\\arm-none-eabi-gcc.exe',
    // 用户自定义安装路径
    '%USERPROFILE%\\arm-toolchain\\bin\\arm-none-eabi-gcc.exe',
    '%USERPROFILE%\\Tools\\arm-toolchain\\bin\\arm-none-eabi-gcc.exe',
    'C:\\arm-toolchain\\bin\\arm-none-eabi-gcc.exe'
];

/**
 * macOS/Linux平台上常见的ARM工具链安装路径
 */
export const UNIX_ARM_TOOLCHAIN_PATHS = [
    // Homebrew安装
    '/usr/local/bin/arm-none-eabi-gcc',
    '/opt/homebrew/bin/arm-none-eabi-gcc',
    // 系统包管理器安装
    '/usr/bin/arm-none-eabi-gcc',
    '/usr/local/arm-none-eabi/bin/arm-none-eabi-gcc',
    // 用户自定义安装
    '~/arm-toolchain/bin/arm-none-eabi-gcc',
    '~/Tools/arm-toolchain/bin/arm-none-eabi-gcc'
];