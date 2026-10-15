# 🛡️ CyberDefense - Matrix-Themed Tower Defense

A cute, Matrix-inspired tower defense game for iOS where you use hacking skills to protect your base from cyber threats!

## 🎮 Game Overview

**CyberDefense** puts you in control of a secure network under attack. Bad guys (mobs) are trying to breach your system and reach your home base. Use three powerful hacking towers to defend your network:

- 🔶 **CSRF Tower** - Causes mobs to self-destruct
- 🔑 **Brute Force Tower** - Makes mobs attack each other
- 📡 **WiFi Pineapple Tower** - Pushes mobs backwards

## 📱 How to Run

### Requirements
- macOS 12.0 or later
- Xcode 14.0 or later
- iOS Simulator or physical iPhone

### Quick Start

```bash
# Clone or navigate to the project
cd /Users/tux/claudestuff/CyberDefense

# Open in Xcode
open CyberDefense.xcodeproj
```

**In Xcode:**
1. Select target device (iPhone 15 Pro Simulator recommended)
2. Click **Run** (▶️) or press `Cmd+R`
3. Wait for build to complete
4. Game launches automatically!

### Running on Physical Device

1. Connect iPhone via USB
2. Select your device from the dropdown
3. Trust computer on iPhone if prompted
4. Click **Run**

## 🎯 How to Play

### Objective
Defend your base from cyber mobs! Each mob that reaches your base reduces its health by 1. Your base has **200 health**. Don't let it reach 0!

### Controls

| Action | How to Do It |
|--------|--------------|
| **Place Tower** | Tap "Build" → Select tower → Tap grid spot |
| **Start Wave** | Tap "Start Wave" button |
| **View Info** | Check HUD for health, score, level |

### Game Flow

1. **Build Phase** - Place towers on grid spots (avoid the path)
2. **Wave Phase** - Mobs spawn and walk toward base
3. **Defense Phase** - Towers automatically attack nearby mobs
4. **Victory!** - Complete all 5 levels

## 🏗️ Towers Explained

### 🔶 CSRF Tower (Cross-Site Request Forgery)

**Cost:** $50  
**Range:** Medium  
**Fire Rate:** Medium  
**Damage:** High

**Effect:** Injects malicious code that causes mobs to **self-destruct** after 3 seconds!

- Best for: High-health mobs
- Visual: Orange explosion icon
- Special: Countdown timer appears on affected mobs

**Strategy:** Place where mobs bunch up to maximize area damage

---

### 🔑 Brute Force Tower

**Cost:** $75  
**Range:** Short  
**Fire Rate:** Fast  
**Damage:** Medium

**Effect:** Cracks mob's authentication, causing them to **attack other mobs** for 5 seconds!

- Best for: Groups of mobs
- Visual: Red key icon
- Special: Confused mobs turn magenta and fight each other

**Strategy:** Place in the middle of the path where multiple mobs will be in range

---

### 📡 WiFi Pineapple Tower

**Cost:** $100  
**Range:** Short  
**Fire Rate:** Very Fast  
**Damage:** Low

**Effect:** Hijacks mob's network connection, **pushing them backward** for 2 seconds!

- Best for: Delaying tough mobs near base
- Visual: Purple WiFi signal icon
- Special: Mobs move backward through the path

**Strategy:** Place near the base as a last line of defense

## 💰 Economy

| Action | Reward |
|--------|--------|
| Starting Money | $300 |
| Kill Mob | $5 |
| Score Points | 10 per kill |
| Complete Level | Bonus based on health |

**Money Management:**
- Start with CSRF towers (cheapest, good damage)
- Add Brute Force for crowd control
- Save for Pineapple towers near base

## 📊 Levels

### Level 1: Basic Breach
- 8 mobs
- Simple straight path
- Tutorial level

### Level 2: Zigzag Attack
- 11 mobs
- Zigzag path
- Introduces positioning strategy

### Level 3: Spiral Infiltration
- 14 mobs
- Spiral winding path
- Requires tower placement planning

### Level 4: Complex Network
- 17 mobs
- Maze-like path
- Test your defensive skills

### Level 5: The Ultimate Hack
- 20 mobs
- Winding complex path
- Final challenge!

**Mob Types by Level:**
- Level 1: Blue mobs (basic)
- Level 2: Green mobs (faster)
- Level 3: Yellow mobs (healthier)
- Level 4: Orange mobs (tough)
- Level 5: Red mobs (elite)

## 🎨 Visual Guide

### Path Elements
- **Green Line** - The path mobs follow
- **Binary Digits (0/1)** - Floating along the path
- **Dark Base** - Your home base (defend this!)
- **Grid Spots** - Where you can build towers

