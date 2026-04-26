/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * STM32配置器状态管理器
 * 负责webview界面的数据持久化和状态恢复
 */
class StateManager {
    constructor(vscode) {
        this.vscode = vscode;
        this.state = {
            // 基础配置
            language: 'en',
            deviceName: '',
            servertype: 'openocd',
            elfSource: 'auto',
            
            // 路径配置
            executablePath: '',
            openocdPath: '',
            armToolchainPath: '',
            svdFilePath: '',
            
            // OpenOCD配置
            interfaceFile: '',
            targetFile: '',
            adapterSpeed: '4000',
            
            // LiveWatch配置
            liveWatchEnabled: false,
            liveWatchFrequency: 4,
            liveWatchVariables: [],
            
            // 内部状态
            lastSaveTime: null,
            isDirty: false
        };
        
        this.autosaveInterval = null;
        this.storageKey = 'stm32-configurator-state';
        this.debounceTimeout = null;
        
        // 绑定方法以保持正确的this上下文
        this.saveState = this.saveState.bind(this);
        this.loadState = this.loadState.bind(this);
        this.onStateChange = this.onStateChange.bind(this);
        this.startAutosave = this.startAutosave.bind(this);
        this.stopAutosave = this.stopAutosave.bind(this);
        
        // 监听页面卸载事件以保存状态
        window.addEventListener('beforeunload', this.saveState);
        window.addEventListener('pagehide', this.saveState);
    }

