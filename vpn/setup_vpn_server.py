#!/usr/bin/env python3
"""
WireGuard VPN Server Setup Script for Ubuntu VM
Creates a VPN tunnel for MacOS ARM client to route all traffic through Ubuntu VM
"""

import os
import subprocess
import sys
import base64
import secrets
import json
from pathlib import Path
from datetime import datetime

# Colors for output
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

CONFIG_DIR = Path("/etc/wireguard")
CLIENT_CONFIG_DIR = Path.home() / "wireguard-client-configs"


def log_info(msg):
    print(f"{BLUE}[INFO]{RESET} {msg}")


def log_success(msg):
    print(f"{GREEN}[✓]{RESET} {msg}")


def log_warning(msg):
    print(f"{YELLOW}[!]{RESET} {msg}")


def log_error(msg):
    print(f"{RED}[✗]{RESET} {msg}")


def run_command(cmd, check=True, capture=False):
    """Run a shell command."""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, check=check, capture_output=True, text=True)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=True, check=check)
            return True
    except subprocess.CalledProcessError as e:
        if check:
            log_error(f"Command failed: {cmd}")
            log_error(str(e))
        return False


def check_root():
    """Check if running as root."""
    if os.geteuid() != 0:
        log_error("This script must be run as root (use sudo)")
        sys.exit(1)


def get_server_ip():
    """Get the server's IP address on the network."""
    log_info("Detecting server IP address...")

    # Try to get IP from default route interface
    try:
        # Get the IP that's on the same network as the default gateway
        result = subprocess.run("ip route | grep default | awk '{print $5}'",
                               shell=True, capture_output=True, text=True)
        iface = result.stdout.strip()

        if iface:
            result = subprocess.run(f"ip addr show {iface} | grep 'inet ' | awk '{{print $2}}' | cut -d/ -f1",
                                   shell=True, capture_output=True, text=True)
            ip = result.stdout.strip()
            if ip:
                return ip
    except:
        pass

    # Fallback: try common methods
    cmds = [
        "hostname -I | awk '{print $1}'",
        "ip addr show | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | cut -d/ -f1 | head -n1",
        "ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -n1",
    ]

    for cmd in cmds:
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            ip = result.stdout.strip()
            if ip and ip != "127.0.0.1":
                return ip
        except:
            continue

    return None


def install_wireguard():
    """Install WireGuard if not already installed."""
    log_info("Checking WireGuard installation...")

    if run_command("which wg", check=False):
        log_success("WireGuard is already installed")
        return True

    log_info("Installing WireGuard...")

    # Update package list
    if not run_command("apt update", check=False):
        log_error("Failed to update package list")
        return False

    # Install WireGuard
    if run_command("apt install -y wireguard wireguard-tools", check=False):
        log_success("WireGuard installed successfully")
        return True
    else:
        log_error("Failed to install WireGuard")
        return False


def generate_keys():
    """Generate WireGuard keys."""
    log_info("Generating WireGuard keys...")

    # Server keys
    server_private = run_command("wg genkey", capture=True)
    server_public = run_command(f"echo '{server_private}' | wg pubkey", capture=True)

    # Client keys
    client_private = run_command("wg genkey", capture=True)
    client_public = run_command(f"echo '{client_private}' | wg pubkey", capture=True)

    log_success("Keys generated")

    return {
        'server': {'private': server_private, 'public': server_public},
        'client': {'private': client_private, 'public': client_public}
    }


def get_network_interface():
    """Get the primary network interface."""
    try:
        result = subprocess.run("ip route | grep default | awk '{print $5}' | head -n1",
                               shell=True, capture_output=True, text=True)
        iface = result.stdout.strip()
        if iface:
            return iface
    except:
        pass

    # Common interface names
    for iface in ['eth0', 'ens160', 'ens192', 'ens33', 'enp0s3', 'enp0s5']:
        if run_command(f"ip link show {iface}", check=False):
            return iface

    return None


