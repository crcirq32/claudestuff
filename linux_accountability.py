#!/usr/bin/env python3
"""
Linux Accountability App
Your personal companion on your journey to a Linux career!
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
import random

# ANSI Colors for beautiful terminal output
PURPLE = "\033[38;2;147;112;219m"
LAVENDER = "\033[38;2;180;160;255m"
GREEN = "\033[38;2;0;128;0m"
TEAL = "\033[38;2;0;128;128m"
GOLD = "\033[38;2;255;215;0m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Data storage path
DATA_FILE = Path.home() / ".linux_accountability.json"

# Motivational messages
MOTIVATIONS = [
    "You are capable of amazing things. Every expert was once a beginner!",
    "Your Linux journey is unique and valuable. Keep going!",
    "The command line is your canvas. Paint something beautiful today!",
    "Every terminal session makes you stronger. You're building your future!",
    "Linux professionals are in HIGH demand. You're investing in yourself!",
    "That dream Linux job? It's waiting for someone exactly like YOU.",
    "You're not just learning commands - you're building a career!",
    "The open source community welcomes you. Your skills matter!",
    "Today is another step toward freedom - the freedom of open source!",
    "You can do this. You've already come so far!",
    "Your persistence today creates opportunities tomorrow!",
    "Command line mastery = career mastery. You've got this!",
    "Every script you write is a step toward your dream job!",
    "The terminal doesn't judge - it rewards effort. Keep showing up!",
    "Linux careers are built one command at a time. Keep typing!",
    "You're closer today than you were yesterday. Progress!",
    "Your curiosity about Linux is your superpower!",
    "The best system administrators started exactly where you are now!",
    "Learning Linux is unlocking a world of opportunity!",
    "You're not behind - you're exactly where you need to be. Keep learning!",
]

# Linux career roadmap - FREE resources focus
ROADMAP = {
    "Phase 1: Foundation (Current)": {
        "duration": "1-2 months",
        "skills": [
            "Master bash scripting",
            "Understand file permissions and ownership",
            "Process management (ps, top, htop, kill)",
            "Package management (apt, dpkg)",
            "Systemd basics (systemctl, services)",
            "Networking fundamentals (ip, netstat, ss, ping)",
            "Text manipulation (grep, sed, awk, cut)",
        ],
        "free_resources": [
            "Linux Journey (linuxjourney.com) - FREE",
            "OverTheWire Bandit wargames - FREE",
            "Ubuntu Server docs (ubuntu.com/server/docs) - FREE",
            "LinuxCommand.org - FREE",
        ],
        "projects": [
            "Set up a LAMP/LEMP stack manually",
            "Create a backup script with rsync",
            "Automate system updates with cron",
            "Build a log analyzer script",
        ]
    },
    "Phase 2: System Administration": {
        "duration": "2-3 months",
        "skills": [
            "User and group management",
            "Disk management (LVM, partitioning)",
            "SSH hardening and key management",
            "Firewall configuration (ufw, iptables)",
            "Log analysis and monitoring",
            "Shell scripting proficiency",
            "Basic Python automation",
        ],
        "free_resources": [
            "Linux Foundation free courses (linuxfoundation.org) - FREE",
            "Red Hat Enterprise Linux docs - FREE",
            "Arch Wiki (applicable to all distros) - FREE",
            "YouTube: LearnLinuxTV - FREE",
        ],
        "projects": [
            "Set up a home media server (Plex/Jellyfin)",
            "Configure a VPN server (WireGuard/OpenVPN)",
            "Create a monitoring dashboard (Grafana + Prometheus)",
            "Automate VM provisioning with Vagrant",
        ]
    },
    "Phase 3: DevOps & Cloud": {
        "duration": "2-3 months",
        "skills": [
            "Docker containerization",
            "Docker Compose",
            "Git version control",
            "CI/CD basics (GitHub Actions)",
            "AWS/GCP free tier basics",
            "Ansible automation",
            "Infrastructure as Code concepts",
        ],
        "free_resources": [
            "Docker Docs (docs.docker.com) - FREE",
            "GitHub Skills (skills.github.com) - FREE",
            "AWS Free Tier tutorials - FREE",
            "Ansible docs + YouTube tutorials - FREE",
        ],
        "projects": [
            "Containerize your backup script",
            "Set up a CI/CD pipeline for your dotfiles",
            "Create Ansible playbooks for server setup",
            "Deploy a static site to AWS S3 free tier",
        ]
    },
    "Phase 4: Security & Specialization": {
        "duration": "Ongoing",
        "skills": [
            "Security hardening",
            "Vulnerability assessment",
            "Incident response basics",
            "SELinux/AppArmor",
            "Choose specialization: Cloud/SRE/DevOps/Security",
        ],
        "free_resources": [
            "CIS Benchmarks (cisecurity.org) - FREE",
            "NIST guidelines - FREE",
            "OWASP Linux hardening - FREE",
            "Blue Team Labs Online (free tier) - FREE",
        ],
        "projects": [
            "Harden your VMs with CIS benchmarks",
            "Set up an IDS (Snort/Suricata)",
            "Create a SIEM with ELK stack",
            "Build a homelab network",
        ]
    }
}

# Daily task categories
DAILY_TASKS = [
    # Quick wins (15-30 min)
    {"task": "Complete one OverTheWire Bandit level", "time": "15-30 min", "category": "Fundamentals"},
    {"task": "Read 10 pages of Linux documentation", "time": "20 min", "category": "Theory"},
    {"task": "Practice 5 bash one-liners", "time": "20 min", "category": "Fundamentals"},
    {"task": "Review system logs with journalctl", "time": "15 min", "category": "Real-world"},
    {"task": "Create a shell alias for a common command", "time": "10 min", "category": "Productivity"},
    {"task": "Write a script to automate a repetitive task", "time": "30 min", "category": "Scripting"},
    {"task": "Study file permissions and practice chmod/chown", "time": "20 min", "category": "Fundamentals"},
    {"task": "Explore a new CLI tool (htop, ncdu, fd, ripgrep)", "time": "20 min", "category": "Discovery"},
    {"task": "Practice text processing with sed/awk", "time": "25 min", "category": "Fundamentals"},
    {"task": "Set up SSH key authentication on your VMs", "time": "20 min", "category": "Security"},
    {"task": "Read about systemd and create a simple service", "time": "30 min", "category": "System"},
    {"task": "Practice networking commands (ss, ip, netstat)", "time": "20 min", "category": "Networking"},
    {"task": "Configure UFW firewall rules", "time": "20 min", "category": "Security"},
    {"task": "Set up a cron job for automated maintenance", "time": "25 min", "category": "Automation"},
    {"task": "Explore /proc and /sys filesystems", "time": "20 min", "category": "System"},
    {"task": "Practice process management (nice, nohup, disown)", "time": "20 min", "category": "System"},
    {"task": "Learn a new vim shortcut or try nano alternatives", "time": "15 min", "category": "Productivity"},
    {"task": "Set up log rotation for custom logs", "time": "25 min", "category": "System"},
    {"task": "Create a custom MOTD for your VM", "time": "15 min", "category": "Customization"},
    {"task": "Research a Linux certification path (RHCSA, CompTIA Linux+)", "time": "30 min", "category": "Career"},
]

# Weekly challenges
WEEKLY_CHALLENGES = [
    {"title": "Build Your Dotfiles Repo", "description": "Create a GitHub repo with your configs. Practice git while organizing your environment.", "time": "2-3 hours"},
    {"title": "Server Migration Project", "description": "Migrate a service from one VM to another manually, document every step.", "time": "3 hours"},
    {"title": "Disaster Recovery Drill", "description": "Simulate a failure: delete something important and recover it from backup.", "time": "2 hours"},
    {"title": "Security Audit", "description": "Audit your VMs against CIS benchmarks, create a hardening checklist.", "time": "3 hours"},
    {"title": "Bash Script Collection", "description": "Write 5 useful scripts and package them in a /usr/local/bin setup script.", "time": "4 hours"},
    {"title": "Network Troubleshooting Lab", "description": "Create network issues on purpose and practice diagnosing them.", "time": "2 hours"},
    {"title": "Build a Monitoring System", "description": "Set up Prometheus + Grafana on your Ubuntu VM.", "time": "4 hours"},
    {"title": "Automated Backup Solution", "description": "Create a complete backup system with rotation and verification.", "time": "3 hours"},
    {"title": "LAMP Stack from Scratch", "description": "Install and configure Apache, MySQL, PHP manually without tutorials.", "time": "3 hours"},
    {"title": "Dockerize a Service", "description": "Pick a service you use and containerize it.", "time": "3 hours"},
]


def print_header(text):
    """Print a beautiful header."""
    width = 60
    print(f"\n{PURPLE}{'═' * width}{RESET}")
    print(f"{LAVENDER}{BOLD}{text.center(width)}{RESET}")
    print(f"{PURPLE}{'═' * width}{RESET}\n")


def print_box(title, content):
    """Print content in a box."""
    lines = content.split('\n')
    width = max(len(line) for line in lines) + 4
    print(f"\n{TEAL}┌{'─' * width}┐{RESET}")
    print(f"{TEAL}│{RESET} {GOLD}{BOLD}{title}{RESET}{' ' * (width - len(title) - 1)}{TEAL}│{RESET}")
    print(f"{TEAL}├{'─' * width}┤{RESET}")
    for line in lines:
        print(f"{TEAL}│{RESET}  {line}{' ' * (width - len(line) - 3)}{TEAL}│{RESET}")
    print(f"{TEAL}└{'─' * width}┘{RESET}\n")


def load_data():
    """Load user data from file."""
    if DATA_FILE.exists():
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        "projects": [
            {
                "name": "Master Linux Fundamentals",
                "phase": "Phase 1: Foundation",
                "description": "Build a strong foundation in Linux system administration",
                "status": "active",
                "tasks_completed": 0,
                "created_at": datetime.now().isoformat(),
            },
            {
                "name": "Build a Homelab Portfolio",
                "phase": "Phase 1: Foundation",
                "description": "Create practical projects showcasing Linux skills",
                "status": "active",
                "tasks_completed": 0,
                "created_at": datetime.now().isoformat(),
            }
        ],
        "streak": 0,
        "last_checkin": None,
        "total_tasks_completed": 0,
        "weekly_challenge_completed": False,
        "current_phase": "Phase 1: Foundation (Current)",
        "career_goal": "Linux System Administrator / DevOps Engineer",
        "journal_entries": [],
    }


def save_data(data):
    """Save user data to file."""
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)


def check_streak(data):
    """Check and update streak."""
    today = datetime.now().date()
    if data['last_checkin']:
        last = datetime.fromisoformat(data['last_checkin']).date()
        if last == today:
            return data['streak']  # Already checked in today
        elif (today - last).days == 1:
            data['streak'] += 1  # Continued streak
        elif (today - last).days > 1:
            data['streak'] = 1  # Reset streak
    else:
        data['streak'] = 1  # First check-in
    data['last_checkin'] = datetime.now().isoformat()
    return data['streak']


def get_daily_motivation():
    """Get random motivation with some personalization."""
    base = random.choice(MOTIVATIONS)
    extras = [
        f"\n{TEAL}💡 Remember:{RESET} You have CySA+ already - that gives you a HUGE head start!",
        f"\n{TEAL}💡 Pro tip:{RESET} Your VMs are your playground. Break things, fix them, learn.",
        f"\n{TEAL}💡 You have:{RESET} Kali + Ubuntu = Security + SysAdmin combo. Perfect!",
        f"\n{TEAL}💡 Reality check:{RESET} Linux jobs pay $60k-$150k+. This work is worth it!",
        f"\n{TEAL}💡 Fact:{RESET} Most Linux certs can be self-studied. Your determination matters more than money!",
    ]
    return base + random.choice(extras)


def get_todays_tasks(data):
    """Get today's recommended tasks based on progress."""
    # Seed random with date to get consistent tasks per day
    random.seed(datetime.now().date().toordinal())
    tasks = random.sample(DAILY_TASKS, 3)
    random.seed()  # Reset seed
    return tasks


