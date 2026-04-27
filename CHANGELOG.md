# 更新日志

STM32 Debug Configurator 扩展的所有重要变更都将记录在此文件中。

本文档格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
此项目遵循 [语义化版本控制](https://semver.org/lang/zh-CN/)。


## [1.0.2] - 2026-04-28

### 修复 (Fixed)
- 🐛 **修复 Marketplace 安装后所有命令报 `command 'xxx' not found` 的致命问题**：`src/services/index.ts` 的 barrel 文件意外再导出了 `./toolchainDetectionService.test`，编译产物里 `out/services/index.js` 因此 `require('./toolchainDetectionService.test')`；而 `.vscodeignore` 已经把 `*.test.js` 从 vsix 里排除，导致扩展激活时 `Cannot find module` 异常，`activate()` 整个挂掉，所有命令注册都跑不到。dev (F5) 因为 out/ 完整不受影响，只有发布版本受波及


## [1.0.1] - 2026-04-27

### 改进 (Changed)
- 🌏 **默认语言改为中文**：扩展首次安装时 webview UI 默认显示中文；如果 VS Code 本身是英文界面则自动切换为英文，避免硬塞中文。已经手动切换过的用户保留原选择
- 📖 **Marketplace 详情页默认中文**：把仓库根目录的 `README.md` 切换为中文版（原英文版迁到 `README_en.md`），Marketplace 扩展页和 GitHub 仓库主页都默认显示中文文档

### 修复 (Fixed)
- 📝 修正 1.0.0 CHANGELOG / README 中错误列入了仅供开发用、未发布到 vsix 的内部条目（自定义 launch profile、watch 脚本、测试脚本），实际功能未受影响


## [1.0.0] - 2026-04-27

正式版发布 🎉。本版本对配置生成体验做了大量自动化与 UI 重构，把"读 .ioc → 找工具链 → 选 cfg → 输出 launch.json"全链路从手动填表升级为一键完成。

### 新增 (Added)
- ✨ **STM32 设备自动检测**：扫描工作区里的 `.ioc` / `.cproject` / `CMakeLists.txt`，自动填入设备型号（如 `STM32H743ZITx`），下方显示来源文件
- ✨ **固件文件自动扫描**：在 `build/Debug` / `build/Release` / `Debug` / `Release` / `out` 等常见输出目录里发现所有 `.elf` / `.axf` / `.bin` / `.hex`，按 variant 优先级（Debug > Release）和 kind（elf > axf > hex > bin）排序，下拉让用户选择
- ✨ **OpenOCD cfg 模态选择器**：原"搜索框 + 下拉"两条堆叠改为单输入框，点击弹出居中模态对话框，顶部搜索 + 滚动列表 + 当前值高亮 + ↑↓/Enter/Esc 键盘操作 + 背景模糊
- ✨ **ARM 工具链多候选下拉**：`enumerateArmToolchains()` 同时枚举所有候选（ST bundle 多版本、PATH、cortex-debug 用户配置、其他常见路径），用户可在下拉里切换，input 与版本卡同步刷新
- ✨ **STM32 VS Code Extension bundle 优先**：扫描 `%LOCALAPPDATA%\stm32cube\bundles\gnu-tools-for-stm32\<ver>\bin`，自动转成 `${env:LOCALAPPDATA}/...` 可移植路径写入 launch.json
- ✨ **target.cfg 智能匹配**：根据设备型号推断 OpenOCD target.cfg（`STM32H743ZITx → stm32h7x.cfg`、`STM32F407 → stm32f4x.cfg` 等 6+ 个系列）
- ✨ **interface.cfg 智能匹配**：默认按 `cmsis-dap.cfg → stlink.cfg → stlink-v2.cfg` 顺序选中
- ✨ **SWD / JTAG 传输方式选择**：UI 下拉切换，影响 `interface` 字段和 `openOCDLaunchCommands` 里的 `transport select`
- ✨ **gdbPath 自动写入**：`launch.json` 同时写入 `gdbPath`（基于 toolchain bin 推导，ST bundle 走可移植形式）

### 改进 (Changed)
- 🎨 **webview UI 完全重做**：12 列响应式 grid 布局，5 张卡片（项目 / 目标设备 / GDB Server / ARM 工具链 / 高级选项）替代原来的长竖条，每张卡左上角带 01–05 编号徽章；卡片化间距、统一 typography、native VS Code 颜色变量
- 🎨 GDB Server 卡片内部用 row helper 实现 Server / Transport / Speed 三列并排
- 🔧 `armToolchainPath` 输出修正：cortex-debug 期望 bin 目录，之前错误写成 `gcc.exe` 完整路径
- 🔧 launch.json 输出补全 `serverpath` / `interface` / `showDevDebugOutput`，`openOCDLaunchCommands` 加 `transport select`，空 SVD 不再写 `"svdFile": ""`
- 🔧 不再生成 `${command:st-stm32-ide-debug-launch...}` 这种依赖 ST 扩展的字符串，直接写实际路径

### 修复 (Fixed)
- 🐛 **webview 消息丢失 race**：`onDidReceiveMessage` 之前注册在所有 `postMessage` 之后，导致 webview 回复的 `getCFGFiles` 落到一个还没注册的监听器上 → cfg 下拉一直空，用户被迫手动点扫描
- 🐛 **激活期 OpenOCD 检测 race**：`findOpenOCDPath()` 是 fire-and-forget 异步，开 webview 比检测完成早时把 `null` 推给 webview。改成全局 promise，start 命令 await 一次
- 🐛 **状态恢复不触发 cfg 加载**：`restoreState` / `restoreFormState` 把 openocd 路径写回 input 但没主动调 `requestCFGFiles()`
- 🐛 **`expandPath` 通配符解析**：`*` 在路径中段时（`dir/*/sub`）`baseDir` 算偏一级，导致 ST bundle 多版本目录从未被扫到
- 🐛 **多个未定义全局**：`stateManager` / `createStateIndicator` / `validateGenerationData` 等遗留引用导致 IIFE 加载时 ReferenceError，初始化流程从未跑到，连带语言切换、生成按钮全部失效
- 🐛 **target / interface 智能填充失效**：`populateDropdown` 程序填充后浏览器默认选中第一项被误判为"用户已选过"，跳过 smart fill。用 `targetUserPicked` / `interfaceUserPicked` flag 显式追踪用户操作
- 🐛 **语言切换 bug**：webview localStorage 里的 `language` 与扩展端 `localizationManager` 不同步，dropdown 显示中文但 UI 是英文。`restoreFormState` 在恢复语言时主动发 `switchLanguage` 给后端

### 技术改进 (Technical)
- 🏗️ 新模块 `deviceDetector` / `executableDetector`，纯 fs 实现可独立测试，VS Code API 延迟加载
- 🏗️ 新模块 `armToolchain` 增加 `enumerateArmToolchains` / `toolchainBinDir` / `toPortableArmToolchainPath` / `deriveGdbPath` / `isStBundleArmToolchainPath` 5 个 helper
- 🏗️ webview 端 `cfgPicker` 对象统一管理模态选择器，键盘操作 + 当前值定位 + 滚动到激活项

## [0.2.6] - 2026-01-23

### 修复 (Fixed)
- 🐛 修复切换标签时配置数据丢失的问题
- 🐛 修复关闭webview后重新打开配置无法恢复的问题
- 🐛 修复状态保存延迟导致快速切换时数据丢失

### 新增 (Added)
- ✨ 添加完整的状态管理系统（StateManager）
- 💾 实现webview状态持久化（retainContextWhenHidden）
- 🔒 添加多重保护机制确保状态保存（beforeunload、pagehide、visibilitychange）
- 📊 新增状态指示器显示保存状态

### 改进 (Changed)
- 🔧 优化OpenOCD环境检测和配置向导
- 💬 改进UI通知系统和用户反馈
- 📝 增强错误处理和日志记录
- ⚡ 优化状态保存性能（防抖 + 立即保存）

### 技术改进 (Technical)
- 🏗️ 实现前端和后端双层状态管理（localStorage + VS Code workspace state）
- 🔄 添加onDidChangeViewState监听器自动保存/恢复状态
- ✅ 完善状态验证和错误处理机制
- 📦 新增StateManager服务模块

## [0.2.5] - 2025-09-23

### 改进 (Changed)
- 📚 文档同步和发布优化
- 🔧 修复GitHub Actions配置问题

## [0.2.4] - 2025-09-23

### 改进 (Changed)
- 🔒 强化OpenOCD配置验证机制
- 🔍 改进环境检测准确性

## [0.2.3] - 2025-09-23

### 新增 (Added)
- 🛠️ ARM工具链完整集成
- 🔍 自动检测ARM工具链路径
- 📊 显示工具链版本信息

## [0.2.2] - 2025-09-23

### 改进 (Changed)
- 🏗️ 重大重构：完全清理仓库结构
- 📁 优化项目文件组织
- 🔧 改进构建和发布流程

## [0.2.1] - 2025-08-23

### 新增 (Added)
- 🌍 完整的中文版 README 文档 (README_zh.md)
- 📖 增强的英文版 README 文档，包含更详细的使用说明
- 📝 完整的 JSDoc 风格中文注释覆盖所有 TypeScript 源代码
- 🔍 改进的文档结构和用户指南

### 改进 (Changed)
- 📚 重构了文档结构，提高了可读性和专业性
- 🎯 优化了安装和使用指南，更加详细和用户友好
- 📊 增强了故障排除部分，包含更多常见问题解决方案
- 🌐 改进了多语言支持文档

### 技术改进 (Technical)
- 💻 为所有 TypeScript 文件添加了标准化的 JSDoc 注释
- 📁 改进了代码可维护性和开发者体验
- 🔧 增强了代码文档的完整性

## [0.2.0] - 2025-08-23

### 新增 (Added)
- 🎯 活动栏集成 - 在 VS Code 活动栏中添加专用图标
- 📊 LiveWatch 实时变量监控功能
- 🌐 完整的多语言支持（中文/英文）
- 📁 树视图侧边栏，用于管理调试配置
- 🔧 改进的 OpenOCD 路径自动检测

### 改进 (Changed)
- 🎨 全新的现代化用户界面设计
- 🔄 更好的配置持久化和管理
- 📈 增强的用户体验和交互设计

### 修复 (Fixed)
- 🐛 修复了配置文件读取的稳定性问题
- 🔧 改进了跨平台兼容性

## [0.1.0] - 2025-08-23

### 新增 (Added)
- ✨ 重大功能更新和架构改进
- 🎨 全新的现代界面设计
- 📁 树视图侧边栏集成
- 🔄 配置持久化和历史记录功能

### 改进 (Changed)
- 🚀 大幅提升了用户体验
- 📊 改进了配置管理流程
- 🔧 优化了扩展性能

## [0.0.9] - 2025-08-23

### 新增 (Added)
- 🚀 首次公开发布
- 📝 基础的调试配置生成功能
- 🔧 OpenOCD 集成支持
- 🎯 STM32 调试配置的可视化界面

### 功能特性 (Features)
- ⚙️ 自动生成 launch.json 配置
- 🔍 OpenOCD 路径自动检测
- 📱 简洁的用户界面
- 🛠️ 支持多种 GDB 服务器

---

## 版本说明

### 语义化版本控制说明
- **主版本号 (MAJOR)**：当做了不兼容的 API 修改
- **次版本号 (MINOR)**：当做了向下兼容的功能性新增
- **修订号 (PATCH)**：当做了向下兼容的问题修正

### 变更类型说明
- `新增 (Added)` - 新功能
- `改进 (Changed)` - 现有功能的变更
- `已弃用 (Deprecated)` - 即将移除的功能
- `已移除 (Removed)` - 已移除的功能
- `修复 (Fixed)` - 错误修复
- `安全性 (Security)` - 安全漏洞修复

---

**📝 注意**: 此文档将持续更新，记录扩展的所有重要变更。每个版本的详细变更信息请参阅对应的发布说明。