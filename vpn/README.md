# WireGuard VPN Setup for Ubuntu VM → MacOS

This guide will help you set up a WireGuard VPN server on your Ubuntu VM (UTM) and tunnel all your MacOS internet traffic through it.

## What This Does

- Creates a secure VPN tunnel from your Mac to your Ubuntu VM
- Routes all MacOS internet traffic through the VM
- Uses WireGuard (modern, fast, secure VPN protocol)
- Works with your UTM setup (virtio-net-pci network card)

## Prerequisites

- Ubuntu 22.04 VM running in UTM
- MacOS ARM machine (client)
- Network connectivity between Mac and VM
- `sudo` access on the Ubuntu VM

## Files Included

| File | Purpose |
|------|---------|
| `setup_vpn_server.py` | One-time setup script for the VPN server |
| `manage_vpn.py` | Day-to-day management and troubleshooting tool |

---

## Part 1: Set Up the VPN Server

### Step 1: Transfer Scripts to Ubuntu VM

From your Mac, copy the scripts to your VM:

```bash
# If using SSH to the VM
scp setup_vpn_server.py manage_vpn.py ubuntu@YOUR_VM_IP:/home/ubuntu/

# Or use UTM's shared folder feature
```

### Step 2: Run the Setup Script

On your **Ubuntu VM**:

```bash
cd /home/ubuntu
chmod +x setup_vpn_server.py
sudo python3 setup_vpn_server.py
```

**What the script does:**
1. Installs WireGuard and dependencies
2. Generates cryptographic keys for server and client
3. Configures IP forwarding (required for routing)
4. Sets up firewall rules (UFW/iptables)
5. Creates the VPN interface (`wg0`)
6. Generates a client config file for your Mac

**During setup:**
- The script will auto-detect your VM's IP address
- If it can't detect it, you'll be prompted to enter it manually
- Type `yes` when asked to continue

### Step 3: Get the Client Configuration

After setup completes, transfer the client config to your Mac:

```bash
# On your Mac, run:
scp ubuntu@YOUR_VM_IP:~/wireguard-client-configs/macos-client.conf ~/Downloads/
```

Or copy the config displayed at the end of the setup and paste it into a file.

---

## Part 2: Configure MacOS Client

### Install WireGuard

**Option A: Homebrew (Recommended)**
```bash
brew install --cask wireguard
```

**Option B: App Store**
Download from: https://apps.apple.com/us/app/wireguard/id1451685025

### Import Configuration

1. Open WireGuard app on your Mac
2. Click the down arrow (▼) next to "Add Empty Tunnel"
3. Select "Import tunnel(s) from file"
4. Choose `macos-client.conf` from your Downloads

**Or paste the config:**
1. Click "Add Empty Tunnel"
2. Delete the auto-generated content
3. Paste the config from the setup script output
4. Name it "Ubuntu VM VPN" or similar

### Connect

1. Click "Activate" in the WireGuard app
2. Your Mac's internet traffic is now routed through the Ubuntu VM!

### Verify

Visit https://www.whatismyip.com/ on your Mac
- **Before VPN:** Shows your Mac's real IP
- **After VPN:** Shows your Ubuntu VM's IP

---

## Part 3: Managing the VPN

The `manage_vpn.py` script helps you manage and troubleshoot the VPN.

### Usage

```bash
# Interactive menu (recommended)
python3 manage_vpn.py

# Or use command-line options
python3 manage_vpn.py status     # Show current status
python3 manage_vpn.py restart    # Restart the VPN
python3 manage_vpn.py stop       # Stop the VPN
python3 manage_vpn.py start      # Start the VPN
python3 manage_vpn.py logs       # View real-time logs
python3 manage_vpn.py test       # Test connectivity
python3 manage_vpn.py clients    # Show connected clients
```

### Interactive Menu Options

| Option | What It Does |
|--------|--------------|
| **1. Show Status** | Displays WireGuard interface status, peers, and IPs |
| **2. Show Connected Clients** | Lists currently connected clients with data usage |
| **3. Test Connection** | Checks if the VPN is properly forwarding traffic |
| **4. Restart VPN** | Stops and starts WireGuard (fixes many issues) |
| **5. Start VPN** | Starts the WireGuard service |
| **6. Stop VPN** | Stops the VPN (your Mac will use regular internet) |
| **7. View Logs** | Shows system logs for troubleshooting |
| **8. Add New Client** | Creates config for additional devices (phone, etc.) |

---

## Network Configuration

### Default Settings

| Setting | Value |
|---------|-------|
| VPN Network | 10.200.200.0/24 |
| Server IP | 10.200.200.1 |
| Client IP | 10.200.200.2 |
| Port | 51820/UDP |
| DNS | 10.200.200.1, 1.1.1.1 |