def configure_server(keys, server_ip, client_ip="10.200.200.2/32"):
    """Configure the WireGuard server."""
    log_info("Configuring WireGuard server...")

    # Create config directory if needed
    CONFIG_DIR.mkdir(mode=0o700, exist_ok=True)

    # Server configuration
    server_config = f"""[Interface]
Address = 10.200.200.1/24
ListenPort = 51820
PrivateKey = {keys['server']['private']}
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o {get_network_interface() or 'eth0'} -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o {get_network_interface() or 'eth0'} -j MASQUERADE
DNS = 1.1.1.1, 8.8.8.8

[Peer]
# MacOS Client
PublicKey = {keys['client']['public']}
AllowedIPs = {client_ip}
PersistentKeepalive = 25
"""

    config_path = CONFIG_DIR / "wg0.conf"
    with open(config_path, 'w') as f:
        f.write(server_config)
    os.chmod(config_path, 0o600)

    log_success(f"Server config written to {config_path}")
    return True


def configure_client(keys, server_ip, client_ip="10.200.200.2/32"):
    """Generate client configuration for MacOS."""
    log_info("Generating MacOS client configuration...")

    CLIENT_CONFIG_DIR.mkdir(mode=0o700, exist_ok=True)

    # Client configuration
    client_config = f"""[Interface]
Address = {client_ip}
PrivateKey = {keys['client']['private']}
DNS = 10.200.200.1, 1.1.1.1

[Peer]
PublicKey = {keys['server']['public']}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = {server_ip}:51820
PersistentKeepalive = 25
"""

    # Save as conf file
    conf_path = CLIENT_CONFIG_DIR / "macos-client.conf"
    with open(conf_path, 'w') as f:
        f.write(client_config)

    # Save as QR code (optional, for mobile)
    log_info("Attempting to generate QR code...")
    run_command(f"qrencode -t ansiutf8 < {conf_path}", check=False)

    log_success(f"Client config saved to: {conf_path}")

    return client_config


def enable_ip_forwarding():
    """Enable IP forwarding on the server."""
    log_info("Enabling IP forwarding...")

    # Check current setting
    with open('/proc/sys/net/ipv4/ip_forward', 'r') as f:
        current = f.read().strip()

    if current == '1':
        log_success("IP forwarding already enabled")
        return True

    # Enable IP forwarding temporarily
    run_command("sysctl -w net.ipv4.ip_forward=1")

    # Enable permanently
    sysctl_conf = Path("/etc/sysctl.conf")
    if sysctl_conf.exists():
        content = sysctl_conf.read_text()
        if 'net.ipv4.ip_forward=1' not in content:
            with open(sysctl_conf, 'a') as f:
                f.write("\nnet.ipv4.ip_forward=1\n")

    # Also for IPv6
    run_command("sysctl -w net.ipv6.conf.all.forwarding=1")

    log_success("IP forwarding enabled")
    return True


def configure_firewall():
    """Configure firewall to allow WireGuard."""
    log_info("Configuring firewall...")

    # Check if ufw is installed and active
    ufw_status = run_command("ufw status | grep -i status", capture=True, check=False)

    if ufw_status and "active" in ufw_status.lower():
        log_info("UFW detected, adding WireGuard rule...")
        run_command("ufw allow 51820/udp", check=False)
        log_success("UFW rule added")
    else:
        # Add iptables rule directly
        run_command("iptables -I INPUT -p udp --dport 51820 -j ACCEPT", check=False)
        log_success("iptables rule added")

    return True


def start_wireguard():
    """Start the WireGuard service."""
    log_info("Starting WireGuard service...")

    # Using wg-quick
    result = run_command("wg-quick down wg0", check=False)
    result = run_command("wg-quick up wg0", check=False)

    if not result:
        log_error("Failed to start WireGuard with wg-quick")
        return False

    # Enable on boot
    run_command("systemctl enable wg-quick@wg0", check=False)

    log_success("WireGuard started successfully")
    return True


