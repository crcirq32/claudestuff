#!/bin/bash

# JobSource Ubuntu Development Environment Setup Script
# This script automates the setup of Android development environment for React Native

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ANDROID_SDK_VERSION="11076708"
ANDROID_SDK_DIR="$HOME/android-sdk"
NODE_VERSION="18"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running on Ubuntu
check_os() {
    log_info "Checking operating system..."
    if [[ "$OSTYPE" != "linux-gnu"* ]]; then
        log_error "This script is designed for Ubuntu/Linux"
        exit 1
    fi

    if ! grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
        log_warning "This script is optimized for Ubuntu but may work on other Debian-based systems"
    fi
    log_success "OS check passed"
}

# Update system packages
update_system() {
    log_info "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    log_success "System updated"
}

# Install required packages
install_packages() {
    log_info "Installing required packages..."
    sudo apt install -y \
        curl \
        wget \
        unzip \
        git \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        libssl-dev \
        libffi-dev \
        python3-dev \
        python3-pip \
        openjdk-17-jdk \
        android-tools-adb \
        android-tools-fastboot
    log_success "Packages installed"
}

# Install Node.js
install_nodejs() {
    log_info "Installing Node.js..."

    # Remove old Node.js if exists
    if command -v node &> /dev/null; then
        log_warning "Node.js already installed: $(node --version)"
        read -p "Reinstall Node.js ${NODE_VERSION}? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping Node.js installation"
            return
        fi
    fi

    # Install NodeSource repository
    curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | sudo -E bash -
    sudo apt install -y nodejs

    # Install Yarn
    npm install -g yarn

    log_success "Node.js $(node --version) installed"
    log_success "Yarn $(yarn --version) installed"
}

# Install React Native CLI
install_rn_cli() {
    log_info "Installing React Native CLI..."
    npm install -g react-native-cli
    log_success "React Native CLI installed"
}

