#!/usr/bin/env python3
"""
WireGuard VPN Management Script
Manage and troubleshoot your VPN server
"""

import subprocess
import sys
import json
from pathlib import Path
from datetime import datetime

# Colors
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BLUE = "\033[94m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

CLIENT_CONFIG_DIR = Path.home() / "wireguard-client-configs"


def run_command(cmd, capture=False):
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            return result.stdout.strip()
        subprocess.run(cmd, shell=True, check=True)
        return True
    except:
        return False


def show_status():
    """Show WireGuard status."""
    print(f"\n{CYAN}{BOLD}═══ WireGuard Status ═══{RESET}\n")

    status = run_command("sudo wg show", capture=True)
    if status:
        print(status)
    else:
        print(f"{YELLOW}WireGuard not running{RESET}")

    print(f"\n{CYAN}{BOLD}═══ Interface Status ═══{RESET}\n")
    iface = run_command("ip addr show wg0", capture=True)
    if iface:
        print(iface)
    else:
        print(f"{YELLOW}wg0 interface not found{RESET}")


def show_connected():
    """Show connected clients."""
    print(f"\n{CYAN}{BOLD}═══ Connected Clients ═══{RESET}\n")

    output = run_command("sudo wg show wg0 latest-handshake", capture=True)
    if not output:
        print(f"{YELLOW}No active connections or WireGuard not running{RESET}")
        return

    # Parse and show human-readable times
    lines = run_command("sudo wg show wg0", capture=True).split('\n')
    for line in lines:
        if 'peer:' in line:
            print(f"\n{GREEN}Client:{RESET} {line.split(':')[1].strip()}")
        elif 'endpoint:' in line:
            print(f"  {YELLOW}Endpoint:{RESET} {line.split(':')[1].strip()}")
        elif 'latest handshake:' in line:
            print(f"  {BLUE}Last seen:{RESET} {line.split(':', 1)[1].strip()}")
        elif 'transfer:' in line:
            print(f"  {CYAN}Data:{RESET} {line.split(':', 1)[1].strip()}")


def restart_vpn():
    """Restart WireGuard."""
    print(f"{YELLOW}Restarting WireGuard...{RESET}")
    run_command("sudo wg-quick down wg0")
    if run_command("sudo wg-quick up wg0"):
        print(f"{GREEN}✓ WireGuard restarted{RESET}")
    else:
        print(f"{RED}✗ Failed to restart{RESET}")


def stop_vpn():
    """Stop WireGuard."""
    print(f"{YELLOW}Stopping WireGuard...{RESET}")
    if run_command("sudo wg-quick down wg0"):
        print(f"{GREEN}✓ WireGuard stopped{RESET}")
    else:
        print(f"{RED}✗ Failed to stop{RESET}")


def start_vpn():
    """Start WireGuard."""
    print(f"{YELLOW}Starting WireGuard...{RESET}")
    if run_command("sudo wg-quick up wg0"):
        print(f"{GREEN}✓ WireGuard started{RESET}")
    else:
        print(f"{RED}✗ Failed to start{RESET}")


def show_logs():
    """Show WireGuard logs."""
    print(f"{CYAN}Showing logs (Ctrl+C to exit)...{RESET}\n")
    run_command("sudo journalctl -u wg-quick@wg0 -f")


def test_connection():
    """Test internet connectivity through VPN."""
    print(f"\n{CYAN}{BOLD}═══ Testing Connection ═══{RESET}\n")

    # Check if wg0 exists
    iface = run_command("ip addr show wg0 2>/dev/null", capture=True)
    if not iface:
        print(f"{RED}✗ wg0 interface not found. VPN not running.{RESET}")
        return

    print(f"{GREEN}✓ VPN interface exists{RESET}")

    # Check IP forwarding
    ip_fwd = run_command("cat /proc/sys/net/ipv4/ip_forward", capture=True)
    if ip_fwd == "1":
        print(f"{GREEN}✓ IP forwarding enabled{RESET}")
    else:
        print(f"{RED}✗ IP forwarding disabled{RESET}")

    # Test internet
    print(f"\n{YELLOW}Testing internet connectivity...{RESET}")
    if run_command("curl -s --max-time 5 https://1.1.1.1", capture=True):
        print(f"{GREEN}✓ Server has internet access{RESET}")
    else:
        print(f"{RED}✗ Server cannot reach internet{RESET}")

    # Show NAT rules
    print(f"\n{CYAN}NAT rules:{RESET}")
    nat = run_command("sudo iptables -t nat -L POSTROUTING -v -n | grep MASQUERADE", capture=True)
    if nat:
        print(nat)
    else:
        print(f"{YELLOW}No MASQUERADE rules found{RESET}")