### Effects
- **Orange Explosions** - CSRF self-destruct
- **Magenta Mobs** - Brute Force confusion
- **Backward Arrows** - Pineapple pushback
- **Falling Binary** - Matrix rain background

## 🧠 Strategies

### Beginner Strategy
```
1. Place 2 CSRF towers near start of path
2. Place 1 CSRF tower near middle
3. Start wave
4. Add more towers as money allows
```

### Advanced Strategy
```
1. CSRF towers at path entrance (high damage)
2. Brute Force in middle (crowd control)
3. Pineapple near base (last defense)
4. Overlap tower ranges for maximum coverage
```

### Expert Tips

1. **Tower Stacking** - Place different tower types close together for combo effects
2. **Choke Points** - Focus towers where path turns or narrows
3. **Save for Pineapple** - Having 1-2 Pineapple towers near base is clutch
4. **Sell and Replace** - Remove weak towers and replace with stronger ones (not implemented yet, but good mindset)

## 🐛 Troubleshooting

### "Build" button not working?
- Make sure you have enough money for the tower
- Tap a grid spot (not on the path)

### Game feels slow?
- Close other apps
- Restart Simulator/Device
- Check Xcode console for errors

### Can't place tower?
- Only place on gray grid spots (not on green path)
- Must have enough money
- Make sure Build menu is open

### Mobs getting through?
- Add more towers
- Place closer together
- Use Pineapple towers near base
- Check tower ranges overlap

## 🎯 Scoring System

| Action | Points |
|--------|--------|
| Kill Mob | 10 points |
| Complete Level | 100 × health % |
| Perfect Level (no damage) | Bonus 500 |
| Total Score | Sum of all |

**High Score Tips:**
- Keep base health high
- Kill mobs quickly
- Complete all 5 levels

## 🕹️ Game Modes

### Normal Mode
- 5 levels
- Progressive difficulty
- Complete all to win

### (Future Ideas)
- **Endless Mode** - Infinite waves, how long can you survive?
- **Hardcore Mode** - Base has only 100 health
- **Sandbox Mode** - Unlimited money, test strategies

## 🎵 Sound Effects (Not Implemented)

Ideas for future versions:
- Matrix digital rain sound
- Tower firing effects
- Mob explosion sounds
- Base damage alerts
- Victory fanfare

## 📸 Screenshots

### Main Game
- Green Matrix-style background
- Binary digits falling
- Glowing path
- Animated towers

### Tower Menu
- Three tower options
- Cost display
- Description text

### HUD
- Base health indicator
- Current level
- Total score
- Build/Start Wave buttons

## 🔧 Technical Details

### Built With
- **Swift** - Programming language
- **SwiftUI** - UI framework
- **SpriteKit** - Game engine

### Architecture
- GameState: Central game management
- GameScene: SpriteKit scene with all gameplay
- Tower: Individual tower logic
- Mob: Enemy behavior and effects
- Projectile: Tower attacks

### Performance
- Target: 60 FPS
- Supports all iOS devices
- Optimized for iPhone 15 Pro

## 🚀 Future Enhancements

### Potential Updates
- [ ] More tower types (Firewall, Encryption, Proxy)
- [ ] Upgrade system (Level 2, 3 towers)
- [ ] Boss mobs (Mega hackers)
- [ ] Sound effects and music
- [ ] Achievement system
- [ ] Global leaderboards
- [ ] Different themes (Cyberpunk, Retro, etc.)

## 📝 Known Issues

1. No sound (planned for v2)
2. Towers can't be moved after placement
3. No pause button (yet)
4. Limited to 5 levels (for now)

## 🙏 Credits

**Inspiration:**
- Matrix movies (visual style)
- Classic tower defense games
- Cybersecurity concepts

**Built With:**
- Xcode
- Swift
- SpriteKit
- Love for retro games

## 📞 Support

**Questions?** Check these resources:
- This README (you're reading it!)
- Swift documentation
- SpriteKit guides
- iOS Developer Forums

## 🎮 Ready to Play?

1. Open Xcode
2. Load the project
3. Click Run
4. Defend your base!

**Good luck, hacker! May your code be clean and your towers aim true! 🛡️**

---

## 🎖️ Cheats/Secrets (Shh!)

**Debug Mode:**
```swift
// In GameState.swift, change:
money = 300
// To:
money = 9999
```

**Instant Win:**
```swift
// Not implemented (that would ruin the fun!)
```

**Matrix Mode:**
- The falling binary is procedurally generated
- Each digit has random size and speed
- Creates authentic Matrix atmosphere

---

**Version:** 1.0  
**Created:** 2026  
**Platform:** iOS  
**Language:** Swift

**© 2026 CyberDefense Studios** (Just kidding, it's all yours!)

**Made with ❤️ for retro gaming fans**