def show_progress_bar(current, total, width=40):
    """Show a visual progress bar."""
    filled = int(width * current / total) if total > 0 else 0
    bar = f"{GREEN}{'█' * filled}{RESET}{'░' * (width - filled)}"
    percent = (current / total * 100) if total > 0 else 0
    return f"[{bar}] {percent:.1f}%"


def daily_checkin(data):
    """Daily check-in flow."""
    print_header("🌟 DAILY CHECK-IN 🌟")

    streak = check_streak(data)
    print(f"{GOLD}{BOLD}🔥 Current Streak: {streak} days!{RESET}\n")

    if streak >= 7:
        print(f"{GREEN}🎉 WOW! A week+ streak! You're building serious momentum!{RESET}\n")
    elif streak >= 3:
        print(f"{GREEN}👏 Great consistency! Keep that momentum going!{RESET}\n")

    # Motivation
    print_box("Your Daily Motivation", get_daily_motivation())

    # Today's tasks
    print_header("📋 TODAY'S MISSIONS")
    tasks = get_todays_tasks(data)
    print(f"{TEAL}Complete at least ONE of these today:{RESET}\n")
    for i, task in enumerate(tasks, 1):
        print(f"{PURPLE}{i}.{RESET} [{task['category']}] {task['task']}")
        print(f"   {TEAL}⏱ Estimated time: {task['time']}{RESET}\n")

    # Projects status
    print_header("🎯 ACTIVE PROJECTS")
    for i, project in enumerate(data['projects'], 1):
        status_icon = "✅" if project['status'] == 'completed' else "🔄"
        print(f"{status_icon} {BOLD}{project['name']}{RESET}")
        print(f"   Phase: {LAVENDER}{project['phase']}{RESET}")
        print(f"   Tasks completed: {project['tasks_completed']}\n")

    # Weekly challenge
    if not data.get('weekly_challenge_completed', False):
        print_header("🏆 WEEKLY CHALLENGE")
        random.seed(datetime.now().isocalendar()[1])  # Seed by week number
        challenge = random.choice(WEEKLY_CHALLENGES)
        random.seed()
        print(f"{GOLD}{BOLD}{challenge['title']}{RESET}")
        print(f"{challenge['description']}\n")
        print(f"{TEAL}Time estimate: {challenge['time']}{RESET}")
        print(f"{LAVENDER}Tip: Break this into daily chunks!{RESET}\n")

    # Interactive check-in
    print_header("✍️ REFLECTION")
    print(f"{TEAL}Did you complete at least one task today? (yes/no/partial){RESET}")
    response = input(f"{PURPLE}> {RESET}").strip().lower()

    if response in ('yes', 'y'):
        data['total_tasks_completed'] += 1
        for project in data['projects']:
            project['tasks_completed'] += 1
        print(f"\n{GREEN}🎉 AMAZING! You're {data['total_tasks_completed']} tasks closer to your dream job!{RESET}")
    elif response in ('partial', 'p'):
        print(f"\n{LAVENDER}That's okay! Progress is progress. Tomorrow is a new day!{RESET}")
    else:
        print(f"\n{GOLD}No worries! Life happens. The key is showing up again tomorrow.{RESET}")

    # Journal entry
    print(f"\n{TEAL}Want to add a quick journal entry? (optional, press Enter to skip){RESET}")
    entry = input(f"{PURPLE}> {RESET}").strip()
    if entry:
        data['journal_entries'].append({
            "date": datetime.now().isoformat(),
            "entry": entry
        })
        print(f"{GREEN}✓ Entry saved!{RESET}")

    save_data(data)

    print(f"\n{PURPLE}{'═' * 60}{RESET}")
    print(f"{LAVENDER}{BOLD}Keep going! You're building something amazing! 💪{RESET}")
    print(f"{PURPLE}{'═' * 60}{RESET}\n")


