# JobSource Ubuntu Development Setup

Complete guide for developing JobSource on Ubuntu VM.

## 📋 Prerequisites

- Ubuntu 20.04+ (22.04 LTS recommended)
- Minimum 8GB RAM (16GB recommended)
- 20GB free disk space
- Internet connection

## 🚀 Quick Setup

### Step 1: Transfer Files to Ubuntu VM

From your Mac, copy the JobSource folder to your Ubuntu VM:

```bash
# Using scp (replace ubuntu@YOUR_VM_IP with your VM's IP)
scp -r /Users/tux/claudestuff/JobSource ubuntu@YOUR_VM_IP:/home/ubuntu/

# Or using shared folder in UTM
```

### Step 2: Run Setup Script

On your Ubuntu VM:

```bash
# Navigate to the project
cd ~/JobSource

# Run the setup script (takes 10-20 minutes)
./setup_ubuntu.sh

# Follow any prompts during installation
```

**What the script does:**
- Updates system packages
- Installs Node.js 18.x
- Installs Java 17 (OpenJDK)
- Downloads Android SDK
- Sets up environment variables
- Creates Android emulator (Pixel 5)
- Installs project dependencies
- Creates helper commands

### Step 3: Reload Shell

```bash
source ~/.bashrc
```

### Step 4: Start Development

```bash
# Option A: Use the helper script
./dev-start.sh

# Option B: Use the jobsource command
jobsource start

# Option C: Manual start
# Terminal 1:
npx react-native start

# Terminal 2:
npx react-native run-android
```

## 📱 Testing on Real Device

### Enable USB Debugging

1. Connect Android phone via USB
2. On phone: Settings → About Phone → Tap "Build Number" 7 times
3. Settings → Developer Options → Enable "USB Debugging"
4. Trust computer when prompted

### Run on Device

```bash
# Check device is detected
adb devices

# Should show: XXXXXXXX    device

# Run app
npx react-native run-android
```

## 🎮 Using the Android Emulator

### Start Emulator

```bash
# Using helper
./start-emulator.sh

# Or manually
$ANDROID_HOME/emulator/emulator -avd Pixel_5_API_33
```

### Emulator Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+M | Open developer menu |
| Cmd+M | Open developer menu (Mac keyboard) |
| R | Reload app (when in Metro) |
| RR | Reload app (double tap R) |

## 🔧 Troubleshooting

### Build Failed

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Or use helper
jobsource clean

# Try again
npx react-native run-android
```

### Metro Bundler Issues

```bash
# Clear cache
npx react-native start --reset-cache

# Or
npm start -- --reset-cache
```

### Emulator Won't Start

```bash
# Check if KVM is enabled (required for x86_64 emulator)
sudo apt install cpu-checker
kvm-ok

# If not enabled, run in software mode:
$ANDROID_HOME/emulator/emulator -avd Pixel_5_API_33 -gpu swiftshader_indirect
```

### Port Already in Use

```bash
# Kill processes using port 8081 (Metro)
lsof -ti:8081 | xargs kill -9

# Kill processes using port 5037 (ADB)
lsof -ti:5037 | xargs kill -9
```

### Environment Variables Not Set

```bash
# Manually source
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 📝 Helper Commands

After setup, these commands are available:

| Command | Description |
|---------|-------------|
| `jobsource start` | Start dev environment (emulator + Metro) |
| `jobsource android` | Run app on Android |
| `jobsource clean` | Clean Android build |
| `jobsource emulator` | Start emulator only |
| `jobsource log` | View Android logs |
| `rn-start` | Start Metro bundler |
| `rn-android` | Run on Android |
| `rn-clean` | Clean build |
| `adb devices` | List connected devices |
| `adb logcat` | View system logs |

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Start everything
cd ~/JobSource
./dev-start.sh

# 2. Wait for emulator to boot

# 3. In another terminal, run app
npx react-native run-android

# 4. Edit code in your editor
# Changes auto-reload in emulator

# 5. View logs
npx react-native log-android
```

### Making Changes

1. Edit files in `src/`
2. Save changes
3. App automatically reloads (hot reload)
4. Press R in Metro terminal to reload if needed

### Testing Changes

```bash
# Reload app
adb shell input keyevent 82  # Opens dev menu
# Select "Reload"

# Or use keyboard shortcut in emulator
Ctrl + M  # (or Cmd + M on Mac keyboard)
```

## 📊 Monitoring Performance

### Check Device Stats

```bash
# CPU/Memory usage
adb shell top

# Storage usage
adb shell df

# Running processes
adb shell ps
```

### React Native Performance

```bash
# Enable performance monitor
# Shake device or press Ctrl+M → "Show Perf Monitor"
```

## 🌐 Network Debugging

### View Network Requests

```bash
# Start with network debugging enabled
npx react-native run-android --variant=debug

# Then in app:
# Ctrl+M → "Debug" → Opens Chrome DevTools
# Go to Network tab
```

## 📦 Building Release APK

```bash
cd android

# Generate release APK
./gradlew assembleRelease

# Output location
# android/app/build/outputs/apk/release/app-release.apk
```

**Note:** You need to sign the APK for Play Store distribution. See main README.md.

## 🚀 Building Release AAB (Play Store)

```bash
cd android

# Generate App Bundle
./gradlew bundleRelease

# Output location
# android/app/build/outputs/bundle/release/app-release.aab
```

## 🐛 Debugging

### View Logs

```bash
# All logs
adb logcat

# Filter for React Native
adb logcat | grep ReactNative

# Filter for your app
adb logcat | grep com.jobsource

# React Native specific
npx react-native log-android
```

### Debug in Chrome

1. Shake device (or Ctrl+M)
2. Select "Debug"
3. Opens Chrome DevTools
4. Go to Sources → find your files

### Debug in VS Code

Install extension: "React Native Tools"

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Android",
      "request": "launch",
      "type": "reactnative",
      "platform": "android"
    }
  ]
}
```

## 🔄 Updating the Setup

### Update Node.js

```bash
# Update to latest LTS
sudo npm install -g n
sudo n lts
```

### Update Android SDK

```bash
sdkmanager --update
```

### Update Project Dependencies

```bash
npm update

# Or specific package
npm update react-native
```

## 📚 Resources

- [React Native Android Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio Guide](https://developer.android.com/studio/install)
- [Metro Bundler](https://facebook.github.io/metro/)
- [React Native CLI](https://github.com/react-native-community/cli)

## ⚡ Performance Tips

### Speed Up Emulator

```bash
# Use hardware acceleration
sudo apt install qemu-kvm
sudo adduser $USER kvm

# Restart required after adding to kvm group
```

### Reduce Build Time

```bash
# Enable Gradle daemon
# Already enabled in setup script

# Use incremental builds
./gradlew assembleDebug --configure-on-demand
```

## 🆘 Getting Help

If setup fails:

1. Check logs: `cat ~/JobSource/setup.log`
2. Run doctor: `npx react-native doctor`
3. Check requirements: `npx react-native info`
4. See Troubleshooting section above

## 🎯 Next Steps

Once the app is running:

1. Test all screens (Welcome, ZIP search, Jobs, Dashboard)
2. Try linking an account
3. Accept a mock duty
4. View earnings
5. Test the map

Then:
- See main README.md for App Store publishing
- Contact gig platforms for API access
- Set up backend server
- Configure in-app purchases

---

**Questions?** Check the main README.md or React Native documentation.

**Happy coding! 🚀**