def get_connection_info(server_ip):
    """Get connection information for the client."""
    log_info("Checking WireGuard status...")

    status = run_command("wg show", capture=True, check=False)

    info = f"""
{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}
{GREEN}{BOLD}                    VPN SERVER READY!{RESET}
{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}

{YELLOW}Server IP:{RESET} {server_ip}
{YELLOW}Port:{RESET} 51820/UDP
{YELLOW}VPN Network:{RESET} 10.200.200.0/24
{YELLOW}Server VPN IP:{RESET} 10.200.200.1
{YELLOW}Client VPN IP:{RESET} 10.200.200.2

{CYAN}{BOLD}WireGuard Status:{RESET}
{status}

{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}
{GREEN}{BOLD}                 MACOS CLIENT SETUP{RESET}
{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}

1. {BOLD}Install WireGuard for MacOS:{RESET}
   Download from: https://apps.apple.com/us/app/wireguard/id1451685025
   Or use Homebrew: brew install --cask wireguard

2. {BOLD}Copy the client configuration:{RESET}
   From VM: {CLIENT_CONFIG_DIR}/macos-client.conf

   Transfer to Mac using one of these methods:

   a) Using scp from Mac:
      scp ubuntu@{server_ip}:{CLIENT_CONFIG_DIR}/macos-client.conf ~/Downloads/

   b) Using shared folder (if configured in UTM)

   c) Copy and paste the config below into WireGuard app

3. {BOLD}Import configuration:{RESET}
   - Open WireGuard app on Mac
   - Click "Import tunnel(s) from file"
   - Select the macos-client.conf file
   - Or use "Add empty tunnel" and paste the config

4. {BOLD}Activate VPN:{RESET}
   - Click "Activate" in WireGuard app
   - All traffic will now route through the Ubuntu VM!

5. {BOLD}Verify:{RESET}
   - Visit https://www.whatismyip.com/ on your Mac
   - Should show the VM's IP address, not your Mac's

{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}
"""
    return info


def save_setup_info(server_ip, keys):
    """Save setup information for later reference."""
    info = {
        "setup_date": datetime.now().isoformat(),
        "server_ip": server_ip,
        "vpn_network": "10.200.200.0/24",
        "server_vpn_ip": "10.200.200.1",
        "client_vpn_ip": "10.200.200.2",
        "port": 51820,
        "server_public_key": keys['server']['public'],
        "client_public_key": keys['client']['public'],
    }

    info_path = CLIENT_CONFIG_DIR / "setup-info.json"
    with open(info_path, 'w') as f:
        json.dump(info, f, indent=2)

    return info_path


def print_client_config(keys, server_ip):
    """Print the client configuration for easy copy-paste."""
    client_config = f"""
{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}
{YELLOW}{BOLD}           CLIENT CONFIG (Copy this to WireGuard app){RESET}
{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}

[Interface]
Address = 10.200.200.2/32
PrivateKey = {keys['client']['private']}
DNS = 10.200.200.1, 1.1.1.1

[Peer]
PublicKey = {keys['server']['public']}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = {server_ip}:51820
PersistentKeepalive = 25

{CYAN}{BOLD}═══════════════════════════════════════════════════════════════{RESET}
"""
    print(client_config)

    # Save to file
    quick_path = CLIENT_CONFIG_DIR / "QUSTART.md"
    with open(quick_path, 'w') as f:
        f.write(f"""# Quick Start Guide

## Server Information
- Server IP: {server_ip}
- VPN Network: 10.200.200.0/24
- Server VPN IP: 10.200.200.1
- Your VPN IP: 10.200.200.2
- Port: 51820/UDP

## MacOS Setup

### 1. Install WireGuard
```bash
brew install --cask wireguard
```
Or download from App Store: https://apps.apple.com/us/app/wireguard/id1451685025

### 2. Import Configuration
Copy the config below and save as `macos-wireguard.conf`, then import into WireGuard app:

```
[Interface]
Address = 10.200.200.2/32
PrivateKey = {keys['client']['private']}
DNS = 10.200.200.1, 1.1.1.1

[Peer]
PublicKey = {keys['server']['public']}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = {server_ip}:51820
PersistentKeepalive = 25
```

### 3. Connect
- Open WireGuard app
- Import the configuration
- Click "Activate"

### 4. Verify
Visit https://www.whatismyip.com/ - it should show {server_ip}

## Troubleshooting

### Can't connect?
1. Check if WireGuard is running on server:
   ```
   sudo wg show
   ```

2. Check server status:
   ```
   sudo systemctl status wg-quick@wg0
   ```

3. Restart WireGuard:
   ```
   sudo wg-quick down wg0 && sudo wg-quick up wg0
   ```

4. Check firewall:
   ```
   sudo ufw status
   sudo ufw allow 51820/udp
   ```

### No internet through VPN?
1. Check IP forwarding is enabled:
   ```
   sysctl net.ipv4.ip_forward
   ```

2. Check NAT rules:
   ```
   sudo iptables -t nat -L POSTROUTING -v
   ```

## Useful Commands

```bash
# Check status
sudo wg show

# Restart WireGuard
sudo wg-quick down wg0 && sudo wg-quick up wg0

# View logs
sudo journalctl -u wg-quick@wg0

# List connected clients
sudo wg show wg0
```
""")

    log_success(f"Quick start guide saved to: {quick_path}")