def view_roadmap():
    """Show career roadmap."""
    print_header("🗺️ YOUR LINUX CAREER ROADMAP")
    print(f"{TEAL}This is your path to a Linux career - completely FREE!{RESET}\n")

    for phase, details in ROADMAP.items():
        print(f"\n{PURPLE}{BOLD}📌 {phase}{RESET}")
        print(f"{TEAL}Duration: {details['duration']}{RESET}\n")

        print(f"{GOLD}Key Skills:{RESET}")
        for skill in details['skills'][:5]:  # Show first 5
            print(f"  {GREEN}✓{RESET} {skill}")
        if len(details['skills']) > 5:
            print(f"  {LAVENDER}... and {len(details['skills']) - 5} more{RESET}")

        print(f"\n{GOLD}Free Resources:{RESET}")
        for resource in details['free_resources']:
            print(f"  {PURPLE}📚{RESET} {resource}")

        print(f"\n{GOLD}Project Ideas:{RESET}")
        for project in details['projects'][:3]:
            print(f"  {TEAL}🔧{RESET} {project}")


def view_projects(data):
    """View and manage projects."""
    print_header("🎯 YOUR PROJECTS")

    if not data['projects']:
        print(f"{TEAL}No active projects. Let's create one!{RESET}")
        return

    for i, project in enumerate(data['projects'], 1):
        status = "✅ Complete" if project['status'] == 'completed' else "🔄 Active"
        print(f"\n{PURPLE}{BOLD}[{i}] {project['name']}{RESET}")
        print(f"   Status: {status}")
        print(f"   Phase: {project['phase']}")
        print(f"   Description: {project['description']}")
        print(f"   Tasks Completed: {project['tasks_completed']}")
        created = datetime.fromisoformat(project['created_at']).strftime('%Y-%m-%d')
        print(f"   Started: {created}")

    print(f"\n{TEAL}Options:{RESET}")
    print(f"  {PURPLE}1-{len(data['projects'])}{RESET} - Mark project complete")
    print(f"  {PURPLE}a{RESET} - Add new project")
    print(f"  {PURPLE}d{RESET} - Delete a project")
    print(f"  {PURPLE}q{RESET} - Back to menu")


