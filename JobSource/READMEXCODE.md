# JobSource iOS Development Guide - Xcode on macOS

Complete guide for developing JobSource on macOS using Xcode.

## 🍎 Prerequisites

### System Requirements
- macOS 12.0 (Monterey) or later
- **Xcode 14.0 or later** (free from Mac App Store)
- 16GB RAM minimum (32GB recommended)
- 40GB free disk space
- Apple Silicon (M1/M2/M3) or Intel Mac

### Required Software
1. **Xcode** - iOS development environment
2. **Homebrew** - Package manager
3. **Node.js** - JavaScript runtime
4. **CocoaPods** - iOS dependency manager
5. **Watchman** - File watching for hot reload

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Xcode

```bash
# From Mac App Store (recommended)
open "macappstore://apps.apple.com/us/app/xcode/id497799835"

# Or via command line
xcode-select --install
```

**First Launch:**
1. Open Xcode from Applications
2. Accept license agreement
3. Install additional components when prompted
4. Wait for installation (10-30 minutes)

### Step 2: Install Homebrew

```bash
# Open Terminal (Cmd+Space, type "Terminal")
# Paste this command:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add to PATH (follow on-screen instructions)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Step 3: Install Dependencies

```bash
# Install Node.js (LTS version)
brew install node

# Install Watchman (for hot reload)
brew install watchman

# Install CocoaPods
sudo gem install cocoapods

# Verify installations
node --version      # Should show v18.x or v20.x
npm --version       # Should show 9.x or 10.x
pod --version       # Should show 1.x
```

### Step 4: Setup JobSource

```bash
# Navigate to JobSource folder
cd /Users/tux/claudestuff/JobSource

# Install npm dependencies
npm install

# Install iOS dependencies (CocoaPods)
cd ios && pod install && cd ..

# This downloads all iOS libraries (may take 5-10 minutes)
```

**Note:** If you see "No Xcode or CLT version detected", run:
```bash
sudo xcode-select --switch /Applications/Xcode.app
sudo xcodebuild -license accept
```

### Step 5: Run in Xcode

```bash
# Open project in Xcode
open ios/JobSource.xcworkspace
```

**In Xcode:**
1. Wait for indexing to complete (progress bar at top)
2. Select target device (see below)
3. Click **Run** button (▶️) or press `Cmd+R`

### Step 6: Select Target Device

**Option A: iOS Simulator (Recommended for testing)**
```
Top bar → JobSource → Any iOS Simulator (iPhone 15)
```

**Option B: Physical iPhone**
```
Top bar → JobSource → Your iPhone Name
```
(Connect iPhone via USB first)

## 🎯 Running the App

### Method 1: Xcode GUI (Easiest)

1. Open `ios/JobSource.xcworkspace` in Xcode
2. Select iPhone 15 Pro simulator
3. Click **Run** (▶️)
4. Wait for build (first time takes 5-10 minutes)
5. Simulator opens automatically

### Method 2: Command Line

```bash
# Start Metro bundler
npx react-native start

# In NEW Terminal window:
# Run on iOS Simulator
npx react-native run-ios

# Run on specific device
npx react-native run-ios --simulator="iPhone 15 Pro"

# Run on physical device
npx react-native run-ios --device "Your iPhone Name"
```

### Method 3: Helper Script

```bash
# Create this helper script
cat > ~/jobsource-ios.sh << 'EOF'
#!/bin/bash
cd /Users/tux/claudestuff/JobSource

# Start Metro in background
npx react-native start &
METRO_PID=$!

# Wait for Metro
sleep 3

# Run iOS app
npx react-native run-ios

# Cleanup on exit
trap "kill $METRO_PID" EXIT
EOF

chmod +x ~/jobsource-ios.sh
~/jobsource-ios.sh
```

## 📱 iOS Simulator Guide

### Opening Simulator

```bash
# Launch Simulator app
open -a Simulator

# Or via Xcode: Window → Devices and Simulators → Simulators
```

### Simulator Controls

| Action | Shortcut |
|--------|----------|
| Home | Cmd+Shift+H |
| App Switcher | Cmd+Shift+H (double tap) |
| Shake Gesture | Cmd+Ctrl+Z |
| Screenshot | Cmd+S |
| Rotate | Cmd+← or Cmd+→ |
| Zoom In/Out | Cmd+1, Cmd+2, Cmd+3 |
| Reload App | Cmd+R (in Metro) |

### Common Simulator Issues

**Simulator won't open:**
```bash
# Reset simulator
xcrun simctl erase all