def add_client():
    """Add a new client."""
    print(f"\n{CYAN}{BOLD}═══ Add New Client ═══{RESET}\n")
    name = input("Client name (e.g., 'macbook', 'phone'): ").strip()
    if not name:
        print(f"{RED}Cancelled{RESET}")
        return

    # Generate keys
    priv = run_command("wg genkey", capture=True)
    pub = run_command(f"echo '{priv}' | wg pubkey", capture=True)

    # Get server IP
    ip = run_command("hostname -I | awk '{print $1}'", capture=True)

    # Get next available IP
    config = run_command("cat /etc/wireguard/wg0.conf", capture=True)
    # Simple IP detection - assumes 10.200.200.x
    import re
    ips = re.findall(r'10\.200\.200\.(\d+)', config)
    if ips:
        next_ip = max(int(i) for i in ips if i not in ['0', '1']) + 1
    else:
        next_ip = 3

    client_ip = f"10.200.200.{next_ip}/32"

    # Add to server config
    peer = f"""
[Peer]
# {name}
PublicKey = {pub}
AllowedIPs = {client_ip}
PersistentKeepalive = 25
"""
    with open("/etc/wireguard/wg0.conf", "a") as f:
        f.write(peer)

    # Generate client config
    server_pub = run_command("cat /etc/wireguard/wg0.conf | grep PrivateKey | head -1 | awk '{print $3}' | wg pubkey", capture=True)

    client_config = f"""[Interface]
Address = {client_ip}
PrivateKey = {priv}
DNS = 10.200.200.1, 1.1.1.1

[Peer]
PublicKey = {server_pub}
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = {ip}:51820
PersistentKeepalive = 25
"""

    client_file = CLIENT_CONFIG_DIR / f"{name}.conf"
    client_file.write_text(client_config)

    print(f"{GREEN}✓ Client '{name}' added{RESET}")
    print(f"  VPN IP: {client_ip}")
    print(f"  Config saved to: {client_file}")

    # Restart to apply
    restart_vpn()


def show_menu():
    """Show interactive menu."""
    while True:
        print(f"""
{CYAN}{BOLD}╔═══════════════════════════════════════════╗{RESET}
{CYAN}{BOLD}║{RESET}      {GREEN}WireGuard VPN Manager{RESET}               {CYAN}{BOLD}║{RESET}
{CYAN}{BOLD}╚═══════════════════════════════════════════╝{RESET}

{YELLOW}1.{RESET} Show Status
{YELLOW}2.{RESET} Show Connected Clients
{YELLOW}3.{RESET} Test Connection
{YELLOW}4.{RESET} Restart VPN
{YELLOW}5.{RESET} Start VPN
{YELLOW}6.{RESET} Stop VPN
{YELLOW}7.{RESET} View Logs
{YELLOW}8.{RESET} Add New Client
{YELLOW}9.{RESET} Exit
""")

        choice = input(f"{CYAN}Select option: {RESET}").strip()

        if choice == '1':
            show_status()
        elif choice == '2':
            show_connected()
        elif choice == '3':
            test_connection()
        elif choice == '4':
            restart_vpn()
        elif choice == '5':
            start_vpn()
        elif choice == '6':
            stop_vpn()
        elif choice == '7':
            show_logs()
        elif choice == '8':
            add_client()
        elif choice == '9':
            print(f"{GREEN}Goodbye!{RESET}")
            break
        else:
            print(f"{RED}Invalid option{RESET}")

        input(f"\n{YELLOW}Press Enter to continue...{RESET}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1]
        if cmd == "status":
            show_status()
        elif cmd == "restart":
            restart_vpn()
        elif cmd == "stop":
            stop_vpn()
        elif cmd == "start":
            start_vpn()
        elif cmd == "logs":
            show_logs()
        elif cmd == "test":
            test_connection()
        elif cmd == "clients":
            show_connected()
        else:
            print(f"Usage: {sys.argv[0]} [status|restart|stop|start|logs|test|clients]")
    else:
        show_menu()