def main():
    """Main setup function."""
    print(f"""
{CYAN}{BOLD}╔═══════════════════════════════════════════════════════════════╗{RESET}
{CYAN}{BOLD}║{RESET}          {GREEN}WireGuard VPN Server Setup{RESET}                      {CYAN}{BOLD}║{RESET}
{CYAN}{BOLD}║{RESET}          {YELLOW}Ubuntu VM → MacOS ARM Client{RESET}                     {CYAN}{BOLD}║{RESET}
{CYAN}{BOLD}╚═══════════════════════════════════════════════════════════════╝{RESET}
""")

    # Check root
    check_root()

    # Get server IP
    server_ip = get_server_ip()
    if not server_ip:
        log_error("Could not detect server IP address")
        server_ip = input(f"{YELLOW}Please enter your Ubuntu VM's IP address: {RESET}").strip()
    else:
        log_success(f"Detected server IP: {server_ip}")

    # Confirm with user
    print(f"\n{YELLOW}This script will:{RESET}")
    print("  1. Install WireGuard on your Ubuntu VM")
    print("  2. Configure it as a VPN server")
    print("  3. Generate client config for your Mac")
    print("  4. Set up IP forwarding and NAT")
    print(f"  5. Route all Mac traffic through {server_ip}\n")

    confirm = input(f"{CYAN}Continue? (yes/no): {RESET}").strip().lower()
    if confirm not in ['yes', 'y']:
        log_info("Setup cancelled")
        sys.exit(0)

    # Install WireGuard
    if not install_wireguard():
        log_error("WireGuard installation failed")
        sys.exit(1)

    # Generate keys
    keys = generate_keys()

    # Configure server
    if not configure_server(keys, server_ip):
        log_error("Server configuration failed")
        sys.exit(1)

    # Configure client
    configure_client(keys, server_ip)

    # Enable IP forwarding
    if not enable_ip_forwarding():
        log_error("Failed to enable IP forwarding")
        sys.exit(1)

    # Configure firewall
    configure_firewall()

    # Start WireGuard
    if not start_wireguard():
        log_error("Failed to start WireGuard")
        sys.exit(1)

    # Save info
    save_setup_info(server_ip, keys)

    # Print connection info
    print(get_connection_info(server_ip))

    # Print client config for copy-paste
    print_client_config(keys, server_ip)

    print(f"""
{GREEN}{BOLD}✓ Setup complete!{RESET}

{YELLOW}Next steps:{RESET}
1. Transfer the client config from {CLIENT_CONFIG_DIR} to your Mac
2. Install WireGuard on Mac from App Store or Homebrew
3. Import the config and activate
4. Your Mac traffic will now tunnel through the Ubuntu VM!

{CYAN}Questions or issues?{RESET}
- Check the quickstart guide: {CLIENT_CONFIG_DIR}/QUSTART.md
- Check logs: sudo journalctl -u wg-quick@wg0

{GREEN}Happy tunneling! 🚀{RESET}
""")


if __name__ == "__main__":
    main()