def add_project(data):
    """Add a new project."""
    print_header("➕ ADD NEW PROJECT")

    name = input(f"{TEAL}Project name: {RESET}").strip()
    if not name:
        print(f"{GOLD}Cancelled.{RESET}")
        return

    print(f"\n{TEAL}Select phase:{RESET}")
    phases = list(ROADMAP.keys())
    for i, phase in enumerate(phases, 1):
        print(f"  {PURPLE}{i}{RESET} - {phase}")

    phase_choice = input(f"{TEAL}Phase (1-{len(phases)}): {RESET}").strip()
    try:
        phase = phases[int(phase_choice) - 1]
    except:
        phase = data.get('current_phase', phases[0])

    description = input(f"{TEAL}Description: {RESET}").strip()

    new_project = {
        "name": name,
        "phase": phase,
        "description": description,
        "status": "active",
        "tasks_completed": 0,
        "created_at": datetime.now().isoformat(),
    }

    data['projects'].append(new_project)
    save_data(data)
    print(f"\n{GREEN}✓ Project added! You've got this!{RESET}")


def view_stats(data):
    """View statistics and progress."""
    print_header("📊 YOUR PROGRESS")

    print(f"{GOLD}{BOLD}Current Streak:{RESET} {data.get('streak', 0)} days 🔥")
    print(f"{TEAL}Total Tasks Completed:{RESET} {data.get('total_tasks_completed', 0)}")
    print(f"{LAVENDER}Active Projects:{RESET} {len([p for p in data['projects'] if p['status'] == 'active'])}")
    print(f"{PURPLE}Completed Projects:{RESET} {len([p for p in data['projects'] if p['status'] == 'completed'])}")

    if data.get('journal_entries'):
        print(f"\n{GOLD}Journal Entries:{RESET} {len(data['journal_entries'])}")

    # Calculate "virtual XP"
    xp = data.get('total_tasks_completed', 0) * 50
    xp += data.get('streak', 0) * 10
    for p in data['projects']:
        xp += p['tasks_completed'] * 100

    print(f"\n{GOLD}{BOLD}💎 Linux XP: {xp}{RESET}")

    # Level calculation
    level = xp // 500 + 1
    next_level = level * 500
    progress = xp % 500

    print(f"{PURPLE}Level: {level}{RESET}")
    print(f"{GREEN}Progress to Level {level + 1}:{RESET}")
    print(f"  {show_progress_bar(progress, 500)}")
    print(f"  {progress}/500 XP\n")

    if data['journal_entries']:
        print_header("📝 RECENT JOURNAL ENTRIES")
        for entry in data['journal_entries'][-5:]:
            date = datetime.fromisoformat(entry['date']).strftime('%Y-%m-%d')
            print(f"\n{TEAL}{date}:{RESET}")
            print(f"  {entry['entry']}")