    /**
     * 从localStorage加载状态
     */
    loadState() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsedState = JSON.parse(stored);
                // 合并状态，保留默认值
                this.state = { ...this.state, ...parsedState };
                this.state.isDirty = false;
                console.log('State loaded from localStorage:', this.state);
                return true;
            }
        } catch (error) {
            console.error('Failed to load state from localStorage:', error);
            this.notifyError('Failed to restore previous configuration');
        }
        return false;
    }

    /**
     * 保存状态到localStorage
     */
    saveState() {
        try {
            this.state.lastSaveTime = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
            this.state.isDirty = false;
            console.log('State saved to localStorage');
            
            // 通知后端状态已保存
            this.vscode.postMessage({
                command: 'stateSaved',
                timestamp: this.state.lastSaveTime
            });
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
            this.notifyError('Failed to save configuration');
        }
    }

    /**
     * 获取当前状态
     */
    getState() {
        return { ...this.state };
    }

    /**
     * 更新状态
     */
    updateState(key, value, autoSave = true) {
        if (this.state[key] !== value) {
            this.state[key] = value;
            this.state.isDirty = true;
            
            if (autoSave) {
                this.debouncedSave();
            }
            
            this.onStateChange(key, value);
        }
    }

    /**
     * 批量更新状态
     */
    updateMultipleState(updates, autoSave = true) {
        let hasChanges = false;
        
        for (const [key, value] of Object.entries(updates)) {
            if (this.state[key] !== value) {
                this.state[key] = value;
                hasChanges = true;
            }
        }
        
        if (hasChanges) {
            this.state.isDirty = true;
            
            if (autoSave) {
                this.debouncedSave();
            }
            
            // 触发变化事件
            Object.entries(updates).forEach(([key, value]) => {
                this.onStateChange(key, value);
            });
        }
    }

    /**
     * 防抖保存
     */
    debouncedSave() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            this.saveState();
        }, 300); // 300ms防抖延迟
    }

    /**
     * 状态变化回调
     */
    onStateChange(key, value) {
        // 可以在这里添加状态变化的处理逻辑
        console.log(`State changed: ${key} = ${value}`);
    }

    /**
     * 开始自动保存
     */
    startAutosave(interval = 30000) { // 默认30秒
        this.stopAutosave(); // 先停止之前的定时器
        
        this.autosaveInterval = setInterval(() => {
            if (this.state.isDirty) {
                this.saveState();
            }
        }, interval);
        
        console.log(`Autosave started with ${interval}ms interval`);
    }

    /**
     * 停止自动保存
     */
    stopAutosave() {
        if (this.autosaveInterval) {
            clearInterval(this.autosaveInterval);
            this.autosaveInterval = null;
        }
    }

    /**
     * 清除所有保存的状态
     */
    clearState() {
        try {
            localStorage.removeItem(this.storageKey);
            this.state = this.getDefaultState();
            console.log('State cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear state:', error);
            return false;
        }
    }

    /**
     * 获取默认状态
     */
    getDefaultState() {
        return {
            language: 'en',
            deviceName: '',
            servertype: 'openocd',
            elfSource: 'auto',
            executablePath: '',
            openocdPath: '',
            armToolchainPath: '',
            svdFilePath: '',
            interfaceFile: '',
            targetFile: '',
            adapterSpeed: '4000',
            liveWatchEnabled: false,
            liveWatchFrequency: 4,
            liveWatchVariables: [],
            lastSaveTime: null,
            isDirty: false
        };
    }

    /**
     * 导出配置
     */
    exportConfiguration() {
        const config = { ...this.state };
        delete config.isDirty;
        delete config.lastSaveTime;
        return config;
    }

    /**
     * 导入配置
     */
    importConfiguration(config) {
        try {
            // 验证配置格式
            if (!this.validateConfiguration(config)) {
                throw new Error('Invalid configuration format');
            }
            
            // 更新状态
            this.state = { ...this.getDefaultState(), ...config };
            this.state.isDirty = true;
            this.saveState();
            
            console.log('Configuration imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import configuration:', error);
            this.notifyError('Failed to import configuration: ' + error.message);
            return false;
        }
    }

    /**
     * 验证配置
     */
    validateConfiguration(config) {
        if (!config || typeof config !== 'object') {
            return {
                isValid: false,
                errors: ['Configuration must be a valid object']
            };
        }
        
        const errors = [];
        
        // 基本字段验证
        const requiredFields = {
            deviceName: 'Device name is required',
            servertype: 'Server type is required'
        };
        
        for (const [field, message] of Object.entries(requiredFields)) {
            if (!(field in config) || !config[field] || config[field].trim() === '') {
                errors.push(message);
            }
        }
        
        // 服务器类型验证
        const validServertypes = ['openocd', 'pyocd', 'jlink', 'stlink', 'stutil'];
        if (config.servertype && !validServertypes.includes(config.servertype)) {
            errors.push(`Invalid server type: ${config.servertype}. Valid types: ${validServertypes.join(', ')}`);
        }
        
        // ELF源验证
        if (config.elfSource && !['auto', 'manual'].includes(config.elfSource)) {
            errors.push(`Invalid ELF source: ${config.elfSource}. Valid sources: auto, manual`);
        }
        
        // OpenOCD特定验证
        if (config.servertype === 'openocd') {
            if (!config.interfaceFile || config.interfaceFile.trim() === '') {
                errors.push('Interface file is required for OpenOCD');
            }
            if (!config.targetFile || config.targetFile.trim() === '') {
                errors.push('Target file is required for OpenOCD');
            }
            if (config.adapterSpeed && (isNaN(config.adapterSpeed) || parseInt(config.adapterSpeed) <= 0)) {
                errors.push('Adapter speed must be a positive number');
            }
        }
        
        // 手动ELF路径验证
        if (config.elfSource === 'manual' && (!config.executablePath || config.executablePath.trim() === '')) {
            errors.push('Executable path is required when using manual ELF source');
        }
        
        // LiveWatch验证
        if (config.liveWatchEnabled) {
            if (config.liveWatchFrequency && (isNaN(config.liveWatchFrequency) || config.liveWatchFrequency < 1 || config.liveWatchFrequency > 100)) {
                errors.push('LiveWatch frequency must be between 1 and 100');
            }
            if (!config.liveWatchVariables || !Array.isArray(config.liveWatchVariables) || config.liveWatchVariables.length === 0) {
                errors.push('At least one variable is required when LiveWatch is enabled');
            }
        }
        
        // 路径格式验证
        const pathFields = ['openocdPath', 'armToolchainPath', 'executablePath', 'svdFilePath'];
        pathFields.forEach(field => {
            if (config[field] && typeof config[field] === 'string') {
                const path = config[field].trim();
                // 基本路径格式验证（简单检查）
                if (path && !/^[\w\s\-\.\\\/:]+$/.test(path)) {
                    errors.push(`Invalid path format for ${field}: ${path}`);
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * 获取状态差异
     */
    getStateDiff(otherState) {
        const diff = {};
        const currentState = this.state;
        
        for (const key in currentState) {
            if (currentState[key] !== otherState[key]) {
                diff[key] = {
                    current: currentState[key],
                    other: otherState[key]
                };
            }
        }
        
        return diff;
    }

    /**
     * 检查状态完整性
     */
    checkStateIntegrity() {
        const issues = [];
        
        // 检查必需字段
        if (!this.state.deviceName || this.state.deviceName.trim() === '') {
            issues.push('Device name is required');
        }
        
        // 检查OpenOCD配置
        if (this.state.servertype === 'openocd') {
            if (!this.state.interfaceFile) {
                issues.push('Interface file is required for OpenOCD');
            }
            if (!this.state.targetFile) {
                issues.push('Target file is required for OpenOCD');
            }
        }
        
        // 检查LiveWatch配置
        if (this.state.liveWatchEnabled) {
            if (!this.state.liveWatchVariables || this.state.liveWatchVariables.length === 0) {
                issues.push('At least one variable is required when LiveWatch is enabled');
            }
            if (this.state.liveWatchFrequency < 1 || this.state.liveWatchFrequency > 100) {
                issues.push('LiveWatch frequency must be between 1 and 100');
            }
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * 通知消息
     */
    notifyError(message) {
        this.vscode.postMessage({
            command: 'showError',
            error: message
        });
        console.error('StateManager Error:', message);
    }

    /**
     * 通知警告
     */
    notifyWarning(message) {
        this.vscode.postMessage({
            command: 'showWarning',
            warning: message
        });
        console.warn('StateManager Warning:', message);
    }

    /**
     * 通知信息
     */
    notifyInfo(message) {
        this.vscode.postMessage({
            command: 'showInfo',
            info: message
        });
        console.info('StateManager Info:', message);
    }

    /**
     * 验证并通知错误
     */
    validateAndNotify(config = null) {
        const configToValidate = config || this.exportConfiguration();
        const validation = this.validateConfiguration(configToValidate);
        
        if (!validation.isValid) {
            const errorMessage = 'Configuration validation failed:\n' + validation.errors.join('\n');
            this.notifyError(errorMessage);
            return false;
        }
        
        return true;
    }

    /**
     * 安全更新状态（带验证）
     */
    safeUpdateState(key, value, autoSave = true) {
        const tempState = { ...this.state, [key]: value };
        const validation = this.validateConfiguration(tempState);
        
        if (validation.isValid || validation.errors.length <= 2) { // 允许少量警告
            this.updateState(key, value, autoSave);
            return true;
        } else {
            this.notifyWarning(`Invalid value for ${key}: ${validation.errors.join(', ')}`);
            return false;
        }
    }

    /**
     * 销毁状态管理器
     */
    destroy() {
        this.stopAutosave();
        
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        // 最后保存一次
        if (this.state.isDirty) {
            this.saveState();
        }
        
        // 移除事件监听器
        window.removeEventListener('beforeunload', this.saveState);
        window.removeEventListener('pagehide', this.saveState);
    }
}

// 导出StateManager类
window.StateManager = StateManager;