# Install Watchman (for hot reload)
install_watchman() {
    log_info "Installing Watchman..."

    if command -v watchman &> /dev/null; then
        log_warning "Watchman already installed"
        return
    fi

    # Build from source
    cd /tmp
    git clone https://github.com/facebook/watchman.git
    cd watchman
    git checkout v2023.11.20.00  # Stable version
    ./install-system-packages.sh
    python3 build/fbcode_builder/getdeps.py build --no-tests --src-dir=. watchman --project-defaults=build/fbcode_builder/CMake/fbcode_builder_config.py

    sudo cp /tmp/watchman/buck-out/v2/gen/fbcode/*/watchman/cmake-out/watchman* /usr/local/bin/

    # Setup permissions
    sudo mkdir -p /usr/local/var/run/watchman
    sudo chmod 2777 /usr/local/var/run/watchman

    log_success "Watchman installed"
}

# Install Android SDK
install_android_sdk() {
    log_info "Installing Android SDK..."

    if [ -d "$ANDROID_SDK_DIR" ]; then
        log_warning "Android SDK already exists at $ANDROID_SDK_DIR"
        read -p "Reinstall Android SDK? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Skipping Android SDK installation"
            return
        fi
        rm -rf "$ANDROID_SDK_DIR"
    fi

    # Create SDK directory
    mkdir -p "$ANDROID_SDK_DIR"
    cd /tmp

    # Download command line tools
    log_info "Downloading Android command line tools..."
    wget -q "https://dl.google.com/android/repository/commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip"
    unzip -q "commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip"

    # Move to SDK directory
    mkdir -p "$ANDROID_SDK_DIR/cmdline-tools"
    mv cmdline-tools "$ANDROID_SDK_DIR/cmdline-tools/latest"

    # Cleanup
    rm -f "commandlinetools-linux-${ANDROID_SDK_VERSION}_latest.zip"

    log_success "Android SDK downloaded"
}

# Configure environment variables
configure_environment() {
    log_info "Configuring environment variables..."

    # Create backup of .bashrc
    cp ~/.bashrc ~/.bashrc.backup.$(date +%Y%m%d_%H%M%S)

    # Add to .bashrc if not already present
    if ! grep -q "ANDROID_HOME" ~/.bashrc; then
        cat >> ~/.bashrc << 'EOF'

# Android SDK Configuration
export ANDROID_HOME=$HOME/android-sdk
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools

# Java Configuration
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# React Native
export REACT_EDITOR=code

# Alias for convenience
alias rn-start='npx react-native start'
alias rn-android='npx react-native run-android'
alias rn-clean='cd android && ./gradlew clean && cd ..'
EOF
        log_success "Environment variables added to .bashrc"
    else
        log_warning "Android environment already configured"
    fi

    # Source the changes
    source ~/.bashrc 2>/dev/null || true

    log_success "Environment configured"
}

# Install Android platforms and tools
install_android_components() {
    log_info "Installing Android platforms and tools..."

    # Accept licenses
    yes | sdkmanager --licenses || true

    # Install essential components
    sdkmanager "platform-tools"
    sdkmanager "platforms;android-33"
    sdkmanager "platforms;android-34"
    sdkmanager "build-tools;33.0.0"
    sdkmanager "build-tools;34.0.0"
    sdkmanager "emulator"
    sdkmanager "extras;android;m2repository"
    sdkmanager "extras;google;m2repository"

    log_success "Android components installed"
}

# Create Android Virtual Device (AVD)
setup_emulator() {
    log_info "Setting up Android emulator..."

    # Download system image
    sdkmanager "system-images;android-33;google_apis;x86_64"

    # Create AVD if it doesn't exist
    if ! avdmanager list avd | grep -q "Pixel_5_API_33"; then
        echo "no" | avdmanager create avd \
            -n "Pixel_5_API_33" \
            -k "system-images;android-33;google_apis;x86_64" \
            --device "pixel_5" \
            --force
        log_success "Android Virtual Device created (Pixel 5 API 33)"
    else
        log_warning "AVD already exists"
    fi
}

# Setup JobSource project
setup_project() {
    log_info "Setting up JobSource project..."

    PROJECT_DIR="/home/$(whoami)/JobSource"

    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "JobSource project not found at $PROJECT_DIR"
        log_info "Please ensure the project is in $PROJECT_DIR"
        exit 1
    fi

    cd "$PROJECT_DIR"

    # Install npm dependencies
    log_info "Installing npm dependencies..."
    npm install

    # Create android/local.properties
    echo "sdk.dir=$ANDROID_SDK_DIR" > android/local.properties
    log_success "Created android/local.properties"

    # Make gradlew executable
    chmod +x android/gradlew
    log_success "Made gradlew executable"

    # Create emulator launcher script
    cat > "$PROJECT_DIR/start-emulator.sh" << 'EOF'
#!/bin/bash
# Start Android emulator

if ! pgrep -x "qemu-system-x86_64" > /dev/null; then
    echo "Starting Android emulator..."
    $ANDROID_HOME/emulator/emulator -avd Pixel_5_API_33 -netdelay none -netspeed full &
    sleep 10
    echo "Emulator started!"
else
    echo "Emulator already running"
fi
EOF
    chmod +x "$PROJECT_DIR/start-emulator.sh"

    # Create development helper script
    cat > "$PROJECT_DIR/dev-start.sh" << 'EOF'
#!/bin/bash
# JobSource Development Starter

echo "========================================"
echo "   JobSource Development Environment"
echo "========================================"
echo ""

# Start emulator
./start-emulator.sh

# Start Metro bundler in new terminal
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "echo 'Starting Metro bundler...'; npx react-native start; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "echo 'Starting Metro bundler...'; npx react-native start" &
else
    echo "Please start Metro bundler manually: npx react-native start"
fi

echo ""
echo "Wait for emulator to fully boot, then run:"
echo "  npx react-native run-android"
echo ""
echo "Or use the quick commands:"
echo "  rn-android    - Run on Android"
echo "  rn-start      - Start Metro bundler"
echo "  rn-clean      - Clean build"
EOF
    chmod +x "$PROJECT_DIR/dev-start.sh"

    log_success "Project setup complete"
}

# Create helpful aliases and functions
create_helpers() {
    log_info "Creating helper scripts..."

    # Create jobsource command
    sudo tee /usr/local/bin/jobsource << 'EOF'
#!/bin/bash
# JobSource helper command

case "$1" in
    "setup")
        echo "Running setup..."
        ~/JobSource/setup_ubuntu.sh
        ;;
    "start")
        cd ~/JobSource && ./dev-start.sh
        ;;
    "android")
        cd ~/JobSource && npx react-native run-android
        ;;
    "clean")
        cd ~/JobSource/android && ./gradlew clean && cd ..
        ;;
    "emulator")
        ~/JobSource/start-emulator.sh
        ;;
    "log")
        cd ~/JobSource && npx react-native log-android
        ;;
    "help"|*)
        echo "JobSource Development Helper"
        echo ""
        echo "Commands:"
        echo "  jobsource setup      - Run setup script"
        echo "  jobsource start      - Start development environment"
        echo "  jobsource android    - Run on Android"
        echo "  jobsource clean      - Clean Android build"
        echo "  jobsource emulator   - Start emulator"
        echo "  jobsource log        - View Android logs"
        echo ""
        ;;
esac
EOF
    sudo chmod +x /usr/local/bin/jobsource

    log_success "Helper command 'jobsource' created"
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."

    echo ""
    echo "========================================"
    echo "   Installation Verification"
    echo "========================================"
    echo ""

    # Check Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js: $(node --version)"
    else
        log_error "Node.js not found"
    fi

    # Check npm
    if command -v npm &> /dev/null; then
        log_success "npm: $(npm --version)"
    else
        log_error "npm not found"
    fi

    # Check Java
    if command -v java &> /dev/null; then
        log_success "Java: $(java -version 2>&1 | head -n 1)"
    else
        log_error "Java not found"
    fi

    # Check Android SDK
    if [ -d "$ANDROID_SDK_DIR" ]; then
        log_success "Android SDK: $ANDROID_SDK_DIR"
    else
        log_error "Android SDK not found"
    fi

    # Check React Native CLI
    if command -v react-native &> /dev/null; then
        log_success "React Native CLI installed"
    else
        log_error "React Native CLI not found"
    fi

    echo ""
    echo "========================================"
}

# Print final instructions
print_instructions() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}   Setup Complete! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Reload your shell or run:"
    echo "   source ~/.bashrc"
    echo ""
    echo "2. Start development environment:"
    echo "   cd ~/JobSource"
    echo "   ./dev-start.sh"
    echo ""
    echo "   Or use: jobsource start"
    echo ""
    echo "3. In a new terminal, run the app:"
    echo "   cd ~/JobSource"
    echo "   npx react-native run-android"
    echo ""
    echo "   Or use: jobsource android"
    echo ""
    echo "Quick commands created:"
    echo "  jobsource start    - Start dev environment"
    echo "  jobsource android  - Run on Android"
    echo "  jobsource clean    - Clean build"
    echo "  jobsource emulator   - Start emulator only"
    echo ""
    echo "Troubleshooting:"
    echo "  - Ensure emulator is fully booted before running"
    echo "  - Check 'npx react-native doctor' for issues"
    echo "  - Run 'jobsource clean' if build fails"
    echo ""
    echo -e "${GREEN}Happy coding! 🚀${NC}"
    echo ""
}

# Main execution
main() {
    echo ""
    echo "========================================"
    echo "   JobSource Ubuntu Setup"
    echo "   Android Development Environment"
    echo "========================================"
    echo ""

    check_os
    update_system
    install_packages
    install_nodejs
    install_rn_cli
    install_watchman
    install_android_sdk
    configure_environment
    install_android_components
    setup_emulator
    setup_project
    create_helpers
    verify_installation
    print_instructions
}

# Run main function
main