def get_resources():
    """Show curated resources."""
    print_header("📚 FREE RESOURCES")

    resources = {
        "Interactive Learning": [
            ("OverTheWire Bandit", "overthewire.org/wargames/bandit", "Learn commands through puzzles"),
            ("Linux Journey", "linuxjourney.com", "Structured lessons, completely free"),
            ("Katacoda Scenarios", "katacoda.com", "Browser-based Linux environments"),
        ],
        "Documentation": [
            ("Arch Wiki", "wiki.archlinux.org", "Best Linux wiki, applies to all distros"),
            ("Ubuntu Server Guide", "ubuntu.com/server/docs", "Official, comprehensive"),
            ("Red Hat System Admin Guide", "access.redhat.com/documentation", "Enterprise-grade"),
        ],
        "Video Content": [
            ("LearnLinuxTV", "youtube.com/@LearnLinuxTV", "Excellent tutorials"),
            ("The Linux Cast", "youtube.com/@TheLinuxCast", "Quick tips and concepts"),
            ("NetworkChuck", "youtube.com/@NetworkChuck", "Linux + security content"),
        ],
        "Practice Platforms": [
            ("Vagrant Cloud", "app.vagrantup.com/boxes", "Free VM images"),
            ("Docker Hub", "hub.docker.com", "Practice with containers"),
            ("Proxmox VE (free)", "proxmox.com", "Virtualization platform"),
        ],
        "Certification Prep (Free)": [
            ("ExamTopics Linux+", "exams.comptia.org", "Free practice questions"),
            ("Red Hat Free Courses", "linuxfoundation.org", "Official training"),
            ("LPI Learning Materials", "lpi.org", "Linux Professional Institute"),
        ],
    }

    for category, items in resources.items():
        print(f"\n{PURPLE}{BOLD}🗂️ {category}{RESET}")
        for name, url, desc in items:
            print(f"  {TEAL}•{RESET} {BOLD}{name}{RESET}")
            print(f"    {LAVENDER}{url}{RESET}")
            print(f"    {desc}\n")