# Or delete and recreate:
# Xcode → Window → Devices and Simulators → Simulators → + button
```

**App crashes on launch:**
1. In Xcode: Product → Clean Build Folder (Cmd+Shift+K)
2. Delete app from simulator (long press → delete)
3. Run again (Cmd+R)

## 🔧 Xcode Development Workflow

### Hot Reload (Live Editing)

1. Edit any file in `src/` folder
2. Save (Cmd+S)
3. App automatically updates!

**If hot reload doesn't work:**
- Press `Cmd+R` in Terminal with Metro running
- Or shake device (Cmd+Ctrl+Z) → "Reload"

### Debug Menu

Access by shaking device:
```
Cmd+Ctrl+Z (in simulator)
```

Menu options:
- **Reload** - Refresh app
- **Debug** - Open Chrome DevTools
- **Performance Monitor** - Show FPS/memory
- **Toggle Inspector** - UI element inspection
- **Show Perf Monitor** - Performance stats

### Debugging in Xcode

**View Console Logs:**
```
Xcode → View → Debug Area → Show Console (Cmd+Shift+C)
```

**Set Breakpoints:**
1. Open `AppDelegate.mm` or any file
2. Click line number to add breakpoint
3. Run app
4. Execution pauses at breakpoint

**View Device Logs:**
```bash
# All logs
xcrun simctl spawn booted log stream --level debug

# Filter for React Native
xcrun simctl spawn booted log stream --predicate 'eventMessage contains "ReactNative"'
```

### Project Structure in Xcode

```
JobSource.xcworkspace
├── Pods/                          # Dependencies (auto-generated)
│   └── React-Core/               # React Native core
├── JobSource/                     # Your app code
│   ├── AppDelegate.mm            # Entry point
│   ├── Info.plist               # App configuration
│   ├── Images.xcassets/         # App icons
│   └── main.m                   # Main file
└── JobSourceTests/               # Unit tests
```

**Don't edit files in Pods/ folder** - they get regenerated!

## 📦 Building for Release

### Archive for App Store

```bash
# Open in Xcode
open ios/JobSource.xcworkspace

# Product → Archive
# Wait for build...
# Organizer window opens automatically
```

### Command Line Build

```bash
cd ios

# Build release
xcodebuild -workspace JobSource.xcworkspace \
  -scheme JobSource \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  archive -archivePath build/JobSource.xcarchive
```

### Export IPA

```bash
# Create export options plist
cat > ios/exportOptions.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>development</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
EOF

# Export IPA
xcodebuild -exportArchive \
  -archivePath build/JobSource.xcarchive \
  -exportPath build/JobSource.ipa \
  -exportOptionsPlist exportOptions.plist
```

## 🧪 Testing

### Unit Tests

```bash
# In Xcode: Cmd+U
# Or command line:
npx react-native test
```

### UI Tests

```bash
# Create e2e tests with Detox
npm install --save-dev detox

# Initialize Detox
detox init

# Build and test
detox build
detox test
```

### TestFlight (Beta Testing)

1. Archive app in Xcode
2. Organizer → Distribute App
3. Select "App Store Connect"
4. Upload
5. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
6. TestFlight → Add testers
7. Users receive invite email

## 🐛 Troubleshooting

### "No bundle URL present"

```bash
# Metro bundler not running
npx react-native start

# Or reset cache
npx react-native start --reset-cache
```

### Build Errors

**Clean everything:**
```bash
# 1. Clean Xcode build
cd ios
xcodebuild clean
rm -rf build/
rm -rf ~/Library/Developer/Xcode/DerivedData

# 2. Clean npm
rm -rf node_modules
npm install

# 3. Clean pods
rm -rf ios/Pods ios/Podfile.lock
cd ios && pod install && cd ..

# 4. Restart Metro
npx react-native start --reset-cache

# 5. Run again
npx react-native run-ios
```

### CocoaPods Issues

```bash
# Update CocoaPods
sudo gem install cocoapods

# Update repo
cd ios && pod repo update

# Reinstall pods
rm -rf Pods Podfile.lock
pod install
```

### "Unable to find a destination"

```bash
# List available simulators
xcrun simctl list devices

# Boot specific simulator
xcrun simctl boot "iPhone 15 Pro"

# Then run
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Permission Errors

```bash
# Fix CocoaPods permissions
sudo chown -R $(whoami) ~/.cocoapods

# Fix node_modules permissions
sudo chown -R $(whoami) node_modules
```

### M1/M2 Mac Specific Issues

