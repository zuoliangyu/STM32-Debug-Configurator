/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * 服务模块导出索引
 * 统一导出所有服务类和相关接口
 * 
 * @fileoverview 服务模块索引
 * @author 左岚
 * @since 0.2.5
 */

export {
    ToolchainDetectionService
} from './toolchainDetectionService';

export {
    ExtendedToolchainDetectionResult,
    ExtendedToolchainDetectionResults,
    DetectionOptions,
    ToolchainDetector,
    CacheManager
} from './detectionTypes';

export {
    OpenOCDDetector,
    ArmToolchainDetector,
    DetectorFactory
} from './toolchainDetectors';

export {
    DefaultCacheManager
} from './cacheManager';

export {
    StateManager,
    ExtensionConfigurationState,
    LiveWatchState
} from './stateManager';