def show_daily_tips():
    """Show random tips for the day."""
    print_header("💡 LINUX TIPS FOR TODAY")

    tips = [
        ("Command History", "Use Ctrl+R to search your command history. It's a game-changer!"),
        ("Quick Directory Switch", "Use 'cd -' to go back to the previous directory you were in."),
        ("Process Backgrounding", "Press Ctrl+Z to pause, then 'bg' to background a process."),
        ("Last Argument", "Use '!$' to reuse the last argument of the previous command."),
        ("Multiple Commands", "Use '&&' to run commands only if the previous succeeded, ';' to always run next."),
        ("Manual Pages", "Use 'man -k keyword' to search for commands by description."),
        ("Directory Size", "Use 'du -sh * | sort -h' to see directory sizes sorted."),
        ("File Search", "Use 'find . -type f -mtime -7' to find files modified in last 7 days."),
        ("Permission Calculation", "Remember: read=4, write=2, execute=1. Add them up!"),
        ("SSH Keys", "Always use SSH keys instead of passwords. Generate with: ssh-keygen -t ed25519"),
        ("System Info", "Use 'uname -a' for kernel info, 'lsb_release -a' for distro info."),
        ("Process Tree", "Use 'pstree' to see processes in a tree view."),
        ("Network Ports", "Use 'ss -tlnp' to see listening ports and their processes."),
        ("Service Status", "Use 'systemctl list-units --failed' to see failing services."),
        ("Log Streaming", "Use 'tail -f /var/log/syslog' to watch logs in real-time."),
    ]

    random.shuffle(tips)
    for i, (title, tip) in enumerate(tips[:5], 1):
        print(f"{PURPLE}{i}.{RESET} {GOLD}{BOLD}{title}{RESET}")
        print(f"   {tip}\n")


