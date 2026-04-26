# STM32 Debug Configurator (by zuolan)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)
![VS Code](https://img.shields.io/badge/VS%20Code-^1.80.0-007ACC.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Downloads](https://img.shields.io/visual-studio-marketplace/d/zuolan.stm32-configurator-by-zuolan?label=downloads)
![Rating](https://img.shields.io/visual-studio-marketplace/r/zuolan.stm32-configurator-by-zuolan?label=rating)

[中文](README.md) | [English](README_en.md)

<img src="icon.png" width="128" height="128" alt="STM32 Debug Configurator Icon">

**Professional Visual Studio Code Extension for STM32 Debug Configuration Management**

*Streamline your embedded development workflow with intelligent configuration generation*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Detailed Usage Guide](#-detailed-usage-guide)
- [Configuration Reference](#️-configuration-reference)
- [Advanced Features](#-advanced-features)
- [Platform Support](#-platform-support)
- [Troubleshooting](#-troubleshooting)
- [Testing](#-testing)
- [Release Notes](#-release-notes)
- [Contributing](#-contributing)
- [Support](#-support)
- [License](#-license)

## 🎯 Overview

**STM32 Debug Configurator** is a professional-grade Visual Studio Code extension that revolutionizes the STM32 debugging workflow. Built specifically for embedded developers, it eliminates the complexity of manual debug configuration through an intelligent, visual interface that generates production-ready Cortex-Debug configurations.

### The Problem It Solves

Configuring debugging for STM32 microcontrollers traditionally requires:
- Manual editing of complex JSON configuration files
- Deep knowledge of OpenOCD, GDB server settings, and target specifications
- Time-consuming trial and error to get configurations working
- Difficulty managing multiple debug configurations for different targets

### Our Solution

This extension provides a comprehensive, intelligent configuration system that:
- **Automates** the entire debug configuration process
- **Validates** settings in real-time to prevent errors
- **Integrates** seamlessly with your existing VS Code workflow
- **Scales** from simple projects to complex multi-target systems

### Why STM32 Debug Configurator?

#### 🚀 **Productivity Boost**
- Cut debug setup time from hours to minutes
- Zero manual JSON editing required
- Intelligent auto-detection of tools and paths
- One-click configuration generation

#### 🎯 **Professional Features**
- Enterprise-grade reliability with comprehensive testing
- Cross-platform support (Windows, macOS, Linux)
- Multi-language interface (English/Chinese)
- Extensive documentation and support

#### 🔧 **Technical Excellence**
- Built with TypeScript for reliability and performance
- Comprehensive test coverage (>80%)
- Clean architecture following best practices
- Active development and regular updates

## ✨ Key Features

### 🎯 Core Capabilities

#### **Intelligent Configuration Generation**
- **Smart Detection**: Automatically discovers OpenOCD installations, ARM toolchains, and project structure
- **One-Click Setup**: Generate complete debug configurations with a single button
- **Multi-Target Support**: Manage configurations for multiple STM32 targets in one project
- **Configuration Validation**: Real-time validation prevents invalid configurations

#### **ARM Toolchain Integration** ⭐ *NEW in v0.2.3*
- **Automatic Detection**: Intelligent discovery of ARM GNU toolchain installations
- **Path Standardization**: Cross-platform path handling with forward slash normalization
- **User Guidance**: Step-by-step setup with direct links to ARM developer downloads
- **Seamless Integration**: Works alongside existing OpenOCD configuration workflow

#### **Visual Configuration Interface**
- **Modern UI Design**: Clean, intuitive interface that follows VS Code design language
- **Theme Support**: Seamless integration with VS Code light and dark themes
- **Responsive Layout**: Adapts to different screen sizes and orientations
- **Accessibility**: Full keyboard navigation and screen reader support

#### **Advanced Search & Discovery**
- **Smart Filtering**: Real-time search for interface and target configuration files
- **File Browser Integration**: Native file browser for selecting executables and paths
- **Auto-Complete**: Intelligent suggestions for common configurations
- **History Tracking**: Quick access to recently used configurations

### 🚀 Professional Features

#### **Activity Bar Integration**
- **Dedicated Icon**: Quick access from VS Code's activity bar
- **Tree View Explorer**: Hierarchical view of all debug configurations
- **Context Menus**: Right-click actions for common operations
- **Status Indicators**: Visual feedback for configuration status

#### **LiveWatch Variable Monitoring**
- **Real-Time Updates**: Monitor variable values during debugging sessions
- **Dynamic Management**: Add/remove watched variables on the fly
- **Performance Optimization**: Configurable update rates (1-100 Hz)
- **Expression Support**: Watch complex expressions and struct members

#### **Multi-Language Support**
- **Automatic Detection**: Detects system language on first launch
- **Seamless Switching**: Change language without restart
- **Complete Localization**: All UI elements, messages, and documentation
- **Supported Languages**: English and Simplified Chinese

### 🔧 Technical Features

#### **GDB Server Flexibility**
| Server | Support Level | Use Case |
|--------|--------------|----------|
| OpenOCD | ⭐⭐⭐⭐⭐ Full | Recommended for all STM32 devices |
| J-Link | ⭐⭐⭐⭐⭐ Full | Professional debugging with J-Link probes |
| pyOCD | ⭐⭐⭐⭐ Good | Python-based debugging |
| ST-Link | ⭐⭐⭐⭐ Good | Official ST debugging |
| ST-Util | ⭐⭐⭐ Basic | Legacy support |

#### **Dependency Management**
- **Automatic Detection**: Identifies missing dependencies
- **Guided Installation**: Step-by-step installation assistance
- **Version Compatibility**: Ensures compatible versions are used
- **Fallback Options**: Works even with partial dependencies

#### **Configuration Persistence**
- **Auto-Save**: Changes are automatically saved
- **History Management**: Track and revert configuration changes
- **Export/Import**: Share configurations between projects
- **Workspace Settings**: Per-project configuration support

## 📦 Installation

### System Requirements

| Component | Minimum Version | Recommended Version |
|-----------|----------------|-------------------|
| VS Code | 1.80.0 | Latest stable |
| Node.js | 16.x | 18.x or higher |
| RAM | 4 GB | 8 GB or more |
| Disk Space | 100 MB | 500 MB |

### Prerequisites

#### Required Dependencies
- **Visual Studio Code**: Version 1.80.0 or higher
  - [Download VS Code](https://code.visualstudio.com/download)
- **Cortex-Debug Extension**: Automatically detected and installed
  - Manual installation: Search for "cortex-debug" in Extensions

#### Recommended Tools
- **OpenOCD**: For STM32 debugging (highly recommended)
  - Version 0.11.0 or higher recommended
- **GDB**: ARM GDB for debugging
  - Usually included with ARM toolchain
- **STM32CubeMX**: For project generation (optional)

### Installation Methods

#### 🎯 Method 1: VS Code Marketplace (Recommended)

```bash
1. Open Visual Studio Code
2. Press Ctrl+Shift+X (Windows/Linux) or Cmd+Shift+X (macOS)
3. Search: "STM32 Debug Configurator by zuolan"
4. Click "Install"
5. Restart VS Code when prompted
```

#### 📦 Method 2: Command Line Installation

```bash
code --install-extension zuolan.stm32-configurator-by-zuolan
```

#### 🔧 Method 3: Manual VSIX Installation

1. Download the latest `.vsix` file:
   ```bash
   wget https://github.com/zuoliangyu/stm32-configurator-by-zuolan/releases/latest/download/stm32-configurator.vsix
   ```
2. Install via command line:
   ```bash
   code --install-extension stm32-configurator.vsix
   ```
   Or through VS Code UI:
   - Extensions view → ⋯ Menu → "Install from VSIX..."

### Platform-Specific Setup

#### 🪟 Windows Setup

```powershell
# Install OpenOCD (recommended)
# Option 1: Download from official releases
# https://github.com/openocd-org/openocd/releases

# Option 2: Using Chocolatey
choco install openocd

# Option 3: Using STM32CubeIDE (includes OpenOCD)
# Download from st.com
```

#### 🍎 macOS Setup

```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install OpenOCD
brew install openocd

# Install ARM toolchain
brew tap ArmMbed/homebrew-formulae
brew install arm-none-eabi-gcc
```

#### 🐧 Linux Setup

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install openocd gdb-multiarch

# Fedora
sudo dnf install openocd arm-none-eabi-gdb

# Arch Linux
sudo pacman -S openocd arm-none-eabi-gdb
```

### Post-Installation Configuration

#### Step 1: Verify Installation

Open Command Palette (`Ctrl+Shift+P`) and run:
```
STM32: Generate Debug Configuration
```

#### Step 2: Configure OpenOCD Path (if needed)

If OpenOCD is not auto-detected:
1. Open Settings (`Ctrl+,`)
2. Search for `stm32-configurator.openocdPath`
3. Set the full path to OpenOCD executable

Example paths:
- Windows: `C:\Program Files\OpenOCD\bin\openocd.exe`
- macOS: `/usr/local/bin/openocd`
- Linux: `/usr/bin/openocd`

#### Step 3: Configure Language Preference

1. Open Settings
2. Search for `stm32-configurator.language`
3. Select `en` (English) or `zh` (Chinese)

## 🚀 Quick Start

### Getting Started in 3 Minutes

1. **Open Your Project**
   ```bash
   code your-stm32-project/
   ```

2. **Launch Configuration Tool**
   - Click the STM32 icon in the Activity Bar (left sidebar)
   - Or press `Ctrl+Shift+P` → "STM32: Generate Debug Configuration"

3. **Configure & Generate**
   - The extension auto-detects OpenOCD and ARM toolchain paths
   - For ARM toolchain: Click "Browse" or use direct download link to [ARM Developer](https://developer.arm.com/downloads/-/arm-gnu-toolchain-downloads)
   - Review and adjust settings if needed
   - Click "Generate Configuration"

4. **Start Debugging**
   - Press `F5` or click "Run and Debug"
   - Your debug session starts immediately!

## 📖 Detailed Usage Guide

### Step-by-Step Configuration

#### 🎯 Step 1: Project Setup

##### Automatic Detection
The extension automatically detects:
- Build output directory
- Executable (.elf) files
- Existing debug configurations
- Installed toolchains

##### Manual Configuration
For custom setups, you can specify:
```json
{
  "executable": "${workspaceFolder}/build/firmware.elf",
  "searchDir": ["${workspaceFolder}/build"],
  "configFiles": ["custom.cfg"]
}
```

#### 🔧 Step 2: Debugger Configuration

##### Selecting Your Debug Probe

| Probe Type | Interface File | Typical Use |
|------------|---------------|-------------|
| ST-Link V2/V3 | `stlink.cfg` | Official ST debugger |
| J-Link | `jlink.cfg` | Professional debugging |
| CMSIS-DAP | `cmsis-dap.cfg` | Open-source debuggers |
| Black Magic | `blackmagic.cfg` | Integrated GDB server |

##### Smart Search Features
- **Type to Filter**: Start typing to filter hundreds of options
- **Recent Items**: Recently used items appear at the top
- **Favorites**: Star frequently used configurations
- **Categories**: Files are organized by type

#### 🎯 Step 3: Target Selection

##### Finding Your MCU
Use the search box with these patterns:
- Series: `f4` → All STM32F4 targets
- Specific: `f407` → STM32F407 variants
- Family: `h7` → All STM32H7 targets

##### Common Target Configurations

```plaintext
STM32F0 Series:  stm32f0x.cfg
STM32F1 Series:  stm32f1x.cfg
STM32F2 Series:  stm32f2x.cfg
STM32F3 Series:  stm32f3x.cfg
STM32F4 Series:  stm32f4x.cfg
STM32F7 Series:  stm32f7x.cfg
STM32G0 Series:  stm32g0x.cfg
STM32G4 Series:  stm32g4x.cfg
STM32H7 Series:  stm32h7x.cfg
STM32L0 Series:  stm32l0.cfg
STM32L1 Series:  stm32l1.cfg
STM32L4 Series:  stm32l4x.cfg
STM32L5 Series:  stm32l5x.cfg
STM32U5 Series:  stm32u5x.cfg
STM32WB Series:  stm32wbx.cfg
STM32WL Series:  stm32wlx.cfg
```

### 📊 Advanced Features

#### LiveWatch Configuration

##### Setting Up Variable Monitoring
1. **Enable LiveWatch**: Check the LiveWatch option
2. **Add Variables**:
   ```c
   // Global variables
   myGlobalVar
   
   // Struct members
   myStruct.member
   
   // Array elements
   myArray[0]
   
   // Pointer dereferencing
   *myPointer
   ```
3. **Configure Update Rate**: 1-100 samples/second

##### Performance Optimization
- **Low Rate (1-4 Hz)**: For slow-changing values
- **Medium Rate (10-20 Hz)**: General purpose monitoring
- **High Rate (50-100 Hz)**: Real-time critical values

#### SVD File Integration

##### Benefits
- View peripheral registers in debug session
- Modify register values in real-time
- Understand hardware state at a glance

##### Setup
1. Download SVD file for your MCU from [ST's website](https://www.st.com)
2. Place in project directory
3. Configure path: `${workspaceFolder}/STM32F407.svd`

#### Custom OpenOCD Commands

##### Pre-Launch Commands
```json
"preLaunchCommands": [
    "monitor reset halt",
    "monitor flash erase_sector 0 0 last"
]
```

##### Post-Launch Commands
```json
"postLaunchCommands": [
    "monitor arm semihosting enable",
    "monitor reset init"
]
```

### 🔄 Workflow Examples

#### Example 1: Basic STM32F4 Discovery Board

```json
{
  "name": "STM32F4 Discovery Debug",
  "executable": "${workspaceFolder}/build/app.elf",
  "servertype": "openocd",
  "configFiles": [
    "interface/stlink.cfg",
    "target/stm32f4x.cfg"
  ],
  "searchDir": ["${workspaceFolder}/build"],
  "svdFile": "${workspaceFolder}/STM32F407.svd"
}
```

#### Example 2: Custom Board with J-Link

```json
{
  "name": "Custom Board J-Link Debug",
  "executable": "${workspaceFolder}/firmware.elf",
  "servertype": "jlink",
  "device": "STM32H743ZI",
  "interface": "swd",
  "runToMain": true
}
```

#### Example 3: Multi-Core STM32H7

```json
{
  "name": "STM32H7 Dual Core",
  "executable": "${workspaceFolder}/CM7/app.elf",
  "servertype": "openocd",
  "configFiles": [
    "interface/stlink-v3.cfg",
    "target/stm32h7x_dual_bank.cfg"
  ],
  "openOCDLaunchCommands": [
    "adapter speed 8000"
  ]
}

```

## ⚙️ Configuration Reference

### Extension Settings

Access via: `File → Preferences → Settings → Extensions → STM32 Configurator`

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `stm32-configurator.openocdPath` | string | `""` | Custom OpenOCD executable path |
| `stm32-configurator.language` | enum | `"en"` | Interface language (`en` or `zh`) |
| `stm32-configurator.defaultServerType` | string | `"openocd"` | Default GDB server type |
| `stm32-configurator.defaultAdapterSpeed` | number | `4000` | Default adapter speed in kHz |
| `stm32-configurator.autoDetectExecutable` | boolean | `true` | Auto-detect .elf files |
| `stm32-configurator.saveHistory` | boolean | `true` | Save configuration history |

### Generated Configuration Schema

#### Complete Configuration Example

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      // Basic Configuration
      "name": "STM32 Debug",
      "type": "cortex-debug",
      "request": "launch",
      "servertype": "openocd",
      
      // Executable Configuration
      "executable": "${workspaceFolder}/build/firmware.elf",
      "searchDir": ["${workspaceFolder}/build"],
      "cwd": "${workspaceFolder}",
      
      // OpenOCD Configuration
      "configFiles": [
        "interface/stlink.cfg",
        "target/stm32f4x.cfg"
      ],
      "openOCDLaunchCommands": [
        "adapter speed 4000",
        "transport select swd"
      ],
      
      // Optional Enhancements
      "svdFile": "${workspaceFolder}/STM32F407.svd",
      "runToMain": true,
      "preLaunchTask": "build",
      
      // LiveWatch Configuration
      "liveWatch": {
        "enabled": true,
        "samplesPerSecond": 4
      },
      
      // Advanced Options
      "showDevDebugOutput": false,
      "rttConfig": {
        "enabled": true,
        "address": "auto"
      }
    }
  ]
}
```

### Configuration Properties

#### Essential Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Configuration name shown in debug dropdown |
| `type` | string | Must be `"cortex-debug"` |
| `request` | string | `"launch"` or `"attach"` |
| `servertype` | string | GDB server type |
| `executable` | string | Path to .elf file |

#### Server-Specific Properties

##### OpenOCD
| Property | Type | Description |
|----------|------|-------------|
| `configFiles` | array | OpenOCD configuration files |
| `searchDir` | array | Symbol search directories |
| `openOCDLaunchCommands` | array | Commands to run on launch |

##### J-Link
| Property | Type | Description |
|----------|------|-------------|
| `device` | string | Target device name |
| `interface` | string | `"swd"` or `"jtag"` |
| `serialNumber` | string | J-Link serial (optional) |

### Workspace Variables

Supported variables in paths:
- `${workspaceFolder}` - Workspace root directory
- `${workspaceFolderBasename}` - Workspace folder name
- `${file}` - Current file
- `${fileBasename}` - Current file name
- `${env:VARIABLE}` - Environment variable

## 🎨 Advanced Features

### Multi-Configuration Management

#### Creating Configuration Profiles

```json
{
  "configurations": [
    {
      "name": "Debug (Development)",
      "preLaunchTask": "build-debug",
      // Debug build settings
    },
    {
      "name": "Release (Testing)",
      "preLaunchTask": "build-release",
      // Release build settings
    },
    {
      "name": "Production (Flash)",
      "request": "attach",
      // Production flash settings
    }
  ]
}
```

### Integration with Build Systems

#### Make Integration
```json
{
  "preLaunchTask": "make",
  "postDebugTask": "make clean"
}
```

#### CMake Integration
```json
{
  "preLaunchTask": "cmake-build",
  "executable": "${workspaceFolder}/build/${config:buildType}/app.elf"
}
```

#### PlatformIO Integration
```json
{
  "preLaunchTask": "PlatformIO: Build",
  "executable": "${workspaceFolder}/.pio/build/board/firmware.elf"
}
```

## 💻 Platform Support

### Comprehensive Platform Matrix

| Platform | Version | OpenOCD | J-Link | ST-Link | pyOCD |
|----------|---------|---------|--------|---------|-------|
| Windows 10/11 | ✅ Full | ✅ | ✅ | ✅ | ✅ |
| Windows 7/8 | ⚠️ Limited | ✅ | ✅ | ✅ | ❌ |
| macOS 12+ | ✅ Full | ✅ | ✅ | ✅ | ✅ |
| macOS 10.15+ | ✅ Full | ✅ | ✅ | ⚠️ | ✅ |
| Ubuntu 20.04+ | ✅ Full | ✅ | ✅ | ✅ | ✅ |
| Debian 11+ | ✅ Full | ✅ | ✅ | ✅ | ✅ |
| Fedora 35+ | ✅ Full | ✅ | ✅ | ✅ | ✅ |
| Arch Linux | ✅ Full | ✅ | ✅ | ✅ | ✅ |

### Auto-Detection Locations

#### Windows
```
C:\Program Files\OpenOCD\
C:\Program Files (x86)\OpenOCD\
C:\OpenOCD\
C:\STMicroelectronics\STM32Cube\STM32CubeProgrammer\
%LOCALAPPDATA%\xPack\OpenOCD\
%USERPROFILE%\.platformio\packages\tool-openocd\
```

#### macOS
```
/usr/local/bin/
/opt/homebrew/bin/
/Applications/STM32CubeIDE.app/
~/Library/xPack/OpenOCD/
~/.platformio/packages/tool-openocd/
```

#### Linux
```
/usr/bin/
/usr/local/bin/
/opt/openocd/bin/
~/.local/xPack/OpenOCD/
~/.platformio/packages/tool-openocd/

```

## 🔧 Troubleshooting

### Quick Fixes

#### 🔴 OpenOCD Not Detected

**Symptoms**: "OpenOCD not found" message
**Solutions**:
```bash
# Option 1: Install OpenOCD
# Windows (Admin PowerShell)
choco install openocd

# macOS
brew install openocd

# Linux
sudo apt install openocd

# Option 2: Manual Configuration
1. Settings → Extensions → STM32 Configurator
2. Set "OpenOCD Path" to full executable path
3. Restart VS Code
```

#### 🔴 Empty Configuration Dropdowns

**Symptoms**: No interface/target files listed
**Solutions**:
1. Click "Scan" button to refresh detection
2. Verify OpenOCD installation:
   ```bash
   openocd --version
   ```
3. Check configuration files exist:
   ```bash
   ls $(openocd --version 2>&1 | grep -oP '(?<=OPENOCD_SCRIPTS=)[^\s]+')
   ```

#### 🔴 Debug Session Won't Start

**Symptoms**: F5 doesn't start debugging
**Diagnostic Steps**:
```json
// Add to launch.json for verbose output
"showDevDebugOutput": "both",
"trace": true
```

**Common Fixes**:
- Verify .elf file exists at specified path
- Check GDB is installed: `arm-none-eabi-gdb --version`
- Ensure target is connected and powered
- Try lower adapter speed (1000 kHz)

#### 🔴 LiveWatch Not Working

**Symptoms**: Variables show as "undefined"
**Solutions**:
- Ensure variables are in scope
- Check optimization level (use `-O0` for debugging)
- Verify symbol table: `arm-none-eabi-objdump -t firmware.elf`

### Advanced Troubleshooting

#### Permission Issues

##### Windows
```powershell
# Run VS Code as Administrator
# Or grant USB permissions via Device Manager
```

##### Linux
```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER
# Create udev rules
echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="0483", MODE="0666"' | sudo tee /etc/udev/rules.d/99-stlink.rules
sudo udevadm control --reload-rules
```

##### macOS
```bash
# No special permissions needed
# If issues persist, check System Preferences → Security & Privacy
```

#### Connection Issues

##### ST-Link Issues
```bash
# Reset ST-Link firmware
st-flash --reset

# Update ST-Link firmware
# Use STM32CubeProgrammer or st-link upgrade utility
```

##### J-Link Issues
```bash
# Check J-Link connection
JLinkExe -device STM32F407VG -if SWD -speed 4000

# Update J-Link drivers
# Download from segger.com
```

#### Performance Issues

##### Slow Debugging
- Reduce adapter speed to 1000-2000 kHz
- Disable LiveWatch or reduce sample rate
- Close other USB devices
- Use USB 2.0 port instead of USB 3.0

##### Memory Issues
- Increase VS Code memory limit:
  ```json
  // .vscode/argv.json
  {
    "max-memory": 4096
  }
  ```

### Diagnostic Commands

#### OpenOCD Diagnostics
```bash
# Test OpenOCD configuration
openocd -f interface/stlink.cfg -f target/stm32f4x.cfg -c "init; targets; exit"

# List available interfaces
openocd -c "interface_list; exit"

# Check USB devices
# Windows
wmic path Win32_USBControllerDevice

# Linux
lsusb -v | grep -E "ST-Link|CMSIS-DAP|J-Link"

# macOS
system_profiler SPUSBDataType | grep -E "ST-Link|CMSIS-DAP|J-Link"
```

#### GDB Diagnostics
```bash
# Test GDB connection
arm-none-eabi-gdb
(gdb) target remote localhost:3333
(gdb) monitor targets
(gdb) quit
```

### Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `Error: unable to open ftdi device` | Driver issue | Reinstall FTDI drivers |
| `Error: init mode failed` | Wrong target config | Verify MCU model matches config |
| `Error: JTAG scan chain interrogation failed` | Connection issue | Check wiring and power |
| `Error: couldn't open firmware.elf` | File not found | Verify build output path |
| `Error: Remote connection closed` | GDB server crashed | Check OpenOCD logs |

## 🧪 Testing

### Test Coverage

The extension maintains comprehensive test coverage:
- **Unit Tests**: >80% coverage
- **Integration Tests**: Critical paths covered
- **Cross-Platform Tests**: Windows, macOS, Linux

### Running Tests

```bash
# Run all tests
npm run test:all

# Run specific test suites
npm run test:unit         # Unit tests only
npm run test:integration  # Integration tests
npm run test:platform     # Platform-specific tests

# Generate coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Test Strategy

- **Automated Testing**: CI/CD pipeline on GitHub Actions
- **Manual Testing**: Comprehensive checklist for releases
- **Performance Testing**: Response time benchmarks
- **Regression Testing**: Backward compatibility verification

## 📝 Release Notes

### Version 1.0.1 (Current) - April 2026

#### 🌏 Default Language Switched to Chinese
- New installs now show the webview UI in Chinese by default. English VS Code locales still get the English UI automatically.
- The Marketplace page now shows the Chinese README by default (the English version moved to `README_en.md`).
- Users who have manually picked a language keep their choice — never force-overridden.

#### 📝 Corrections
- Removed internal-only entries (custom dev launch profile, watch script, test scripts) from the 1.0.0 changelog. No actual feature impact.

### Version 1.0.0 - April 2026 🎉

**First stable release.** Major automation overhaul: walk away from filling forms manually, the extension now scans your workspace and pre-fills almost everything.

#### ✨ New Features
- **STM32 device auto-detection**: Reads `Mcu.UserName` from `.ioc`, falls back to `.cproject` / `CMakeLists.txt`. Source file shown under the input.
- **Firmware file scanning**: Discovers all `.elf` / `.axf` / `.bin` / `.hex` in common build output dirs; user picks from a dropdown sorted by Debug > Release and elf > axf > hex > bin.
- **Modal cfg picker**: Click the Interface / Target File input → dialog opens with searchable list, highlighted current selection, full keyboard navigation (↑↓/Enter/Esc).
- **Multi-toolchain dropdown**: Lists every detected ARM toolchain (STM32 VS Code Extension bundle versions, PATH, cortex-debug user config, common installs); switch in-place without re-scanning.
- **STM32 official extension bundle awareness**: Auto-detects `%LOCALAPPDATA%\stm32cube\bundles\gnu-tools-for-stm32\<ver>`; output path is converted to portable `${env:LOCALAPPDATA}/...` form so the launch.json works on any machine.
- **Smart cfg matching**: Target.cfg inferred from device name (`STM32H743ZITx → stm32h7x.cfg`); interface.cfg defaults to `cmsis-dap.cfg → stlink.cfg`. Both respect manual user choice.
- **SWD / JTAG transport selector**: Affects both `interface` field and `openOCDLaunchCommands`.
- **`gdbPath` written automatically** based on toolchain bin directory (portable for ST bundle).

#### 🎨 UI Redesign
- **12-column responsive grid + card layout**, replacing the previous long single-column form. Cards: Project / Target Device / GDB Server / ARM Toolchain / Advanced.
- Refined typography, spacing, custom select arrows, status cards, info cards.
- Fully native VS Code theme variables for dark/light/high-contrast.

#### 🔧 Fixes
- Fixed `armToolchainPath` being written as `gcc.exe` path (cortex-debug expects the `bin` directory).
- Generated launch.json now includes `serverpath`, `interface`, `showDevDebugOutput`, and `transport select` in `openOCDLaunchCommands`.
- Removed the `${command:st-stm32-ide-debug-launch...}` fallback that required the ST extension to resolve at runtime.
- Fixed a webview message race where `onDidReceiveMessage` was registered after the initial `postMessage` calls, causing cfg dropdowns to stay empty until the user manually clicked Scan.
- Fixed a path-glob bug where `*` in the middle of a path (e.g. `bundles/gnu-tools-for-stm32/*/bin/...`) computed the wrong base dir, so ST bundle toolchains were never picked up.
- Several pre-existing `ReferenceError`s on undefined globals (`stateManager`, `createStateIndicator`, `validateGenerationData`) that broke initialization.
- Language dropdown showed Chinese while UI text stayed English (state restore didn't sync back to extension).

### Version 0.2.5 - January 2025

#### 🔧 Documentation and Packaging Updates
- **Updated Documentation**: Synchronized README version information and changelog across all versions
- **Package Optimization**: Cleaned up VSIX package by excluding development files and documentation
- **Version Consistency**: Ensured version alignment between package.json, README, and GitHub releases
- **Improved Release Process**: Refined packaging and publishing workflow

### Version 0.2.4 - January 2025

#### 🔧 Enhanced Reliability
- **Strengthened OpenOCD Configuration Validation**: More robust validation mechanisms to prevent configuration errors
- **Improved Error Handling**: Better error detection and user feedback for configuration issues  
- **Enhanced Debugging Reliability**: Increased stability of debug configuration generation process
- **Refined Validation Logic**: More comprehensive checking of OpenOCD paths and configurations

### Version 0.2.3 - January 2025

#### ✨ New Features
- **ARM Toolchain Integration**: Complete ARM GNU toolchain detection and configuration
- **Intelligent Path Detection**: Multi-strategy toolchain discovery across platforms
- **User-Friendly Setup**: Direct download links and guided configuration process
- **Auto-Configuration Service**: One-click complete environment setup
- **Path Standardization**: Cross-platform path handling with forward slash normalization

#### 🔧 Improvements
- **Enhanced UI**: ARM toolchain section integrated seamlessly with existing OpenOCD workflow
- **Better Error Handling**: Comprehensive validation and user feedback
- **Performance Optimization**: Improved detection algorithms and caching strategies
- **Documentation**: Complete ARM toolchain setup and usage guides

#### 🐛 Bug Fixes
- **Path Issues**: Fixed Windows path handling for OpenOCD and ARM toolchain paths
- **Configuration Generation**: Improved cortex-debug settings consistency
- **Authentication Removed**: Simplified user experience by removing unnecessary authentication modules

### Version 0.2.1 - January 2025

#### ✨ New Features
- **Enhanced Search**: Real-time filtering with highlighting
- **File Browser**: Native file picker for OpenOCD selection
- **Auto-Recovery**: Automatic configuration recovery after crashes
- **Preset Configurations**: Built-in templates for common boards

#### 🐛 Bug Fixes
- Fixed search performance on large file lists
- Resolved memory leak in LiveWatch
- Fixed path handling on Windows with spaces
- Corrected language switching persistence

#### 🔧 Improvements
- 30% faster configuration generation
- Reduced extension size by 15%
- Improved error messages clarity
- Enhanced accessibility support

### Version 0.2.0 - December 2024

#### Major Update
- **Activity Bar Integration**: Dedicated sidebar panel
- **LiveWatch**: Real-time variable monitoring
- **Internationalization**: English and Chinese support
- **Tree View**: Visual configuration management

### Version 0.1.0 - November 2024

#### Feature Release
- Modern UI redesign
- Configuration persistence
- Multi-target support
- Dependency auto-detection

### Version 0.0.9 - October 2024

#### Initial Release
- Basic configuration generation
- OpenOCD integration
- Simple form interface

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/zuoliangyu/stm32-configurator-by-zuolan.git
```

2. Install dependencies:
```bash
npm install
```

3. Open in VS Code:
```bash
code stm32-configurator-by-zuolan
```

4. Press `F5` to run the extension in a new Extension Development Host window

### Testing

```bash
npm run test:all      # Run all tests
npm run test:unit     # Run unit tests
npm run test:coverage # Run tests with coverage
```

## 🙏 Acknowledgments

- **Cortex-Debug** - For providing the debugging framework
- **OpenOCD** - For STM32 debugging support
- **VS Code Team** - For the excellent extension API
- **STM32 Community** - For feedback and suggestions

Special thanks to all contributors and users who have helped improve this extension!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Created with ❤️ by 左岚**

Copyright (c) 2025 左岚. All rights reserved.

[Report Bug](https://github.com/zuoliangyu/stm32-configurator-by-zuolan/issues) | [Request Feature](https://github.com/zuoliangyu/stm32-configurator-by-zuolan/issues)

</div>