**Rosetta issues:**
```bash
# Install Rosetta if needed
softwareupdate --install-rosetta

# Use Rosetta for terminal
arch -x86_64 zsh

# Then run setup
arch -x86_64 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**arm64 vs x86_64:**
```bash
# In Podfile, add:
post_install do |installer|
  installer.pods_project.build_configurations.each do |config|
    config.build_settings["EXCLUDED_ARCHS[sdk=iphonesimulator*]"] = "arm64"
  end
end
```

Then: `cd ios && pod install`

## 📊 Performance Monitoring

### Xcode Instruments

1. Product → Profile (Cmd+I)
2. Select template:
   - **Time Profiler** - CPU usage
   - **Allocations** - Memory usage
   - **Network** - API calls
   - **Energy Log** - Battery usage

### React Native Performance

```bash
# Enable performance monitor
# Shake device → "Show Perf Monitor"

# View in Chrome DevTools
# Cmd+Ctrl+Z → "Debug" → Performance tab
```

## 🎨 Changing App Icons

### Generate Icons

1. Create 1024×1024 icon (design in Figma/Sketch)
2. Use [appicon.co](https://appicon.co) to generate all sizes
3. Download and unzip

### Install Icons

```bash
# Replace icons in Xcode
# Open: ios/JobSource/Images.xcassets/AppIcon.appiconset/
# Drag new icons into each slot
```

### App Display Name

Edit `ios/JobSource/Info.plist`:
```xml
<key>CFBundleDisplayName</key>
<string>JobSource</string>
```

## 🔐 Code Signing (For Physical Device)

### Free Development

1. Connect iPhone
2. Xcode → Preferences → Accounts
3. Add Apple ID (free)
4. Select your iPhone
5. Xcode auto-manages signing

### App Store Distribution

1. Enroll in Apple Developer Program ($99/year)
2. [developer.apple.com](https://developer.apple.com)
3. Certificates, Identifiers & Profiles
4. Xcode → Signing & Capabilities → Team

## 🚀 Shortcuts & Tips

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Build | Cmd+B |
| Run | Cmd+R |
| Stop | Cmd+. |
| Clean | Cmd+Shift+K |
| Navigate | Cmd+Click |
| Find | Cmd+Shift+F |
| Console | Cmd+Shift+C |

### Useful Commands

```bash
# List simulators
xcrun simctl list

# Open URL in simulator
xcrun simctl openurl booted "https://jobsource.app"

# Send push notification
xcrun simctl push booted com.jobsource '{"aps":{"alert":"test"}}'

# Screenshot
xcrun simctl screenshot screenshot.png

# Record video
xcrun simctl io booted recordVideo video.mp4
# Press Ctrl+C to stop
```

## 📱 Device Testing

### Physical iPhone

1. Connect iPhone via USB
2. Trust computer on iPhone
3. Xcode → Window → Devices and Simulators
4. Select device
5. Cmd+R to run

### Wireless Debugging

1. Connect iPhone via USB (once)
2. Xcode → Window → Devices and Simulators
3. Select device → "Connect via network"
4. Disconnect USB
5. Future runs work wirelessly!

## 🔄 Update Xcode

```bash
# Via Mac App Store
open "macappstore://apps.apple.com/us/app/xcode/id497799835"

# Or download from Apple Developer (faster)
# developer.apple.com/download/more/
```

**After Xcode update:**
```bash
# Update command line tools
sudo xcode-select --switch /Applications/Xcode.app
sudo xcodebuild -license accept

# Reinstall pods
cd ios && pod install && cd ..
```

## 📚 Resources

- [Xcode Documentation](https://developer.apple.com/documentation/xcode)
- [React Native iOS Guide](https://reactnative.dev/docs/environment-setup)
- [CocoaPods Guides](https://guides.cocoapods.org)
- [iOS Simulator Guide](https://developer.apple.com/documentation/xcode/simulator)
- [Swift Documentation](https://swift.org/documentation/)

## ✅ Checklist

Before running:
- [ ] Xcode installed and opened at least once
- [ ] Homebrew installed
- [ ] Node.js installed (`node --version`)
- [ ] CocoaPods installed (`pod --version`)
- [ ] `npm install` completed
- [ ] `pod install` completed
- [ ] Simulator or device selected
- [ ] Metro bundler running

## 🆘 Getting Help

If stuck:
1. Run `npx react-native doctor`
2. Check Xcode build logs (right panel in Xcode)
3. Search error on [Stack Overflow](https://stackoverflow.com)
4. React Native Discord: [discord.gg/reactnative](https://discord.gg/reactnative)

---

**Ready to build!** Open Xcode and click Run (▶️) to see JobSource in action! 🚀
