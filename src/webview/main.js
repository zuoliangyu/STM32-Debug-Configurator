/*---------------------------------------------------------------------------------------------
 * Copyright (c) 2025 左岚. All rights reserved.
 * Licensed under the MIT License. See LICENSE file in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function () {
    const vscode = acquireVsCodeApi();

    // State management
    let currentLanguage = 'en';
    let strings = {};
    let liveWatchVariables = [];
    let autoSaveEnabled = true;
    let saveStateTimeout = null;
    // 历史遗留：以下变量/函数被多处引用但从未定义，导致 IIFE 在加载时崩溃。
    // 提供安全 fallback，让初始化流程能跑通。
    let stateManager = null;
    let isInitialized = false;
    let formChangeListeners = new Map();
    function createStateIndicator() {}
    function updateStateIndicator() {}
    function saveStateImmediately() {}
    function saveStateDebounced() {}
    function validateGenerationData() { return { isValid: true, errors: [] }; }

    // DOM elements
    const elements = {
        languageSelect: document.getElementById('language-select'),
        generateButton: document.getElementById('generate-button'),
        browseButton: document.getElementById('browse-button'),
        refreshButton: document.getElementById('refresh-button'),
        envSetupButton: document.getElementById('env-setup-button'),
        openocdPathInput: document.getElementById('openocdPath'),
        openocdStatus: document.getElementById('openocd-status'),
        downloadLinkContainer: document.getElementById('download-link-container'),
        envGuideLink: document.getElementById('env-guide-link'),
        servertypeSelect: document.getElementById('servertype'),
        openocdOptions: document.getElementById('openocd-options'),
        manualElfPathGroup: document.getElementById('manual-elf-path-group'),
        elfSourceRadios: document.querySelectorAll('input[name="elfSource"]'),
        interfaceFileSelect: document.getElementById('interfaceFile'),
        targetFileSelect: document.getElementById('targetFile'),
        interfaceFileSearch: document.getElementById('interfaceFileSearch'),
        targetFileSearch: document.getElementById('targetFileSearch'),
        interfaceFileSearchClear: document.getElementById('interfaceFileSearchClear'),
        targetFileSearchClear: document.getElementById('targetFileSearchClear'),
        liveWatchEnabledCheckbox: document.getElementById('liveWatchEnabled'),
        liveWatchOptionsGroup: document.getElementById('livewatch-options'),
        variableList: document.getElementById('variable-list'),
        newVariableInput: document.getElementById('newVariableInput'),
        addVariableButton: document.getElementById('addVariableButton'),
        // ARM toolchain elements
        armToolchainPathInput: document.getElementById('armToolchainPath'),
        browseArmButton: document.getElementById('browse-arm-button'),
        refreshArmButton: document.getElementById('refresh-arm-button'),
        armDownloadLinkContainer: document.getElementById('arm-download-link-container'),
        armToolchainInfo: document.getElementById('arm-toolchain-info'),
        armVersion: document.getElementById('arm-version'),
        armTarget: document.getElementById('arm-target'),
        deviceNameInput: document.getElementById('deviceName'),
        deviceDetectedHint: document.getElementById('deviceDetectedHint'),
        armToolchainCandidatesGroup: document.getElementById('arm-toolchain-candidates-group'),
        armToolchainCandidatesSelect: document.getElementById('armToolchainCandidates'),
        executablePathInput: document.getElementById('executablePath'),
        executableCandidatesGroup: document.getElementById('executable-candidates-group'),
        executableCandidatesSelect: document.getElementById('executableCandidates'),
        executableDetectedHint: document.getElementById('executableDetectedHint')
    };

    // Localization functions
    function updateUILanguage() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (strings[key]) {
                if (element.tagName === 'INPUT' && element.type !== 'radio') {
                    // For input elements, don't change the value, just placeholders
                } else {
                    element.textContent = strings[key];
                }
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (strings[key]) {
                element.placeholder = strings[key];
            }
        });

        // Update language select
        elements.languageSelect.value = currentLanguage;
    }

    // Variable management functions
    function addVariable(variableName) {
        if (!variableName || variableName.trim() === '') return false;
        
        const trimmedName = variableName.trim();
        if (liveWatchVariables.includes(trimmedName)) {
            showMessage('Variable already exists', 'warning');
            return false;
        }

        liveWatchVariables.push(trimmedName);
        updateVariableList();
        syncLiveWatchVariables(); // 同步到状态管理器
        elements.newVariableInput.value = '';
        
        // Notify extension about variable addition
        vscode.postMessage({
            command: 'addLiveWatchVariable',
            variable: trimmedName
        });
        
        return true;
    }

    function removeVariable(variableName) {
        const index = liveWatchVariables.indexOf(variableName);
        if (index > -1) {
            liveWatchVariables.splice(index, 1);
            updateVariableList();
            syncLiveWatchVariables(); // 同步到状态管理器
            
            // Notify extension about variable removal
            vscode.postMessage({
                command: 'removeLiveWatchVariable',
                variable: variableName
            });
        }
    }

    function updateVariableList() {
        if (!liveWatchVariables.length) {
            elements.variableList.innerHTML = `
                <div class="variable-list-empty">
                    ${strings.noVariables || 'No variables added yet'}
                </div>
            `;
            return;
        }

        elements.variableList.innerHTML = liveWatchVariables.map(variable => `
            <div class="variable-item">
                <span class="variable-name">${escapeHtml(variable)}</span>
                <button type="button" class="variable-remove" 
                        onclick="removeVariableHandler('${escapeHtml(variable)}')"
                        data-i18n="removeVariable">
                    ${strings.removeVariable || 'Remove'}
                </button>
            </div>
        `).join('');
    }

    // Global function for remove button onclick
    window.removeVariableHandler = function(variableName) {
        removeVariable(variableName);
    };

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showMessage(message, type = 'info') {
        // Simple message display - could be enhanced with toast notifications
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // 显示临时通知
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            max-width: 300px;
            word-wrap: break-word;
            background-color: ${type === 'error' ? '#d73a49' : type === 'warning' ? '#f66a0a' : type === 'success' ? '#28a745' : '#0366d6'};
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // State persistence functions
    function collectCurrentState() {
        const elfSource = document.querySelector('input[name="elfSource"]:checked')?.value || 'auto';
        const liveWatchEnabled = elements.liveWatchEnabledCheckbox?.checked || false;
        
        const state = {
            deviceName: document.getElementById('deviceName')?.value || '',
            executablePath: document.getElementById('executablePath')?.value || '',
            servertype: elements.servertypeSelect?.value || 'openocd',
            openocdPath: elements.openocdPathInput?.value || '',
            armToolchainPath: elements.armToolchainPathInput?.value || '',
            interfaceFile: elements.interfaceFileSelect?.value || '',
            targetFile: elements.targetFileSelect?.value || '',
            svdFilePath: document.getElementById('svdFilePath')?.value || '',
            adapterSpeed: document.getElementById('adapterSpeed')?.value || '4000',
            elfSource: elfSource,
            language: currentLanguage
        };

        // Add live watch configuration
        if (liveWatchEnabled) {
            const frequency = parseInt(document.getElementById('liveWatchFrequency')?.value) || 4;
            state.liveWatch = {
                enabled: true,
                samplesPerSecond: frequency,
                variables: [...liveWatchVariables]
            };
        } else {
            state.liveWatch = {
                enabled: false,
                samplesPerSecond: 4,
                variables: []
            };
        }

        return state;
    }

    function saveStateDebounced() {
        if (!autoSaveEnabled) return;

        // Clear previous timeout
        if (saveStateTimeout) {
            clearTimeout(saveStateTimeout);
        }

        // Set new timeout to save state after 1 second of inactivity
        saveStateTimeout = setTimeout(() => {
            try {
                const currentState = collectCurrentState();
                vscode.postMessage({
                    command: 'saveState',
                    state: currentState
                });
                console.log('State saved automatically');
            } catch (error) {
                console.error('Failed to save state:', error);
            }
        }, 1000);
    }

    function saveStateImmediately() {
        try {
            // Clear any pending debounced save
            if (saveStateTimeout) {
                clearTimeout(saveStateTimeout);
                saveStateTimeout = null;
            }

            const currentState = collectCurrentState();
            vscode.postMessage({
                command: 'saveState',
                state: currentState
            });
            console.log('State saved immediately');
        } catch (error) {
            console.error('Failed to save state immediately:', error);
        }
    }

    function restoreState(savedState) {
        if (!savedState || typeof savedState !== 'object') {
            console.log('No valid saved state to restore');
            return;
        }

        autoSaveEnabled = false; // Temporarily disable auto-save during restore
        
        try {
            // Restore basic form fields
            if (savedState.deviceName && document.getElementById('deviceName')) {
                document.getElementById('deviceName').value = savedState.deviceName;
            }
            
            if (savedState.executablePath && document.getElementById('executablePath')) {
                document.getElementById('executablePath').value = savedState.executablePath;
            }
            
            if (savedState.servertype && elements.servertypeSelect) {
                elements.servertypeSelect.value = savedState.servertype;
                toggleOpenOCDPathVisibility();
            }
            
            if (savedState.openocdPath && elements.openocdPathInput) {
                elements.openocdPathInput.value = savedState.openocdPath;
                // 状态恢复时也得主动拉一次 cfg 列表，否则下拉框停留在初始占位
                requestCFGFiles();
            }

            if (savedState.armToolchainPath && elements.armToolchainPathInput) {
                elements.armToolchainPathInput.value = savedState.armToolchainPath;
            }
            
            if (savedState.interfaceFile && elements.interfaceFileSelect) {
                elements.interfaceFileSelect.value = savedState.interfaceFile;
            }
            
            if (savedState.targetFile && elements.targetFileSelect) {
                elements.targetFileSelect.value = savedState.targetFile;
            }
            
            if (savedState.svdFilePath && document.getElementById('svdFilePath')) {
                document.getElementById('svdFilePath').value = savedState.svdFilePath;
            }
            
            if (savedState.adapterSpeed && document.getElementById('adapterSpeed')) {
                document.getElementById('adapterSpeed').value = savedState.adapterSpeed;
            }
            
            // Restore ELF source selection
            if (savedState.elfSource) {
                const elfSourceRadio = document.querySelector(`input[name="elfSource"][value="${savedState.elfSource}"]`);
                if (elfSourceRadio) {
                    elfSourceRadio.checked = true;
                    updateElfSourceVisibility();
                }
            }
            
            // Restore live watch configuration
            if (savedState.liveWatch) {
                if (elements.liveWatchEnabledCheckbox) {
                    elements.liveWatchEnabledCheckbox.checked = savedState.liveWatch.enabled || false;
                    updateLiveWatchVisibility();
                }
                
                if (savedState.liveWatch.samplesPerSecond && document.getElementById('liveWatchFrequency')) {
                    document.getElementById('liveWatchFrequency').value = savedState.liveWatch.samplesPerSecond.toString();
                }
                
                if (savedState.liveWatch.variables && Array.isArray(savedState.liveWatch.variables)) {
                    liveWatchVariables = [...savedState.liveWatch.variables];
                    updateVariableList();
                }
            }
            
            console.log('State restored successfully:', {
                keys: Object.keys(savedState),
                liveWatchEnabled: savedState.liveWatch?.enabled,
                variableCount: savedState.liveWatch?.variables?.length || 0
            });
            
        } catch (error) {
            console.error('Error during state restoration:', error);
        } finally {
            // Re-enable auto-save after a brief delay
            setTimeout(() => {
                autoSaveEnabled = true;
            }, 2000);
        }
    }

    // 智能匹配：根据设备型号推断 OpenOCD target.cfg
    let lastDetectedDevice = null;
    let lastLoadedCfgs = { interfaces: [], targets: [] };
    // 用户是否手动改过下拉。populateDropdown 是程序填充，不应触发 change 事件 → 这两个 flag 保持 false
    let targetUserPicked = false;
    let interfaceUserPicked = false;
    // 默认接口（按用户偏好优先级）。cmsis-dap 在 STM32 调试器里覆盖最广（DAP-Link / ST-Link V3 / J-Link CMSIS-DAP 模式都支持）
    const PREFERRED_INTERFACES = ['cmsis-dap.cfg', 'stlink.cfg', 'stlink-v2.cfg'];

    function inferTargetCfg(deviceName, availableTargets) {
        if (!deviceName || !Array.isArray(availableTargets) || availableTargets.length === 0) {
            return null;
        }
        const m = deviceName.match(/^STM32([A-Z])(\d)/i);
        if (!m) {
            return null;
        }
        const series = (m[1] + m[2]).toLowerCase(); // e.g. h7 / f4 / l4
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

    function trySmartFillTarget() {
        if (!lastDetectedDevice || !lastLoadedCfgs.targets.length || !elements.targetFileSelect) {
            return;
        }
        // 只在用户从未手动挑选过时自动填
        if (targetUserPicked) {
            return;
        }
        const inferred = inferTargetCfg(lastDetectedDevice, lastLoadedCfgs.targets);
        if (inferred) {
            elements.targetFileSelect.value = inferred;
            console.log('[SmartFill] target auto-filled to', inferred, 'for device', lastDetectedDevice);
        } else {
            console.log('[SmartFill] no target match for device', lastDetectedDevice);
        }
    }

    function trySmartFillInterface() {
        if (!lastLoadedCfgs.interfaces.length || !elements.interfaceFileSelect || interfaceUserPicked) {
            return;
        }
        const lookup = new Map(lastLoadedCfgs.interfaces.map((i) => [i.toLowerCase(), i]));
        for (const pref of PREFERRED_INTERFACES) {
            const hit = lookup.get(pref);
            if (hit) {
                elements.interfaceFileSelect.value = hit;
                console.log('[SmartFill] interface auto-filled to', hit);
                return;
            }
        }
        console.log('[SmartFill] no preferred interface match');
    }

    // ============================================================
    // CFG 选择器模态对话框
    // ============================================================
    const cfgPicker = {
        modal: null,
        title: null,
        search: null,
        listEl: null,
        emptyEl: null,
        currentField: null,   // 'interface' | 'target'
        activeIndex: 0,
        currentItems: [],

        init() {
            this.modal = document.getElementById('cfg-picker-modal');
            this.title = document.getElementById('cfg-picker-title');
            this.search = document.getElementById('cfg-picker-search');
            this.listEl = document.getElementById('cfg-picker-list');
            this.emptyEl = document.getElementById('cfg-picker-empty');
            const closeBtn = document.getElementById('cfg-picker-close');
            const backdrop = this.modal?.querySelector('.modal-backdrop');

            if (closeBtn) closeBtn.addEventListener('click', () => this.close());
            if (backdrop) backdrop.addEventListener('click', () => this.close());
            if (this.search) {
                this.search.addEventListener('input', () => this.render());
                this.search.addEventListener('keydown', (e) => this.onKey(e));
            }
        },

        open(field) {
            if (!this.modal) return;
            this.currentField = field;
            const list = field === 'interface' ? originalOptions.interface : originalOptions.target;
            const target = field === 'interface' ? elements.interfaceFileSelect : elements.targetFileSelect;

            if (!list || list.length === 0) {
                showMessage(strings.cfgPickerNoOptions || 'Provide a valid OpenOCD path first to load cfg files', 'warning');
                return;
            }

            // 标题
            const labelKey = field === 'interface' ? 'interfaceFile' : 'targetFile';
            this.title.textContent = (strings[labelKey]) || (field === 'interface' ? 'Interface File' : 'Target File / ID');

            this.search.value = '';
            this.activeIndex = 0;
            this.render();

            this.modal.classList.remove('hidden');
            setTimeout(() => this.search.focus(), 30);
        },

        close() {
            if (this.modal) this.modal.classList.add('hidden');
            this.currentField = null;
        },

        render() {
            const all = this.currentField === 'interface' ? originalOptions.interface : originalOptions.target;
            const q = this.search.value.trim().toLowerCase();
            const filtered = q ? all.filter((s) => s.toLowerCase().includes(q)) : all;
            this.currentItems = filtered;

            this.listEl.innerHTML = '';
            if (filtered.length === 0) {
                this.emptyEl?.classList.remove('hidden');
                return;
            }
            this.emptyEl?.classList.add('hidden');

            // 当前已选中项放在最前显示
            const target = this.currentField === 'interface' ? elements.interfaceFileSelect : elements.targetFileSelect;
            const currentValue = (target?.value || '').toLowerCase();

            this.activeIndex = Math.min(this.activeIndex, filtered.length - 1);
            if (this.activeIndex < 0) this.activeIndex = 0;

            filtered.forEach((item, idx) => {
                const li = document.createElement('li');
                li.textContent = item;
                if (item.toLowerCase() === currentValue) {
                    li.classList.add('active');
                    this.activeIndex = idx;
                }
                if (idx === this.activeIndex && !li.classList.contains('active')) {
                    li.classList.add('active');
                }
                li.addEventListener('click', () => this.pick(item));
                this.listEl.appendChild(li);
            });
        },

        pick(value) {
            const target = this.currentField === 'interface' ? elements.interfaceFileSelect : elements.targetFileSelect;
            if (target) {
                target.value = value;
                target.dispatchEvent(new Event('change', { bubbles: true }));
            }
            this.close();
        },

        onKey(e) {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.close();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.activeIndex = Math.min(this.activeIndex + 1, this.currentItems.length - 1);
                this.refreshActive();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.activeIndex = Math.max(this.activeIndex - 1, 0);
                this.refreshActive();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const picked = this.currentItems[this.activeIndex];
                if (picked) this.pick(picked);
            }
        },

        refreshActive() {
            const items = this.listEl.querySelectorAll('li');
            items.forEach((li, idx) => {
                li.classList.toggle('active', idx === this.activeIndex);
            });
            const active = items[this.activeIndex];
            if (active) active.scrollIntoView({ block: 'nearest' });
        }
    };

    // Configuration and file handling
    function requestCFGFiles() {
        const path = elements.openocdPathInput.value;
        console.log('[CFG] requestCFGFiles called, openocd path:', path);
        if (path) {
            vscode.postMessage({ command: 'getCFGFiles', path: path });
        }
    }

    // Store original options for search functionality
    const originalOptions = {
        interface: [],
        target: []
    };

    function populateDropdown(selectElement, options) {
        if (!selectElement) return;
        // 候选列表存到 originalOptions，模态选择器从这里读
        if (selectElement.id === 'interfaceFile') {
            originalOptions.interface = [...options];
        } else if (selectElement.id === 'targetFile') {
            originalOptions.target = [...options];
        }

        // 新设计：interfaceFile / targetFile 是 readonly <input>，点击触发模态选择器
        // 候选列表通过 originalOptions 存储，不再写到 DOM
        if (selectElement.tagName === 'INPUT') {
            return;
        }

        // 旧 <select> 兼容路径（保留给可能没迁移的下拉）
        selectElement.innerHTML = '';
        const searchableContainer = selectElement.closest('.searchable-select');

        if (options.length === 0) {
            const defaultOption = document.createElement('option');
            defaultOption.value = "";
            defaultOption.textContent = strings.noCfgFiles || "No .cfg files found";
            defaultOption.disabled = true;
            defaultOption.selected = true;
            selectElement.appendChild(defaultOption);

            // Hide search input when no options
            if (searchableContainer) {
                searchableContainer.classList.add('disabled');
            }
            return;
        }
        
        // Show search input when options available
        if (searchableContainer) {
            searchableContainer.classList.remove('disabled');
        }
        
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            selectElement.appendChild(option);
        });
    }

    // Search functionality
    function createSearchHandler(searchInput, selectElement, optionsKey) {
        return function(event) {
            const searchTerm = event.target.value.toLowerCase();
            const originalList = originalOptions[optionsKey];
            
            if (!originalList || originalList.length === 0) {
                return;
            }
            
            // Filter options based on search term
            const filteredOptions = originalList.filter(option => 
                option.toLowerCase().includes(searchTerm)
            );
            
            // Clear and repopulate select
            selectElement.innerHTML = '';
            
            if (filteredOptions.length === 0) {
                const noResultOption = document.createElement('option');
                noResultOption.value = "";
                noResultOption.textContent = searchTerm ? `No results for "${event.target.value}"` : strings.noCfgFiles || "No .cfg files found";
                noResultOption.disabled = true;
                noResultOption.selected = true;
                selectElement.appendChild(noResultOption);
            } else {
                filteredOptions.forEach(optionValue => {
                    const option = document.createElement('option');
                    option.value = optionValue;
                    
                    // Highlight matching text (using textContent to avoid XSS)
                    if (searchTerm) {
                        // For display purposes, we'll use a simpler approach
                        option.textContent = optionValue;
                        option.setAttribute('data-search-term', searchTerm);
                    } else {
                        option.textContent = optionValue;
                    }
                    
                    selectElement.appendChild(option);
                });
                
                // Auto-select first result if only one match
                if (filteredOptions.length === 1) {
                    selectElement.selectedIndex = 0;
                }
            }
        };
    }

    // Clear search functionality
    function createClearHandler(searchInput, selectElement, optionsKey) {
        return function() {
            searchInput.value = '';
            const originalList = originalOptions[optionsKey];
            
            if (originalList && originalList.length > 0) {
                populateDropdown(selectElement, originalList);
            }
        };
    }

    // UI visibility controls
    function updateLiveWatchVisibility() {
        if (elements.liveWatchEnabledCheckbox.checked) {
            elements.liveWatchOptionsGroup.classList.remove('hidden');
        } else {
            elements.liveWatchOptionsGroup.classList.add('hidden');
        }
    }

    function updateElfSourceVisibility() {
        const elfSource = document.querySelector('input[name="elfSource"]:checked').value;
        if (elfSource === 'manual') {
            elements.manualElfPathGroup.classList.remove('hidden');
        } else {
            elements.manualElfPathGroup.classList.add('hidden');
        }
    }

    function toggleOpenOCDPathVisibility() {
        if (elements.servertypeSelect.value === 'openocd') {
            elements.openocdOptions.classList.remove('hidden');
        } else {
            elements.openocdOptions.classList.add('hidden');
        }
    }

    // Event listeners
    function setupEventListeners() {
        // Language switching
        elements.languageSelect.addEventListener('change', (e) => {
            const newLanguage = e.target.value;
            vscode.postMessage({
                command: 'switchLanguage',
                language: newLanguage
            });
        });

        // Variable management
        elements.addVariableButton.addEventListener('click', () => {
            const variableName = elements.newVariableInput.value;
            addVariable(variableName);
        });

        elements.newVariableInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const variableName = elements.newVariableInput.value;
                addVariable(variableName);
            }
        });

        // OpenOCD path handling
        elements.openocdPathInput.addEventListener('blur', requestCFGFiles);

        // 设备名变化时重新触发 target.cfg 智能匹配
        if (elements.deviceNameInput) {
            elements.deviceNameInput.addEventListener('change', () => {
                const v = elements.deviceNameInput.value.trim();
                if (v && v !== lastDetectedDevice) {
                    lastDetectedDevice = v;
                    // 用户改了设备 → 之前的自动填充作废，重新匹配
                    targetUserPicked = false;
                    trySmartFillTarget();
                }
            });
        }

        // target dropdown 用户手动选择 → 标记为已选，后续 smart fill 不再覆盖
        if (elements.targetFileSelect) {
            elements.targetFileSelect.addEventListener('change', () => {
                targetUserPicked = true;
            });
        }

        // interface dropdown 同上
        if (elements.interfaceFileSelect) {
            elements.interfaceFileSelect.addEventListener('change', () => {
                interfaceUserPicked = true;
            });
            // 点击触发模态选择器
            elements.interfaceFileSelect.addEventListener('click', () => cfgPicker.open('interface'));
        }
        if (elements.targetFileSelect) {
            elements.targetFileSelect.addEventListener('click', () => cfgPicker.open('target'));
        }

        // 固件下拉切换 → 同步到 executablePath input
        if (elements.executableCandidatesSelect) {
            elements.executableCandidatesSelect.addEventListener('change', (e) => {
                const picked = e.target.value;
                if (picked && elements.executablePathInput) {
                    elements.executablePathInput.value = picked;
                }
            });
        }

        // ARM 工具链下拉切换 → 同步到 input + 触发版本/路径刷新
        if (elements.armToolchainCandidatesSelect) {
            elements.armToolchainCandidatesSelect.addEventListener('change', (e) => {
                const picked = e.target.value;
                if (picked && elements.armToolchainPathInput) {
                    elements.armToolchainPathInput.value = picked;
                    vscode.postMessage({ command: 'selectArmToolchain', path: picked });
                }
            });
        }

        // UI visibility controls
        elements.servertypeSelect.addEventListener('change', toggleOpenOCDPathVisibility);
        elements.elfSourceRadios.forEach(radio => 
            radio.addEventListener('change', updateElfSourceVisibility)
        );
        elements.liveWatchEnabledCheckbox.addEventListener('change', updateLiveWatchVisibility);

        // Generate configuration
        elements.generateButton.addEventListener('click', () => {
            // 验证配置完整性
            if (stateManager) {
                if (!stateManager.validateAndNotify()) {
                    return; // 验证失败，停止生成
                }
            }
            
            const data = getCurrentConfigurationData();
            
            // 额外验证生成数据
            const validation = validateGenerationData(data);
            if (!validation.isValid) {
                showMessage('Generation validation failed:\n' + validation.errors.join('\n'), 'error');
                return;
            }
            
            // 保存配置到状态管理器
            if (stateManager) {
                stateManager.updateMultipleState({
                    deviceName: data.deviceName,
                    servertype: data.servertype,
                    openocdPath: data.openocdPath,
                    interfaceFile: data.interfaceFile,
                    targetFile: data.targetFile,
                    svdFilePath: data.svdFilePath,
                    adapterSpeed: data.adapterSpeed,
                    armToolchainPath: data.armToolchainPath,
                    liveWatchEnabled: data.liveWatch ? data.liveWatch.enabled : false,
                    liveWatchFrequency: data.liveWatch ? data.liveWatch.samplesPerSecond : 4
                });
            }
            
            showMessage('Generating configuration...', 'info');
            vscode.postMessage({ command: 'generate', data: data });
        });

        // Browse for OpenOCD path
        elements.browseButton.addEventListener('click', () => {
            vscode.postMessage({ command: 'browseOpenOCDPath' });
        });

        // Browse for ARM toolchain path
        elements.browseArmButton.addEventListener('click', () => {
            vscode.postMessage({ command: 'browseArmToolchainPath' });
        });

        // Environment setup button
        if (elements.envSetupButton) {
            elements.envSetupButton.addEventListener('click', () => {
                vscode.postMessage({ command: 'showEnvSetupHelp' });
            });
        }

        // Environment guide link
        if (elements.envGuideLink) {
            elements.envGuideLink.addEventListener('click', (e) => {
                e.preventDefault();
                vscode.postMessage({ command: 'showEnvGuide' });
            });
        }

        // 旧的独立搜索框已被移除，改用 <input list="..."> + <datalist> 原生组合框。
        // 下面的 search 监听器只在元素存在时绑定（向前兼容老版本 webview）。
        if (elements.interfaceFileSearch && elements.interfaceFileSearchClear) {
            elements.interfaceFileSearch.addEventListener('input',
                createSearchHandler(elements.interfaceFileSearch, elements.interfaceFileSelect, 'interface')
            );
            elements.interfaceFileSearchClear.addEventListener('click',
                createClearHandler(elements.interfaceFileSearch, elements.interfaceFileSelect, 'interface')
            );
        }
        if (elements.targetFileSearch && elements.targetFileSearchClear) {
            elements.targetFileSearch.addEventListener('input',
                createSearchHandler(elements.targetFileSearch, elements.targetFileSelect, 'target')
            );
            elements.targetFileSearchClear.addEventListener('click',
                createClearHandler(elements.targetFileSearch, elements.targetFileSelect, 'target')
            );
        }

        // Refresh OpenOCD path
        elements.refreshButton.addEventListener('click', () => {
            elements.openocdPathInput.value = "";
            elements.openocdPathInput.placeholder = strings.autoDetecting || "Auto-detecting...";
            elements.downloadLinkContainer.classList.add('hidden');
            vscode.postMessage({ command: 'refreshPath' });
        });

        // Refresh ARM toolchain path
        elements.refreshArmButton.addEventListener('click', () => {
            elements.armToolchainPathInput.value = "";
            elements.armToolchainPathInput.placeholder = strings.autoDetecting || "Auto-detecting...";
            elements.armDownloadLinkContainer.classList.add('hidden');
            elements.armToolchainInfo.classList.add('hidden');
            vscode.postMessage({ command: 'refreshArmToolchainPath' });
        });

        // Auto-save configuration state when form changes
        setupAutoSaveListeners();
    }

    function setupAutoSaveListeners() {
        // Monitor form inputs for changes
        const formInputs = [
            'deviceName', 'executablePath', 'svdFilePath', 'adapterSpeed', 'liveWatchFrequency'
        ];
        
        formInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', saveStateDebounced);
                element.addEventListener('change', saveStateDebounced);
            }
        });
        
        // Monitor select elements
        if (elements.servertypeSelect) {
            elements.servertypeSelect.addEventListener('change', saveStateDebounced);
        }
        
        if (elements.interfaceFileSelect) {
            elements.interfaceFileSelect.addEventListener('change', saveStateDebounced);
        }
        
        if (elements.targetFileSelect) {
            elements.targetFileSelect.addEventListener('change', saveStateDebounced);
        }
        
        if (elements.openocdPathInput) {
            elements.openocdPathInput.addEventListener('input', saveStateDebounced);
        }
        
        if (elements.armToolchainPathInput) {
            elements.armToolchainPathInput.addEventListener('input', saveStateDebounced);
        }
        
        // Monitor radio buttons
        elements.elfSourceRadios.forEach(radio => {
            radio.addEventListener('change', saveStateDebounced);
        });
        
        // Monitor checkboxes
        if (elements.liveWatchEnabledCheckbox) {
            elements.liveWatchEnabledCheckbox.addEventListener('change', saveStateDebounced);
        }
        
        // Monitor language selection
        if (elements.languageSelect) {
            elements.languageSelect.addEventListener('change', saveStateDebounced);
        }
    }

    // Message handling from extension
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'updatePath':
                const path = message.path;
                if (path) {
                    elements.openocdPathInput.value = path;
                    elements.openocdPathInput.placeholder = "Leave empty to use system PATH...";
                    elements.downloadLinkContainer.classList.add('hidden');
                    
                    // 同步到状态管理器
                    if (stateManager && isInitialized) {
                        stateManager.updateState('openocdPath', path, false);
                    }
                    
                    requestCFGFiles();
                } else {
                    elements.openocdPathInput.value = "";
                    elements.openocdPathInput.placeholder = strings.autoDetectionFailed || 
                        "Auto-detection failed. Please specify the path manually.";
                    elements.downloadLinkContainer.classList.remove('hidden');
                    
                    // 清除状态管理器中的路径
                    if (stateManager && isInitialized) {
                        stateManager.updateState('openocdPath', '', false);
                    }
                }
                updateOpenOCDStatus(message);
                break;

            case 'updateCFGLists':
                console.log('[CFG] received updateCFGLists, interfaces:', message.data?.interfaces?.length, 'targets:', message.data?.targets?.length);
                populateDropdown(elements.interfaceFileSelect, message.data.interfaces);
                populateDropdown(elements.targetFileSelect, message.data.targets);
                lastLoadedCfgs = {
                    interfaces: message.data?.interfaces || [],
                    targets: message.data?.targets || []
                };
                trySmartFillTarget();
                trySmartFillInterface();
                break;

            case 'updateLanguage':
                currentLanguage = message.language;
                strings = message.strings;
                updateUILanguage();
                updateVariableList(); // Refresh variable list with new language
                break;

            case 'liveWatchVariableAdded':
                showMessage(strings.variableAdded?.replace('{0}', message.variable) || 
                    `Variable '${message.variable}' added successfully`, 'success');
                break;

            case 'liveWatchVariableRemoved':
                showMessage(strings.variableRemoved?.replace('{0}', message.variable) || 
                    `Variable '${message.variable}' removed successfully`, 'success');
                break;

            case 'updateOpenOCDPath':
                if (message.path) {
                    elements.openocdPathInput.value = message.path;
                    elements.downloadLinkContainer.classList.add('hidden');
                    requestCFGFiles();
                }
                break;

            case 'showError':
                showMessage(message.error, 'error');
                break;

            case 'updateExecutableCandidates':
                if (elements.executableCandidatesSelect && elements.executableCandidatesGroup) {
                    const candidates = Array.isArray(message.candidates) ? message.candidates : [];
                    const select = elements.executableCandidatesSelect;
                    select.innerHTML = '';
                    if (candidates.length === 0) {
                        elements.executableCandidatesGroup.classList.add('hidden');
                        if (elements.executableDetectedHint) {
                            elements.executableDetectedHint.classList.add('hidden');
                        }
                        break;
                    }
                    // 第一个候选（排序后最优）作为默认占位
                    const placeholder = document.createElement('option');
                    placeholder.value = '';
                    placeholder.disabled = true;
                    placeholder.textContent = (typeof strings !== 'undefined' && strings.executablePickHint) || '— pick a firmware file —';
                    select.appendChild(placeholder);
                    candidates.forEach((c) => {
                        const opt = document.createElement('option');
                        opt.value = c.workspaceUri;
                        const sizeKb = (c.size / 1024).toFixed(1);
                        opt.textContent = `[${c.variant}] ${c.relativePath} · ${c.kind.toUpperCase()} · ${sizeKb} KB`;
                        select.appendChild(opt);
                    });
                    elements.executableCandidatesGroup.classList.remove('hidden');

                    // 仅在用户尚未输入时自动填第一个候选
                    const cur = elements.executablePathInput?.value.trim();
                    if (!cur) {
                        const top = candidates[0];
                        if (elements.executablePathInput) {
                            elements.executablePathInput.value = top.workspaceUri;
                        }
                        select.value = top.workspaceUri;
                        if (elements.executableDetectedHint) {
                            const tmpl = (typeof strings !== 'undefined' && strings.executableDetectedHint) || 'Detected {0} firmware file(s); using {1}';
                            elements.executableDetectedHint.textContent = tmpl
                                .replace('{0}', String(candidates.length))
                                .replace('{1}', top.relativePath);
                            elements.executableDetectedHint.classList.remove('hidden');
                        }
                    }
                    console.log('[ExecDetect] candidates:', candidates);
                }
                break;

            case 'updateDetectedDevice':
                console.log('[DeviceDetect] received', message);
                if (message.device && elements.deviceNameInput) {
                    const currentValue = elements.deviceNameInput.value.trim();
                    // 仅在用户尚未输入时自动填入，避免覆盖手动值或恢复的状态
                    if (!currentValue) {
                        elements.deviceNameInput.value = message.device;
                        if (typeof stateManager !== 'undefined' && stateManager && typeof isInitialized !== 'undefined' && isInitialized) {
                            stateManager.updateState('deviceName', message.device, false);
                        }
                    }
                    lastDetectedDevice = elements.deviceNameInput.value.trim() || message.device;
                    trySmartFillTarget();
                    if (elements.deviceDetectedHint) {
                        const tmpl = (typeof strings !== 'undefined' && strings.deviceDetectedHint) || 'Detected {0} from {1}';
                        elements.deviceDetectedHint.textContent = tmpl
                            .replace('{0}', message.device)
                            .replace('{1}', message.source);
                        elements.deviceDetectedHint.classList.remove('hidden');
                        console.log('[DeviceDetect] hint shown:', elements.deviceDetectedHint.textContent);
                    } else {
                        console.warn('[DeviceDetect] hint element NOT FOUND in DOM');
                    }
                } else {
                    console.warn('[DeviceDetect] message ignored, device or input missing', {
                        device: message.device,
                        hasInput: !!elements.deviceNameInput
                    });
                }
                break;

            case 'updateArmToolchainCandidates':
                if (elements.armToolchainCandidatesSelect && elements.armToolchainCandidatesGroup) {
                    const candidates = Array.isArray(message.candidates) ? message.candidates : [];
                    const select = elements.armToolchainCandidatesSelect;
                    select.innerHTML = '';
                    candidates.forEach((c) => {
                        const opt = document.createElement('option');
                        opt.value = c.path;
                        opt.textContent = `${c.label} — ${c.path}`;
                        select.appendChild(opt);
                    });
                    if (candidates.length > 1) {
                        elements.armToolchainCandidatesGroup.classList.remove('hidden');
                        // 同步当前选中：与 input 框一致
                        if (elements.armToolchainPathInput) {
                            const cur = elements.armToolchainPathInput.value.trim();
                            const matched = candidates.find((c) => c.path.toLowerCase() === cur.toLowerCase());
                            if (matched) {
                                select.value = matched.path;
                            }
                        }
                    } else {
                        elements.armToolchainCandidatesGroup.classList.add('hidden');
                    }
                    console.log('[ArmToolchain] candidates:', candidates);
                }
                break;

            case 'updateArmToolchainPath':
                const armPath = message.path;
                const armInfo = message.info;
                if (armPath) {
                    elements.armToolchainPathInput.value = armPath;
                    elements.armToolchainPathInput.placeholder = "Leave empty to use system PATH...";
                    elements.armDownloadLinkContainer.classList.add('hidden');
                    
                    // 同步到状态管理器
                    if (stateManager && isInitialized) {
                        stateManager.updateState('armToolchainPath', armPath, false);
                    }
                    
                    if (armInfo) {
                        elements.armVersion.textContent = armInfo.version || 'Unknown';
                        elements.armTarget.textContent = armInfo.target || 'arm-none-eabi';
                        elements.armToolchainInfo.classList.remove('hidden');
                    } else {
                        elements.armToolchainInfo.classList.add('hidden');
                    }
                } else {
                    elements.armToolchainPathInput.value = "";
                    elements.armToolchainPathInput.placeholder = strings.autoDetectionFailed || 
                        "Auto-detection failed. Please specify the path manually.";
                    elements.armDownloadLinkContainer.classList.remove('hidden');
                    elements.armToolchainInfo.classList.add('hidden');
                    
                    // 清除状态管理器中的路径
                    if (stateManager && isInitialized) {
                        stateManager.updateState('armToolchainPath', '', false);
                    }
                }
                break;

            case 'showError':
                showMessage(message.error, 'error');
                break;

            case 'showWarning':
                showMessage(message.warning, 'warning');
                break;

            case 'showInfo':
                showMessage(message.info, 'info');
                break;

            case 'restoreState':
                // 从后端恢复状态
                if (message.state && stateManager) {
                    stateManager.importConfiguration(message.state);
                    restoreFormState();
                    showMessage('Configuration restored from backend', 'success');
                }
                break;

            case 'restoreState':
                if (message.state) {
                    console.log('Received state restoration message');
                    restoreState(message.state);
                }
                break;
        }
    });

    // Initialize UI
    function initialize() {
        cfgPicker.init();
        setupEventListeners();
        toggleOpenOCDPathVisibility();
        updateElfSourceVisibility();
        updateLiveWatchVisibility();
        updateVariableList();

        // Request initial language and strings from extension
        vscode.postMessage({ command: 'getLanguage' });
    }

    /**
     * 恢复表单状态
     */
    function restoreFormState() {
        if (!stateManager) return;
        
        const state = stateManager.getState();
        
        // 恢复基本配置
        if (state.deviceName) document.getElementById('deviceName').value = state.deviceName;
        if (state.servertype) elements.servertypeSelect.value = state.servertype;
        if (state.adapterSpeed) document.getElementById('adapterSpeed').value = state.adapterSpeed;
        if (state.svdFilePath) document.getElementById('svdFilePath').value = state.svdFilePath;
        
        // 恢复ELF源配置
        if (state.elfSource) {
            const elfRadio = document.querySelector(`input[name="elfSource"][value="${state.elfSource}"]`);
            if (elfRadio) elfRadio.checked = true;
        }
        if (state.executablePath) {
            const execPathInput = document.getElementById('executablePath');
            if (execPathInput) execPathInput.value = state.executablePath;
        }
        
        // 恢复路径配置
        if (state.openocdPath) {
            elements.openocdPathInput.value = state.openocdPath;
            requestCFGFiles();
        }
        if (state.armToolchainPath) elements.armToolchainPathInput.value = state.armToolchainPath;
        
        // 恢复OpenOCD文件选择
        if (state.interfaceFile) elements.interfaceFileSelect.value = state.interfaceFile;
        if (state.targetFile) elements.targetFileSelect.value = state.targetFile;
        
        // 恢复LiveWatch配置
        elements.liveWatchEnabledCheckbox.checked = state.liveWatchEnabled || false;
        if (state.liveWatchFrequency) {
            const freqInput = document.getElementById('liveWatchFrequency');
            if (freqInput) freqInput.value = state.liveWatchFrequency;
        }
        
        // 恢复LiveWatch变量
        if (state.liveWatchVariables && Array.isArray(state.liveWatchVariables)) {
            liveWatchVariables = [...state.liveWatchVariables];
        }
        
        // 恢复语言设置：同步到后端 localizationManager，否则 dropdown 显示与实际 strings 不一致
        if (state.language && state.language !== currentLanguage) {
            currentLanguage = state.language;
            elements.languageSelect.value = state.language;
            vscode.postMessage({
                command: 'switchLanguage',
                language: state.language
            });
        }
        
        console.log('Form state restored from saved configuration');
    }
    
    /**
     * 设置表单变化跟踪
     */
    function setupFormChangeTracking() {
        if (!stateManager) return;
        
        // 跟踪所有表单元素的变化
        const formElements = [
            { id: 'deviceName', key: 'deviceName' },
            { id: 'adapterSpeed', key: 'adapterSpeed' },
            { id: 'svdFilePath', key: 'svdFilePath' },
            { id: 'executablePath', key: 'executablePath' },
            { id: 'openocdPath', key: 'openocdPath' },
            { id: 'armToolchainPath', key: 'armToolchainPath' },
            { id: 'interfaceFile', key: 'interfaceFile' },
            { id: 'targetFile', key: 'targetFile' },
            { id: 'liveWatchFrequency', key: 'liveWatchFrequency' }
        ];
        
        formElements.forEach(({ id, key }) => {
            const element = document.getElementById(id);
            if (element) {
                const handler = (event) => {
                    if (isInitialized) {
                        stateManager.updateState(key, event.target.value);
                    }
                };
                element.addEventListener('input', handler);
                element.addEventListener('change', handler);
                formChangeListeners.set(id, handler);
            }
        });
        
        // 跟踪选择框变化
        elements.servertypeSelect.addEventListener('change', (event) => {
            if (isInitialized) {
                stateManager.updateState('servertype', event.target.value);
            }
        });
        
        elements.liveWatchEnabledCheckbox.addEventListener('change', (event) => {
            if (isInitialized) {
                stateManager.updateState('liveWatchEnabled', event.target.checked);
            }
        });
        
        // 跟踪单选按钮变化
        elements.elfSourceRadios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                if (isInitialized && event.target.checked) {
                    stateManager.updateState('elfSource', event.target.value);
                }
            });
        });
        
        // 跟踪语言变化
        elements.languageSelect.addEventListener('change', (event) => {
            if (isInitialized) {
                stateManager.updateState('language', event.target.value);
            }
        });
    }
    
    /**
     * 更新LiveWatch变量状态
     */
    function syncLiveWatchVariables() {
        if (isInitialized && stateManager) {
            stateManager.updateState('liveWatchVariables', [...liveWatchVariables]);
        }
    }
    
    /**
     * 获取当前配置数据
     */
    function getCurrentConfigurationData() {
        // 现在 executablePath input 已经统一承载（自动检测会预填，用户也能手动改）
        const executablePath = document.getElementById('executablePath').value;

        const liveWatchEnabled = elements.liveWatchEnabledCheckbox.checked;
        let liveWatchData = null;
        
        if (liveWatchEnabled && liveWatchVariables.length > 0) {
            const frequency = parseInt(document.getElementById('liveWatchFrequency').value) || 4;
            liveWatchData = {
                enabled: true,
                samplesPerSecond: frequency,
                variables: [...liveWatchVariables]
            };
        }

        return {
            executablePath: executablePath,
            deviceName: document.getElementById('deviceName').value,
            servertype: elements.servertypeSelect.value,
            openocdPath: elements.openocdPathInput.value,
            interfaceFile: elements.interfaceFileSelect.value,
            targetFile: elements.targetFileSelect.value,
            svdFilePath: document.getElementById('svdFilePath').value,
            adapterSpeed: document.getElementById('adapterSpeed').value,
            transportInterface: document.getElementById('transportInterface')?.value || 'swd',
            liveWatch: liveWatchData,
            armToolchainPath: elements.armToolchainPathInput.value
        };
    }
    
    // Update OpenOCD status display
    function updateOpenOCDStatus(message) {
        const statusDiv = elements.openocdStatus;
        if (!statusDiv) return;

        if (message.path) {
            statusDiv.className = 'status-info success';
            let statusHtml = '<span class="status-icon">✓</span> ';
            if (message.foundInPath) {
                statusHtml += `OpenOCD detected in PATH${message.version ? ` (v${message.version})` : ''}`;
            } else if (message.foundInSettings) {
                statusHtml += `OpenOCD configured in settings${message.version ? ` (v${message.version})` : ''}`;
            } else {
                statusHtml += `OpenOCD found at: ${message.path}`;
            }
            statusDiv.innerHTML = statusHtml;
        } else if (message.suggestions && message.suggestions.length > 0) {
            statusDiv.className = 'status-info warning';
            statusDiv.innerHTML = `<span class="status-icon">⚠</span> ${message.suggestions[0]} <a href="#" onclick="vscode.postMessage({command: 'showEnvSetupHelp'}); return false;">View setup guide</a>`;
        } else {
            statusDiv.className = 'status-info error';
            statusDiv.innerHTML = '<span class="status-icon">✗</span> OpenOCD not configured. Please configure environment variables or specify path manually.';
        }
    }

    // 初始化状态指示器
    createStateIndicator();
    
    // 监听状态变化
    const originalOnStateChange = stateManager ? stateManager.onStateChange : null;
    if (stateManager) {
        stateManager.onStateChange = function(key, value) {
            updateStateIndicator('dirty', 'Unsaved changes');
            if (originalOnStateChange) {
                originalOnStateChange.call(this, key, value);
            }
        };
        
        // 监听保存事件
        const originalSaveState = stateManager.saveState;
        stateManager.saveState = function() {
            updateStateIndicator('saving', 'Saving...');
            const result = originalSaveState.call(this);
            setTimeout(() => {
                updateStateIndicator('saved', 'Saved');
            }, 100);
            return result;
        };
    }
        
    // 清理资源函数
    window.addEventListener('beforeunload', () => {
        // Immediately save state before unload
        saveStateImmediately();

        if (stateManager) {
            stateManager.destroy();
        }
    });

    // Also listen to pagehide event as a fallback
    window.addEventListener('pagehide', () => {
        saveStateImmediately();
    });

    // Listen to visibility change to save state when webview is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            saveStateImmediately();
        }
    });
    
    // Start the application
    initialize();
}());