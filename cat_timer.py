#!/usr/bin/env python3
"""
Cute ASCII Cat Timer
Colors: Lavender and Navy Green
Features: Count up and Count down with preset times
"""

import time
import sys
import threading
import os
import select
from datetime import timedelta

# ANSI Colors
LAVENDER = "\033[38;2;180;160;255m"
PURPLE_ = "\033[38;2;0;100;0m"
RESET = "\033[0m"
BOLD = "\033[1m"
BG_LAVENDER = "\033[48;2;230;220;255m"
BG_PURPLE = "\033[48;2;0;60;0m"

# Walking cat frames for animation (legs move)
CAT_FRAMES = [
    rf'''
{BG_PURPLE}                                              {RESET}
{BG_PURPLE}   {LAVENDER}      ∧,,,∧                      {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     ( ̳- · - ̳)                   {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     /    つ   ♡                 {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    (  [    ]  )                 {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    /  /‾‾\  \                   {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}   (  /    \  )    ~             {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    ‾‾        ‾‾                 {BG_PURPLE}   {RESET}
{BG_PURPLE}                                              {RESET}''',
    rf'''
{BG_PURPLE}                                               {RESET}
{BG_PURPLE}   {LAVENDER}      ∧,,,∧                       {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     ( ̳- · - ̳)                    {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     /    つ   ♡                  {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    (  [    ]  )                  {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    /  /‾‾\  \                    {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}   (  |    |  )    ~              {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    ‾‾        ‾‾                  {BG_PURPLE}   {RESET}
{BG_PURPLE}                                               {RESET}''',
    rf'''
{BG_PURPLE}                                               {RESET}
{BG_PURPLE}   {LAVENDER}      ∧,,,∧                       {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     ( ̳- · - ̳)                    {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     /    つ   ♡                  {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    (  [    ]  )                  {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    /  /‾‾\  \                    {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}   (  \    /  )    ~              {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    ‾‾      ‾‾                    {BG_PURPLE}   {RESET}
{BG_PURPLE}                                               {RESET}''',
]

# Sleeping cat for paused state (curled up)
SLEEPING_CAT = rf'''
{BG_PURPLE}                                               {RESET}
{BG_PURPLE}   {LAVENDER}                                  {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}         /\___/\                  {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}        (  - _ -  )   zZZ         {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}        (  [    ]  )              {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}         \ |  | /                 {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}          (‾‾‾‾‾‾)                {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}                                  {BG_PURPLE}   {RESET}
{BG_PURPLE}                                               {RESET}'''

# Jumping cat for finished countdown
ALARM_CAT = rf'''
{BG_PURPLE}                                               {RESET}
{BG_PURPLE}   {LAVENDER}              ♪♪♪                 {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}      ∧,,,∧                       {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     ( O _ O )   TIME'S UP!!!     {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}  ♡  /  つ つ  \   ♡              {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}    (  [    ]  )                  {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}      /      \                    {BG_PURPLE}   {RESET}
{BG_PURPLE}   {LAVENDER}     /        \                   {BG_PURPLE}   {RESET}
{BG_PURPLE}                                               {RESET}'''

# Button styles
BUTTON_SELECTED = f"{BG_LAVENDER}{PURPLE_}{BOLD}"
BUTTON_NORMAL = f"{LAVENDER}"
BUTTON_BORDER = f"{PURPLE_}"


def clear_screen():
    """Clear the terminal screen."""
    os.system('clear' if os.name == 'posix' else 'cls')