### How It Works

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   MacOS Client  │◄───────►│   Ubuntu VM      │◄───────►│  Internet   │
│  (WireGuard)    │  VPN    │  (VPN Server)    │  NAT    │             │
│  10.200.200.2   │ Tunnel  │  10.200.200.1    │         │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
```

Your Mac connects to the VM via WireGuard. The VM forwards (routes) your traffic to the internet using NAT.

---

## Troubleshooting

### Can't Connect from Mac

**Check if WireGuard is running on the VM:**
```bash
sudo python3 manage_vpn.py status
# or
sudo wg show
```

**Check system status:**
```bash
sudo systemctl status wg-quick@wg0
```

**Restart the VPN:**
```bash
sudo python3 manage_vpn.py restart
```

### No Internet Through VPN

**Check IP forwarding:**
```bash
cat /proc/sys/net/ipv4/ip_forward
# Should show: 1

# If not enabled:
sudo sysctl -w net.ipv4.ip_forward=1
```

**Check NAT rules:**
```bash
sudo iptables -t nat -L POSTROUTING -v -n | grep MASQUERADE
```

**Check firewall:**
```bash
sudo ufw status
# Should show port 51820/udp as allowed

# If not:
sudo ufw allow 51820/udp
```

### VM Can't Reach Internet

The VM needs internet for the VPN to work:
```bash
# Test from VM
ping 1.1.1.1

# If no internet, check VM network settings in UTM
```

### Connection Drops Frequently

Enable persistent keepalive (already set in the config):
```
PersistentKeepalive = 25
```

This sends a packet every 25 seconds to keep NAT connections alive.

### Script Permission Errors

Make sure scripts are executable:
```bash
chmod +x setup_vpn_server.py manage_vpn.py
```

---

## Security Considerations

### What Gets Protected

✅ All internet traffic from your Mac is encrypted through the VPN  
✅ Your Mac's real IP is hidden from websites  
✅ Traffic is encrypted between Mac and VM  

### What Doesn't Change

⚠️ Traffic from the VM to websites is not VPN-encrypted (unless you add additional VPN on VM)  
⚠️ Your VM's IP is what websites see  

### Additional Security (Optional)

**Enable on the VM:**
```bash
# Install fail2ban to prevent brute force
sudo apt install fail2ban

# Secure SSH (if using)
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no (after setting up keys)
sudo systemctl restart ssh
```

---

## Advanced Usage

### Add Multiple Clients

Use the management script to add more devices:

```bash
sudo python3 manage_vpn.py
# Select option 8: Add New Client
```

This will:
- Generate new keys
- Assign next available IP
- Create a new config file
- Update the server

### Change DNS Servers

Edit `/etc/wireguard/wg0.conf`:
```
DNS = 1.1.1.1, 8.8.8.8  # Change to your preferred DNS
```

Then restart:
```bash
sudo wg-quick down wg0 && sudo wg-quick up wg0
```

### Backup Your Configuration

```bash
# On the VM
sudo tar czf ~/wireguard-backup.tar.gz /etc/wireguard ~/wireguard-client-configs

# Copy to safe location
scp ubuntu@YOUR_VM_IP:~/wireguard-backup.tar.gz ~/Documents/
```

### Restore Configuration

```bash
# Extract backup
sudo tar xzf wireguard-backup.tar.gz -C /
sudo wg-quick up wg0
```

---

## Quick Reference

### Essential Commands

```bash
# Check if VPN is running
sudo wg show

# Restart VPN
sudo wg-quick down wg0 && sudo wg-quick up wg0

# View logs
sudo journalctl -u wg-quick@wg0 -f

# Test internet from VM
curl https://www.google.com

# See all WireGuard interfaces
ip addr show | grep wg
```

### File Locations

| File | Location | Purpose |
|------|----------|---------|
| Server config | `/etc/wireguard/wg0.conf` | Main VPN configuration |
| Client configs | `~/wireguard-client-configs/` | Generated client configs |
| Setup info | `~/wireguard-client-configs/setup-info.json` | Network details |
| Quickstart | `~/wireguard-client-configs/QUSTART.md` | Quick reference |

---

## FAQ

**Q: Can I use this on other devices?**  
A: Yes! Use the "Add New Client" option in `manage_vpn.py` to generate configs for phones, other laptops, etc.

**Q: Does this work with other VM software?**  
A: Yes, as long as the VM has network connectivity and a static IP.

**Q: Will this slow down my internet?**  
A: Minimal impact. WireGuard is very fast. Speed depends on your VM's resources.

**Q: Can I access my Mac from the internet through this?**  
A: No, this is a client-to-server VPN. For remote access to your Mac, you'd need port forwarding or a different setup.

**Q: Do I need to run setup again if I reboot?**  
A: No! The VPN starts automatically on boot. Just connect from your Mac.

---

## Need Help?

1. Check the troubleshooting section above
2. Review logs: `sudo python3 manage_vpn.py logs`
3. Test connection: `sudo python3 manage_vpn.py test`
4. Review the quickstart guide: `cat ~/wireguard-client-configs/QUSTART.md`

---

**Happy secure browsing! 🚀🔒**