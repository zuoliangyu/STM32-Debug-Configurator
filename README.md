# STM32 调试配置器 (by 左岚)

<div align="center">

![版本](https://img.shields.io/badge/version-1.0.3-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-^1.80.0-007ACC.svg)
![许可证](https://img.shields.io/badge/license-MIT-green.svg)
![作者](https://img.shields.io/badge/author-左岚-orange.svg)

[中文](README.md) | [English](README_en.md)

<img src="icon.png" width="128" height="128" alt="STM32 调试配置器图标">

**强大的 Visual Studio Code STM32 调试配置扩展**

</div>

---

## 📋 目录

- [概述](#-概述)
- [特性](#-特性)
- [安装](#-安装)
- [使用方法](#-使用方法)
- [配置选项](#️-配置选项)
- [界面截图](#-界面截图)
- [支持的平台](#-支持的平台)
- [故障排除](#-故障排除)
- [更新日志](#-更新日志)
- [贡献](#-贡献)
- [致谢](#-致谢)
- [许可证](#-许可证)

## 🎯 概述

**STM32 调试配置器** 是专为 STM32 开发者设计的下一代 Visual Studio Code 扩展。它提供了超现代的图形界面，用于智能高效地管理和生成 Cortex-Debug 配置文件 (`launch.json`)。

此扩展通过智能环境感知和用户友好的界面大大简化了 STM32 调试配置的复杂性，让开发者能够专注于代码而不是繁琐的配置细节。

### 为什么选择 STM32 调试配置器？

- 🚀 **零配置**：自动检测 OpenOCD 安装和配置文件
- 🎨 **现代界面**：清爽、直观的界面，支持深色/浅色主题
- 🌍 **多语言**：完全支持中英文界面
- 🔍 **智能搜索**：接口和目标文件的高级搜索功能
- 📊 **实时监控**：调试会话期间的实时变量监控
- 🔧 **灵活配置**：支持多种 GDB 服务器（OpenOCD、J-Link、pyOCD 等）

## ✨ 特性

### 核心特性

#### 🎯 **活动栏快速访问**
- 专用活动栏图标，一键访问
- 无需在命令面板中搜索
- 即时访问调试配置

#### 📁 **智能树视图侧边栏**
- 实时显示调试配置
- 快速访问最近使用的配置
- 可视化管理和编辑调试配置
- 一键快捷操作

#### 🔍 **高级 OpenOCD 集成**
- **自动路径检测**：智能扫描常见的 OpenOCD 安装位置
- **自定义路径支持**：配置自定义 OpenOCD 可执行文件路径
- **文件浏览器**：内置文件浏览器选择 OpenOCD 可执行文件
- **接口文件搜索**：实时搜索和过滤接口配置文件
- **目标文件搜索**：智能搜索目标配置文件，即时过滤

#### 📊 **LiveWatch 实时监控**
- 调试期间动态添加/删除监控变量
- 直观的变量管理界面
- 实时变量状态更新
- 可配置更新频率以优化性能

#### 🌍 **智能多语言支持**
- 基于系统设置自动检测语言
- 中英文间无缝切换
- 本地化界面元素和消息
- 持久化语言偏好

### 扩展特性

#### 🔧 **多种 GDB 服务器支持**
- OpenOCD（推荐）
- J-Link GDB Server
- pyOCD
- ST-Link GDB Server
- ST-Util

#### 🎨 **可视化配置**
- 无需手动编辑 JSON
- 直观的表单式配置
- 实时验证和反馈
- 常用设置的自动完成

#### 🔄 **智能依赖管理**
- 自动检测 Cortex-Debug 扩展
- 提示缺少的依赖项
- 自动或手动指定 .elf 文件路径
- 无需额外插件独立运行

#### ⚙️ **配置自动化**
- 智能更新 `launch.json`，保留现有配置
- 自动配置全局 Cortex-Debug 设置
- 消除手动配置步骤
- 配置持久化和历史记录

## 📦 安装

### 系统要求

- **Visual Studio Code**：1.80.0 或更高版本
- **Cortex-Debug 扩展**：必需依赖项（自动检测）
- **OpenOCD**：推荐用于 STM32 调试（可选，但推荐）

### 安装方法

#### 方法 1：VS Code 市场（推荐）

1. 打开 Visual Studio Code
2. 进入扩展视图（`Ctrl+Shift+X` 或 `Cmd+Shift+X`）
3. 搜索 "STM32 Debug Configurator by zuolan"
4. 点击 **安装**
5. 如提示重新加载 VS Code

#### 方法 2：手动安装

1. 从 [发布页面](https://github.com/zuoliangyu/stm32-configurator-by-zuolan/releases) 下载最新的 `.vsix` 文件
2. 打开 VS Code
3. 进入扩展视图
4. 点击 "..." 菜单并选择 "从 VSIX 安装..."
5. 选择下载的 `.vsix` 文件
6. 重新加载 VS Code

### 安装后设置

1. **安装 Cortex-Debug**：如未安装，扩展会提示您
2. **安装 OpenOCD**（推荐）：
   - Windows：从 [OpenOCD 发布页面](https://github.com/openocd-org/openocd/releases) 下载
   - macOS：`brew install openocd`
   - Linux：`sudo apt-get install openocd`（Debian/Ubuntu）
3. **配置 OpenOCD 路径**（如果未自动检测）：
   - 打开 VS Code 设置
   - 搜索 "stm32-configurator.openocdPath"
   - 设置 OpenOCD 可执行文件的路径

## 📖 使用方法

### 快速开始

1. **在 VS Code 中打开您的 STM32 项目**
2. **点击活动栏中的 STM32 调试配置器图标**（左侧边栏）
3. **配置您的调试设置**：
   - 选择 .elf 文件来源（自动/手动）
   - 选择 GDB 服务器（推荐 OpenOCD）
   - 选择接口文件（使用搜索过滤）
   - 选择目标文件（使用搜索过滤）
   - 根据需要配置其他选项
4. **点击"生成配置"按钮**
5. **使用 VS Code 的运行和调试视图开始调试**

### 详细配置指南

#### 步骤 1：可执行文件配置

**自动检测模式**（需要 ST 的 STM32 扩展）：
- 自动从构建输出中找到 .elf 文件
- 无需手动配置路径

**手动模式**：
- 指定 .elf 文件的确切路径
- 支持工作区变量如 `${workspaceFolder}`
- 示例：`${workspaceFolder}/build/Debug/myproject.elf`

#### 步骤 2：OpenOCD 配置

**路径配置**：
- 点击"浏览"选择 OpenOCD 可执行文件
- 点击"扫描"重新检测系统 PATH 中的 OpenOCD
- 或在设置中手动输入路径

**接口文件选择**：
1. 点击接口文件下拉菜单
2. 使用搜索框过滤选项（例如，输入 "stlink" 查找 ST-Link 接口）
3. 从过滤结果中选择您的调试器接口
4. 常见接口：
   - `stlink.cfg` - ST-Link V2/V3
   - `cmsis-dap.cfg` - CMSIS-DAP 兼容调试器
   - `jlink.cfg` - J-Link 调试器

**目标文件选择**：
1. 点击目标文件下拉菜单
2. 使用搜索框按芯片系列过滤（例如，"f4" 查找 STM32F4 系列）
3. 选择您的具体 MCU 目标
4. 示例：
   - `stm32f4x.cfg` - STM32F4 系列
   - `stm32h7x.cfg` - STM32H7 系列
   - `stm32g0x.cfg` - STM32G0 系列

#### 步骤 3：高级选项

**SVD 文件**（可选）：
- 提供外设寄存器描述
- 在调试会话中启用寄存器视图
- MCU 的 .svd 文件路径

**适配器速度**：
- 默认：4000 kHz
- 较低值以提高稳定性（500-1000 kHz）
- 较高值以提高速度（最高 10000 kHz）

**LiveWatch 变量**：
1. 启用 LiveWatch 复选框
2. 添加要监控的变量：
   - 点击"添加变量"
   - 输入变量名
   - 支持全局变量、结构成员
3. 配置更新频率（1-100 采样/秒）

### 使用多个配置

扩展支持多个调试配置：

1. 为不同目标生成不同配置
2. 每个配置都以唯一名称保存
3. 从树视图访问最近配置
4. 轻松在配置间切换

## ⚙️ 配置选项

### 扩展设置

| 设置 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `stm32-configurator.openocdPath` | string | "" | OpenOCD 可执行文件的自定义路径 |
| `stm32-configurator.language` | enum | "en" | 显示语言（en/zh） |

### 生成的配置结构

扩展在 `.vscode/launch.json` 中生成完整的调试配置：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "STM32 Debug",
      "type": "cortex-debug",
      "request": "launch",
      "servertype": "openocd",
      "cwd": "${workspaceFolder}",
      "executable": "${workspaceFolder}/build/Debug/project.elf",
      "configFiles": [
        "interface/stlink.cfg",
        "target/stm32f4x.cfg"
      ],
      "svdFile": "${workspaceFolder}/STM32F407.svd",
      "openOCDLaunchCommands": [
        "adapter speed 4000"
      ],
      "liveWatch": {
        "enabled": true,
        "samplesPerSecond": 4
      }
    }
  ]
}
```

## 🖼️ 界面截图

### 主配置界面
主要的 webview 面板提供了直观的表单来配置所有调试设置：
- 清爽现代的设计，支持主题
- 实时验证和反馈
- 可搜索的文件选择下拉菜单
- 按不同配置方面组织的有序部分

### 树视图侧边栏
活动栏侧边栏显示：
- 当前调试配置
- 最近配置历史记录
- 快速操作按钮
- 配置状态指示器

### LiveWatch 配置
动态变量管理界面：
- 动态添加/删除变量
- 配置更新频率
- 活动变量的可视化反馈

## 💻 支持的平台

| 平台 | 支持 | 备注 |
|------|------|------|
| Windows | ✅ 完全支持 | 自动检测 STM32CubeIDE 安装 |
| macOS | ✅ 完全支持 | 支持 Homebrew OpenOCD |
| Linux | ✅ 完全支持 | 检测包管理器安装 |

### OpenOCD 自动检测路径

**Windows**：
- STM32CubeIDE 安装
- `C:\OpenOCD\`
- `C:\Program Files\OpenOCD\`
- `%USERPROFILE%\AppData\` 中的 xPack 安装

**macOS/Linux**：
- 系统 PATH
- `/usr/local/bin/`
- `/opt/openocd/`
- 用户主目录安装

## 🔧 故障排除

### 常见问题和解决方案

#### OpenOCD 未检测到
**问题**：扩展无法找到 OpenOCD
**解决方案**：
1. 从[官方发布页面](https://github.com/openocd-org/openocd/releases)安装 OpenOCD
2. 使用"浏览"按钮手动选择 OpenOCD 可执行文件
3. 或在 VS Code 设置中设置路径：`stm32-configurator.openocdPath`

#### 接口/目标文件未填充
**问题**：下拉列表为空
**解决方案**：
1. 确保 OpenOCD 路径配置正确
2. 点击"扫描"刷新 OpenOCD 检测
3. 检查 OpenOCD 安装是否包含配置文件

#### Cortex-Debug 不工作
**问题**：调试会话启动失败
**解决方案**：
1. 从市场安装 Cortex-Debug 扩展
2. 确保 GDB 已安装并在 PATH 中
3. 验证 .elf 文件路径正确
4. 检查调试控制台的具体错误消息

#### 搜索功能不工作
**问题**：搜索框不过滤结果
**解决方案**：
1. 确保在搜索框中输入，而不是下拉菜单
2. 等待过滤生效
3. 用 × 按钮清除搜索重置

### 调试控制台命令

调试会话期间有用的 OpenOCD 命令：
```
monitor reset halt     # 复位并停止目标
monitor flash erase_address 0x08000000 0x100000  # 擦除闪存
monitor flash write_image erase firmware.elf     # 编程闪存
monitor reset run      # 复位并运行
```

## 📝 更新日志

### 版本 1.0.3（最新）— 2026 年 4 月

#### 🐛 修复
- **OpenOCD scripts 目录识别覆盖更多打包方式**：之前只检查 `<root>/share/openocd/scripts` 和 `<root>/scripts`，遇到从 GitHub 下载的 win32-x64 包多嵌一层 `openocd/`（`C:\Program Files\openocd\openocd\scripts\`）的解压结构时，cfg 选择器一直空。新增对 `OPENOCD_SCRIPTS` 环境变量、`<root>/openocd/scripts`、`<root>/openocd/share/openocd/scripts`、`<binDir>/scripts` 的识别，并以 installRoot 为起点递归两层兜底搜索；候选要求同时含 `interface/` 和 `target/` 子目录避免误命中

### 版本 1.0.2 — 2026 年 4 月

#### 🐛 修复
- **修复 Marketplace 安装后所有命令报 `command 'xxx' not found` 的致命问题**：`src/services/index.ts` 的 barrel 文件意外再导出了 `./toolchainDetectionService.test`，编译产物里 `out/services/index.js` 因此 `require('./toolchainDetectionService.test')`；`.vscodeignore` 已把 `*.test.js` 从 vsix 排除，导致激活时 `Cannot find module` 异常，`activate()` 整个挂掉，所有命令注册都跑不到。dev (F5) 因为 out/ 完整不受影响，只有发布版本受波及

### 版本 1.0.1 — 2026 年 4 月

#### 🌏 默认语言改为中文
- 扩展首次安装时 webview UI 默认显示中文；如果 VS Code 本身是英文界面则自动切换为英文
- Marketplace 详情页默认显示中文 README（原英文版本迁到 `README_en.md`）
- 已经手动切换过语言的用户保留原选择，不会被强制覆盖

#### 📝 修正
- 1.0.0 CHANGELOG 移除错误列入的内部开发条目（未影响实际功能）

### 版本 1.0.0 — 2026 年 4 月 🎉

**首个稳定版本**。本次自动化重做将"读 .ioc → 找工具链 → 选 cfg → 输出 launch.json"全链路从手动填表升级为打开即用。

#### ✨ 新增功能
- **STM32 设备自动检测**：扫描工作区里 `.ioc` / `.cproject` / `CMakeLists.txt`，自动填型号（如 `STM32H743ZITx`），下方显示来源文件
- **固件文件自动扫描**：发现 `build/Debug` 等目录下所有 `.elf` / `.axf` / `.bin` / `.hex`，按 Debug > Release、elf > axf > hex > bin 排序后下拉选择
- **OpenOCD cfg 模态选择器**：点击接口/目标输入框 → 弹出居中对话框，顶部搜索 + 滚动列表 + 当前值高亮 + ↑↓/Enter/Esc 键盘操作 + 背景模糊
- **多工具链候选下拉**：列出所有检测到的 ARM 工具链（STM32 官方扩展 bundle 各版本、PATH、cortex-debug 用户配置、其他常见路径），下拉切换无需重新扫描
- **STM32 官方扩展 bundle 优先识别**：`%LOCALAPPDATA%\stm32cube\bundles\gnu-tools-for-stm32\<ver>` 自动转成 `${env:LOCALAPPDATA}/...` 可移植格式写入 launch.json
- **target.cfg / interface.cfg 智能匹配**：根据设备型号推 target（`STM32H7 → stm32h7x.cfg`）；接口默认 `cmsis-dap.cfg → stlink.cfg`；用户手动选择后不再覆盖
- **SWD / JTAG 传输方式选择**：影响 `interface` 字段和 `openOCDLaunchCommands` 的 `transport select`
- **`gdbPath` 自动写入**：根据工具链 bin 推导，ST bundle 走可移植形式

#### 🎨 UI 重做
- **12 列响应式 grid + 卡片布局**，替代原来的长竖条。卡片：项目 / 目标设备 / GDB Server / ARM 工具链 / 高级选项
- 编号徽章、统一间距阶梯、native VS Code 颜色变量、自定义下拉箭头、status / info 卡视觉重做

#### 🔧 修复
- `armToolchainPath` 修正为 bin 目录（cortex-debug 期望的格式），之前错写成 `gcc.exe` 完整路径
- 生成的 launch.json 补全 `serverpath` / `interface` / `showDevDebugOutput` / `transport select`，空 SVD 不再写入
- 不再生成 `${command:st-stm32-ide-debug-launch...}` 这种依赖 ST 扩展的字符串
- 修复 webview 消息丢失 race（`onDidReceiveMessage` 注册时机过晚导致 cfg 下拉一直空）
- 修复 `expandPath` 通配符 `*` 在路径中段时 baseDir 算偏一级的 bug
- 修复多个未定义全局（`stateManager` / `createStateIndicator` / `validateGenerationData`）导致 webview 初始化崩溃
- 修复 target / interface 智能填充被默认选中误判为"用户已选过"
- 修复语言切换 dropdown 与实际 UI 不一致

### 版本 0.2.5
- 📚 **文档和打包更新**：同步所有版本的README版本信息和更新日志
- 📦 **包优化**：清理VSIX包，排除开发文件和文档
- ✅ **版本一致性**：确保package.json、README和GitHub发布版本对齐
- 🔄 **改进发布流程**：完善打包和发布工作流程

### 版本 0.2.4
- 🔧 **强化 OpenOCD 配置验证**：增强配置验证机制，防止配置错误
- ⚡ **改进错误处理**：更好的错误检测和用户反馈
- 🛡️ **增强调试可靠性**：提高调试配置生成过程的稳定性  
- ✅ **完善验证逻辑**：更全面的OpenOCD路径和配置检查

### 版本 0.2.3
- 🔧 **ARM工具链完整集成**：完整的ARM GNU工具链检测和配置
- 🎯 **智能路径检测**：多策略工具链发现，跨平台支持
- 📚 **用户友好设置**：直接下载链接和引导式配置流程
- ⚙️ **自动配置服务**：一键完整环境设置
- 🌐 **路径标准化**：跨平台路径处理和正斜杠标准化

### 版本 0.2.2
- 🔧 版本升级和功能优化
- ➕ 添加部分操作和功能完善

### 版本 0.2.1
- 🔍 增强了接口和目标文件的搜索功能
- 📁 添加了 OpenOCD 可执行文件选择的文件浏览器
- 🌍 改进了本地化支持
- 🐛 错误修复和性能改进

### 版本 0.2.0
- 🎯 添加了活动栏集成
- 📊 实现了 LiveWatch 变量监控
- 🌐 添加了多语言支持（中英文）
- 🔧 改进了 OpenOCD 路径检测

### 版本 0.1.0
- ✨ 主要功能更新
- 🎨 新的现代界面设计
- 📁 添加了树视图侧边栏
- 🔄 配置持久化

### 版本 0.0.9
- 🚀 首次公开发布
- 📝 基础配置生成
- 🔧 OpenOCD 集成

## 🤝 贡献

欢迎贡献！请随时提交问题和拉取请求。

### 开发设置

1. 克隆仓库：
```bash
git clone https://github.com/zuoliangyu/stm32-configurator-by-zuolan.git
```

2. 安装依赖：
```bash
npm install
```

3. 在 VS Code 中打开：
```bash
code stm32-configurator-by-zuolan
```

4. 按 `F5` 在新的扩展开发主机窗口中运行扩展

### 测试

```bash
npm run test:all      # 运行所有测试
npm run test:unit     # 运行单元测试
npm run test:coverage # 运行带覆盖率的测试
```

## 🙏 致谢

- **Cortex-Debug** - 提供调试框架
- **OpenOCD** - STM32 调试支持
- **VS Code 团队** - 出色的扩展 API
- **STM32 社区** - 反馈和建议

特别感谢所有帮助改进此扩展的贡献者和用户！

## 📄 许可证

本项目基于 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

---

<div align="center">

**用 ❤️ 创建，作者：左岚**

版权所有 (c) 2025 左岚。保留所有权利。

[报告错误](https://github.com/zuoliangyu/stm32-configurator-by-zuolan/issues) | [请求功能](https://github.com/zuoliangyu/stm32-configurator-by-zuolan/issues)

</div>