def format_time(seconds):
    """Format seconds into HH:MM:SS."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"


def draw_button(label, selected=False, width=12):
    """Draw a styled button."""
    if selected:
        return f"{BUTTON_SELECTED}[ {label:^{width-4}} ]{RESET}"
    else:
        return f"{BUTTON_BORDER}[{RESET}{BUTTON_NORMAL} {label:^{width-4}} {RESET}{BUTTON_BORDER}]{RESET}"


def draw_menu(selected_idx=0):
    """Draw the main menu with buttons."""
    options = [
        ("Count Up", "count_up"),
        ("1 min", "countdown_1"),
        ("5 min", "countdown_5"),
        ("20 min", "countdown_20"),
        ("60 min", "countdown_60"),
        ("Quit", "quit")
    ]

    lines = []
    lines.append(f"\n{LAVENDER}{BOLD}        ~ Cute Cat Timer ~{RESET}\n")
    lines.append(f"{PURPLE_}══════════════════════════════════════════════{RESET}\n")

    # Row 1: Count Up | 1 min | 5 min
    row1 = "        "
    for i in range(3):
        row1 += draw_button(options[i][0], selected_idx == i, 14) + "  "
    lines.append(row1 + "\n\n")

    # Row 2: 20 min | 60 min | Quit
    row2 = "        "
    for i in range(3, 6):
        row2 += draw_button(options[i][0], selected_idx == i, 14) + "  "
    lines.append(row2 + "\n")

    lines.append(f"{PURPLE_}══════════════════════════════════════════════{RESET}\n")
    lines.append(f"{LAVENDER}   Use arrow keys or WASD to move, Enter to select{RESET}")
    lines.append(f"{LAVENDER}   Press 'q' to go back, Space to pause/resume{RESET}\n")

    return "".join(lines), [opt[1] for opt in options]


def draw_timer_interface(cat_art, time_str, mode_name, is_paused=False):
    """Draw the timer interface with the cat and time."""
    lines = []
    lines.append(f"\n{PURPLE_}══════════════════════════════════════════════{RESET}\n")
    lines.append(cat_art)
    lines.append(f"\n{PURPLE_}══════════════════════════════════════════════{RESET}\n")

    # Time display
    lines.append(f"\n{LAVENDER}{BOLD}           Mode: {mode_name}{RESET}\n")
    lines.append(f"{LAVENDER}{BOLD}           Time: {time_str}{RESET}\n")

    if is_paused:
        lines.append(f"\n{BUTTON_SELECTED}           [ PAUSED ]           {RESET}\n")
    else:
        lines.append(f"\n{PURPLE_}                                    {RESET}\n")

    lines.append(f"\n{PURPLE_}══════════════════════════════════════════════{RESET}\n")
    lines.append(f"{LAVENDER}   Press 'p' to pause/resume | 'q' to quit{RESET}\n")

    return "".join(lines)


def play_bell():
    """Play multiple bell sounds for the alarm."""
    for _ in range(5):
        print('\a', end='', flush=True)
        time.sleep(0.2)


class CatTimer:
    def __init__(self):
        self.running = False
        self.paused = False
        self.current_time = 0
        self.target_time = None
        self.mode = None
        self.frame_idx = 0
        self._stop_event = threading.Event()
        self.finished = False

    def _animate_cat(self):
        """Background thread to animate the cat."""
        while not self._stop_event.is_set():
            if not self.paused and self.running and not self.finished:
                self.frame_idx = (self.frame_idx + 1) % len(CAT_FRAMES)
            time.sleep(0.4)

    def _update_timer(self):
        """Background thread to update the timer."""
        last_update = time.time()
        while not self._stop_event.is_set():
            if self.running and not self.paused:
                now = time.time()
                elapsed = now - last_update
                if elapsed >= 1:
                    if self.mode == "count_up":
                        self.current_time += int(elapsed)
                    else:  # countdown
                        self.current_time -= int(elapsed)
                        if self.current_time <= 0:
                            self.current_time = 0
                            self.finished = True
                            self.paused = True
                            # Play bell sound in a separate thread
                            bell_thread = threading.Thread(target=play_bell, daemon=True)
                            bell_thread.start()
                    last_update = now
            else:
                last_update = time.time()
            time.sleep(0.1)

    def get_key_nonblocking(self):
        """Check for keypress without blocking."""
        try:
            import termios
            import tty
            fd = sys.stdin.fileno()
            old_settings = termios.tcgetattr(fd)
            try:
                tty.setcbreak(sys.stdin.fileno())
                # Check if input is available
                if select.select([sys.stdin], [], [], 0)[0]:
                    ch = sys.stdin.read(1)
                    if ch == '\x1b':
                        ch += sys.stdin.read(2)
                    return ch
                return None
            finally:
                termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        except (ImportError, AttributeError, OSError):
            return None

    def display_timer(self):
        """Display the timer interface with keyboard handling."""
        while self.running:
            clear_screen()

            time_str = format_time(self.current_time)

            if self.paused and not self.finished:
                cat = SLEEPING_CAT
            elif self.finished:
                cat = ALARM_CAT
            else:
                cat = CAT_FRAMES[self.frame_idx]

            mode_name = "Count Up" if self.mode == "count_up" else f"Count Down ({self.target_time//60} min)"
            if self.mode == "countdown_1":
                mode_name = "Count Down (1 min)"
            elif self.mode == "countdown_5":
                mode_name = "Count Down (5 min)"
            elif self.mode == "countdown_20":
                mode_name = "Count Down (20 min)"
            elif self.mode == "countdown_60":
                mode_name = "Count Down (60 min)"

            interface = draw_timer_interface(cat, time_str, mode_name, self.paused and not self.finished)
            print(interface)

            # Check for keyboard input
            key = self.get_key_nonblocking()
            if key:
                if key.lower() == 'p':
                    if not self.finished:
                        self.paused = not self.paused
                elif key.lower() == 'q':
                    self.running = False
                    break

            if self.finished:
                # Keep showing the finished state for a bit
                time.sleep(0.5)
                # Check if user wants to exit
                key = self.get_key_nonblocking()
                if key and key.lower() == 'q':
                    self.running = False
                    break
            else:
                time.sleep(0.15)

    def start_count_up(self):
        """Start the count up timer."""
        self.mode = "count_up"
        self.current_time = 0
        self.running = True
        self.paused = False
        self.finished = False
        self._stop_event.clear()

        animate_thread = threading.Thread(target=self._animate_cat, daemon=True)
        timer_thread = threading.Thread(target=self._update_timer, daemon=True)

        animate_thread.start()
        timer_thread.start()

        self.display_timer()

        self._stop_event.set()
        self.running = False

    def start_countdown(self, minutes):
        """Start a countdown timer."""
        self.mode = f"countdown_{minutes}"
        self.target_time = minutes * 60
        self.current_time = self.target_time
        self.running = True
        self.paused = False
        self.finished = False
        self._stop_event.clear()

        animate_thread = threading.Thread(target=self._animate_cat, daemon=True)
        timer_thread = threading.Thread(target=self._update_timer, daemon=True)

        animate_thread.start()
        timer_thread.start()

        self.display_timer()

        self._stop_event.set()
        self.running = False


def get_key():
    """Get a single keypress from the user."""
    try:
        import termios
        import tty
        fd = sys.stdin.fileno()
        old_settings = termios.tcgetattr(fd)
        try:
            tty.setraw(sys.stdin.fileno())
            ch = sys.stdin.read(1)
            if ch == '\x1b':
                ch += sys.stdin.read(2)
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
        return ch
    except (ImportError, AttributeError):
        # Windows fallback
        try:
            import msvcrt
            return msvcrt.getch().decode('utf-8', errors='ignore')
        except:
            # If all fails, use regular input
            return input("Enter choice: ")


def main():
    """Main application loop."""
    timer = CatTimer()
    selected = 0
    options = ["count_up", "countdown_1", "countdown_5", "countdown_20", "countdown_60", "quit"]

    # Grid navigation
    pos_map = {0: (0,0), 1: (0,1), 2: (0,2), 3: (1,0), 4: (1,1), 5: (1,2)}
    rev_pos = {(0,0): 0, (0,1): 1, (0,2): 2, (1,0): 3, (1,1): 4, (1,2): 5}

    def move_selection(row_delta, col_delta):
        curr_row, curr_col = pos_map[selected]
        new_row = (curr_row + row_delta) % 2
        new_col = (curr_col + col_delta) % 3
        return rev_pos[(new_row, new_col)]

    while True:
        clear_screen()
        menu_str, _ = draw_menu(selected)
        print(menu_str)

        key = get_key()

        # Arrow keys
        if key == '\x1b[A':  # Up
            selected = move_selection(-1, 0)
        elif key == '\x1b[B':  # Down
            selected = move_selection(1, 0)
        elif key == '\x1b[C':  # Right
            selected = move_selection(0, 1)
        elif key == '\x1b[D':  # Left
            selected = move_selection(0, -1)
        # WASD keys
        elif key.lower() == 'w':
            selected = move_selection(-1, 0)
        elif key.lower() == 's':
            selected = move_selection(1, 0)
        elif key.lower() == 'd':
            selected = move_selection(0, 1)
        elif key.lower() == 'a':
            selected = move_selection(0, -1)
        elif key == '\r' or key == '\n':  # Enter
            choice = options[selected]

            if choice == "quit":
                clear_screen()
                print(f"\n{LAVENDER}Thanks for using Cute Cat Timer!{RESET}\n")
                break
            elif choice == "count_up":
                print(f"\n{LAVENDER}Starting count up timer...{RESET}")
                time.sleep(0.5)
                timer.start_count_up()
            elif choice.startswith("countdown"):
                minutes = int(choice.split("_")[1])
                print(f"\n{LAVENDER}Starting {minutes} minute countdown...{RESET}")
                time.sleep(0.5)
                timer.start_countdown(minutes)
        elif key.lower() == 'q':
            clear_screen()
            print(f"\n{LAVENDER}Thanks for using Cute Cat Timer!{RESET}\n")
            break


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        clear_screen()
        print(f"\n{LAVENDER}Goodbye!{RESET}\n")
        sys.exit(0)