def main_menu():
    """Show main menu."""
    print_header("🐧 LINUX ACCOUNTABILITY PARTNER 🐧")
    print(f"{LAVENDER}Your personal companion on the journey to a Linux career!{RESET}\n")
    print(f"{PURPLE}1.{RESET} 🌟 Daily Check-in")
    print(f"{PURPLE}2.{RESET} 🗺️ View Career Roadmap")
    print(f"{PURPLE}3.{RESET} 🎯 Manage Projects")
    print(f"{PURPLE}4.{RESET} 📊 View Progress")
    print(f"{PURPLE}5.{RESET} 📚 Free Resources")
    print(f"{PURPLE}6.{RESET} 💡 Daily Tips")
    print(f"{PURPLE}7.{RESET} 🚪 Exit")
    print()


def main():
    """Main application loop."""
    data = load_data()

    while True:
        main_menu()
        choice = input(f"{TEAL}Select option (1-7): {RESET}").strip()

        if choice == '1':
            daily_checkin(data)
        elif choice == '2':
            view_roadmap()
            input(f"\n{TEAL}Press Enter to continue...{RESET}")
        elif choice == '3':
            view_projects(data)
            print()
            sub_choice = input(f"{TEAL}Choice: {RESET}").strip().lower()
            if sub_choice == 'a':
                add_project(data)
            elif sub_choice.isdigit():
                idx = int(sub_choice) - 1
                if 0 <= idx < len(data['projects']):
                    data['projects'][idx]['status'] = 'completed'
                    save_data(data)
                    print(f"{GREEN}✓ Project marked complete!{RESET}")
            elif sub_choice == 'd':
                idx = input(f"{TEAL}Project number to delete: {RESET}").strip()
                if idx.isdigit():
                    idx = int(idx) - 1
                    if 0 <= idx < len(data['projects']):
                        del data['projects'][idx]
                        save_data(data)
                        print(f"{GREEN}✓ Project deleted.{RESET}")
            input(f"\n{TEAL}Press Enter to continue...{RESET}")
        elif choice == '4':
            view_stats(data)
            input(f"\n{TEAL}Press Enter to continue...{RESET}")
        elif choice == '5':
            get_resources()
            input(f"\n{TEAL}Press Enter to continue...{RESET}")
        elif choice == '6':
            show_daily_tips()
            input(f"\n{TEAL}Press Enter to continue...{RESET}")
        elif choice == '7':
            print(f"\n{PURPLE}{'═' * 60}{RESET}")
            print(f"{LAVENDER}{BOLD}Remember: Every command you type is an investment in your future!{RESET}")
            print(f"{PURPLE}You've got this! Keep going! 💪🐧{RESET}")
            print(f"{PURPLE}{'═' * 60}{RESET}\n")
            break
        else:
            print(f"{GOLD}Please enter a number 1-7{RESET}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{LAVENDER}Keep pushing forward! See you tomorrow! 💪{RESET}\n")
