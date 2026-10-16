import SpriteKit

enum MobState {
    case normal
    case selfDestructing  // CSRF effect
    case attackingMobs      // Brute Force effect
    case pushedBack         // Pineapple effect
    case frozen             // Ransomware effect on towers
}

enum EnemyType: String, CaseIterable {
    case packet = "Packet"           // Basic enemy - balanced
    case virus = "Virus"             // Fast, low HP, red
    case worm = "Worm"               // Medium, splits on death, green
    case trojan = "Trojan"           // Slow, high HP, disguised initially, yellow
    case ransomware = "Ransomware"   // Boss, freezes towers, purple

    var baseHealth: Int {
        switch self {
        case .packet: return 30
        case .virus: return 15
        case .worm: return 40
        case .trojan: return 80
        case .ransomware: return 200
        }
    }

    var baseSpeed: CGFloat {
        switch self {
        case .packet: return 50
        case .virus: return 90
        case .worm: return 60
        case .trojan: return 35
        case .ransomware: return 25
        }
    }

    var reward: Int {
        switch self {
        case .packet: return 5
        case .virus: return 8
        case .worm: return 12
        case .trojan: return 20
        case .ransomware: return 50
        }
    }

    var scoreValue: Int {
        switch self {
        case .packet: return 10
        case .virus: return 15
        case .worm: return 25
        case .trojan: return 40
        case .ransomware: return 100
        }
    }
}

class Mob: SKNode {
    let level: Int
    let path: [CGPoint]
    let enemyType: EnemyType
    var currentPathIndex: Int = 0
    var health: Int
    var maxHealth: Int
    var moveSpeed: CGFloat
    var isDead: Bool = false
    var reachedEnd: Bool = false
    var shouldRemove: Bool = false
    var state: MobState = .normal
    var stateTimer: TimeInterval = 0
    var attackingMobs: [Mob] = []
    var originalSpeed: CGFloat
    var isReversed: Bool = false
    var isDisguised: Bool = false
    var hasSplit: Bool = false

    private var healthBar: SKShapeNode?
    private var mobSprite: SKShapeNode?
    private var label: SKLabelNode?
    private var disguiseSprite: SKNode?

    init(level: Int, path: [CGPoint], type: EnemyType = .packet) {
        self.level = level
        self.path = path
        self.enemyType = type

        // Scale stats by level
        let levelMultiplier = 1.0 + (Double(level) - 1.0) * 0.2
        self.health = Int(Double(type.baseHealth) * levelMultiplier)
        self.maxHealth = self.health
        self.moveSpeed = type.baseSpeed + CGFloat(level * 5)
        self.originalSpeed = self.moveSpeed

        super.init()

        // Trojan starts disguised as a friendly packet
        if type == .trojan {
            self.isDisguised = true
        }
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func setup(in scene: SKScene) {
        // Create disguise for Trojan
        if enemyType == .trojan && isDisguised {
            createDisguise()
        }

        // Mob body
        let body = createMobBody()
        body.fillColor = isDisguised ? .cyan : mobColor()
        body.strokeColor = .white
        body.lineWidth = 2
        addChild(body)
        mobSprite = body

        // Type-specific visuals
        addTypeSpecificVisuals()

        // Binary/IP label inside
        let binary = SKLabelNode(text: generateBinaryIP())
        binary.fontName = "Courier"
        binary.fontSize = enemyType == .ransomware ? 14 : 10
        binary.fontColor = isDisguised ? .green : labelColor()
        binary.position.y = -3
        addChild(binary)
        label = binary

        // Health bar background - smaller
        let healthBg = SKShapeNode(rectOf: CGSize(width: 18, height: 3), cornerRadius: 1)
        healthBg.fillColor = .darkGray
        healthBg.position.y = 16
        addChild(healthBg)

        // Health bar
        let healthBar = SKShapeNode(rectOf: CGSize(width: 18, height: 3), cornerRadius: 1)
        healthBar.fillColor = .green
        healthBar.position.y = 16
        addChild(healthBar)
        self.healthBar = healthBar

        // Glow effect - smaller
        let glow = SKShapeNode(circleOfRadius: isDisguised ? 14 : 15)
        glow.strokeColor = isDisguised ? .cyan : mobColor()
        glow.lineWidth = 1.5
        glow.alpha = 0.3

        let pulseAction = SKAction.sequence([
            SKAction.fadeAlpha(to: 0.6, duration: 0.5),
            SKAction.fadeAlpha(to: 0.3, duration: 0.5)
        ])
        glow.run(SKAction.repeatForever(pulseAction))
        addChild(glow)

        // Virus has a speed trail effect
        if enemyType == .virus {
            createSpeedTrail()
        }
    }

    func createMobBody() -> SKShapeNode {
        // Smaller mobs for zoomed out view
        switch enemyType {
        case .packet:
            return SKShapeNode(circleOfRadius: 12)
        case .virus:
            // Spiky shape for virus
            let path = createSpikyPath(radius: 12, spikes: 8)
            return SKShapeNode(path: path)
        case .worm:
            // Segmented look
            return SKShapeNode(circleOfRadius: 14)
        case .trojan:
            return SKShapeNode(circleOfRadius: 16)
        case .ransomware:
            // Square with rounded corners for boss - still bigger but smaller
            return SKShapeNode(rectOf: CGSize(width: 28, height: 28), cornerRadius: 5)
        }
    }

    func createSpikyPath(radius: CGFloat, spikes: Int) -> CGPath {
        let path = CGMutablePath()
        let angleStep = (2 * CGFloat.pi) / CGFloat(spikes * 2)

        for i in 0..<(spikes * 2) {
            let angle = CGFloat(i) * angleStep - CGFloat.pi / 2
            let r = i % 2 == 0 ? radius : radius * 0.6
            let x = cos(angle) * r
            let y = sin(angle) * r

            if i == 0 {
                path.move(to: CGPoint(x: x, y: y))
            } else {
                path.addLine(to: CGPoint(x: x, y: y))
            }
        }
        path.closeSubpath()
        return path
    }

    func addTypeSpecificVisuals() {
        switch enemyType {
        case .worm:
            // Add segment circles behind - smaller
            for i in 1...2 {
                let segment = SKShapeNode(circleOfRadius: 11 - CGFloat(i))
                segment.fillColor = mobColor()
                segment.strokeColor = .white
                segment.lineWidth = 1
                segment.position = CGPoint(x: -CGFloat(i * 10), y: 0)
                segment.alpha = 0.7
                segment.name = "segment\(i)"
                addChild(segment)
            }

        case .ransomware:
            // Add lock icon - smaller
            let lock = SKLabelNode(text: "🔒")
            lock.fontSize = 12
            lock.position.y = 3
            addChild(lock)

            // Boss aura - smaller
            let aura = SKShapeNode(circleOfRadius: 22)
            aura.strokeColor = .purple
            aura.lineWidth = 2
            aura.alpha = 0.2
            let auraPulse = SKAction.sequence([
                SKAction.scale(to: 1.2, duration: 1),
                SKAction.scale(to: 1.0, duration: 1)
            ])
            aura.run(SKAction.repeatForever(auraPulse))
            addChild(aura)

        case .virus:
            // Add virus spikes indicator - smaller
            let spikeLabel = SKLabelNode(text: "⚡")
            spikeLabel.fontSize = 8
            spikeLabel.position.y = 18
            addChild(spikeLabel)

        case .trojan:
            // Hidden danger indicator (only visible on damage) - smaller
            let danger = SKLabelNode(text: "☠️")
            danger.fontSize = 10
            danger.position.y = 22
            danger.alpha = 0
            danger.name = "danger"
            addChild(danger)

        default:
            break
        }
    }

    func createDisguise() {
        // Trojan appears as a friendly "packet" initially
        disguiseSprite = SKNode()

        let cover = SKShapeNode(circleOfRadius: 12)
        cover.fillColor = .cyan
        cover.strokeColor = .white
        cover.lineWidth = 1
        disguiseSprite?.addChild(cover)

        let friendlyLabel = SKLabelNode(text: "SECURE")
        friendlyLabel.fontName = "Courier"
        friendlyLabel.fontSize = 5
        friendlyLabel.fontColor = .green
        friendlyLabel.position.y = -2
        disguiseSprite?.addChild(friendlyLabel)

        if let disguise = disguiseSprite {
            addChild(disguise)
        }
    }

    func revealTrojan() {
        guard isDisguised else { return }
        isDisguised = false

        // Remove disguise
        disguiseSprite?.run(SKAction.sequence([
            SKAction.fadeOut(withDuration: 0.3),
            SKAction.removeFromParent()
        ]))

        // Change appearance
        mobSprite?.fillColor = mobColor()
        label?.fontColor = labelColor()

        // Show danger indicator
        childNode(withName: "danger")?.run(SKAction.fadeIn(withDuration: 0.3))

        // Reveal animation
        let reveal = SKShapeNode(circleOfRadius: 40)
        reveal.strokeColor = .yellow
        reveal.lineWidth = 3
        reveal.alpha = 0.8
        addChild(reveal)

        let expand = SKAction.scale(to: 1.5, duration: 0.3)
        let fade = SKAction.fadeOut(withDuration: 0.3)
        let remove = SKAction.removeFromParent()
        reveal.run(SKAction.sequence([expand, fade, remove]))
    }

    func createSpeedTrail() {
        // Virus leaves a fading trail
        let trail = SKShapeNode(circleOfRadius: 15)
        trail.fillColor = .red
        trail.alpha = 0.3
        trail.position = CGPoint(x: -15, y: 0)
        trail.name = "trail"
        addChild(trail)
    }

    func mobColor() -> UIColor {
        if isDisguised {
            return .cyan
        }

        switch enemyType {
        case .packet:
            switch level {
            case 1: return .cyan
            case 2: return .green
            case 3: return .yellow
            case 4: return .orange
            case 5: return .red
            default: return .purple
            }
        case .virus: return .red
        case .worm: return .green
        case .trojan: return .yellow
        case .ransomware: return .purple
        }
    }

    func labelColor() -> UIColor {
        switch enemyType {
        case .packet: return .green
        case .virus: return .white
        case .worm: return .cyan
        case .trojan: return .black
        case .ransomware: return .white
        }
    }

    func generateBinaryIP() -> String {
        switch enemyType {
        case .packet:
            return "B\(Int.random(in: 100...999))"
        case .virus:
            return "VIR\(Int.random(in: 10...99))"
        case .worm:
            return "WRM\(Int.random(in: 10...99))"
        case .trojan:
            return isDisguised ? "OK_\(Int.random(in: 10...99))" : "TRJ\(Int.random(in: 10...99))"
        case .ransomware:
            return "🔒RNS\(Int.random(in: 1...9))"
        }
    }

    func takeDamage(_ amount: Int, type: TowerType) {
        guard !isDead else { return }

        // Reveal Trojan on first hit
        if enemyType == .trojan && isDisguised {
            revealTrojan()
        }

        health -= amount

        // Apply special effects based on tower type
        switch type {
        case .csrf:
            applySelfDestruct()

        case .bruteForce:
            applyConfusion()

        case .pineapple:
            applyPushBack()
        }

        updateHealthBar()

        // Flash white
        mobSprite?.run(SKAction.sequence([
            SKAction.colorize(with: .white, colorBlendFactor: 0.8, duration: 0.1),
            SKAction.colorize(withColorBlendFactor: 0, duration: 0.1)
        ]))

        if health <= 0 {
            die()
        }
    }

    func applySelfDestruct() {
        guard state != .selfDestructing else { return }
        state = .selfDestructing
        stateTimer = 3.0

        let warning = SKLabelNode(text: "⚠️")
        warning.fontSize = 15
        warning.position.y = 35
        warning.name = "warning"
        addChild(warning)

        let countdown = SKAction.sequence([
            SKAction.scale(to: 1.3, duration: 0.5),
            SKAction.scale(to: 1.0, duration: 0.5)
        ])
        mobSprite?.run(SKAction.repeat(countdown, count: 3))
    }

    func applyConfusion() {
        guard state != .attackingMobs else { return }
        state = .attackingMobs
        stateTimer = 5.0

        mobSprite?.fillColor = .magenta

        let confused = SKLabelNode(text: "??")
        confused.fontSize = 12
        confused.fontColor = .white
        confused.position.y = 35
        confused.name = "confused"
        addChild(confused)
    }

    func applyPushBack() {
        guard state != .pushedBack else { return }
        state = .pushedBack
        stateTimer = 2.0

        // Move back along the path by reducing path index
        if currentPathIndex > 0 {
            currentPathIndex -= 1
        }

        // Visual feedback
        let pushLabel = SKLabelNode(text: "↩️")
        pushLabel.fontSize = 15
        pushLabel.position.y = 35
        pushLabel.name = "pushback"
        addChild(pushLabel)

        // Brief speed boost in reverse then normalize
        let oldSpeed = moveSpeed
        moveSpeed = -moveSpeed * 0.8

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            guard let self = self else { return }
            self.moveSpeed = oldSpeed
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            guard let self = self else { return }
            self.state = .normal
            self.childNode(withName: "pushback")?.removeFromParent()
        }
    }

    func updateHealthBar() {
        guard let healthBar = healthBar else { return }
        let percentage = CGFloat(health) / CGFloat(maxHealth)

        healthBar.xScale = percentage

        if percentage > 0.6 {
            healthBar.fillColor = .green
        } else if percentage > 0.3 {
            healthBar.fillColor = .yellow
        } else {
            healthBar.fillColor = .red
        }
    }

    func die() {
        guard !isDead else { return }
        isDead = true

        // Handle worm splitting
        if enemyType == .worm && !hasSplit && level < 5 {
            spawnWormSegments()
        }

        // Death explosion effect
        createDeathEffect()

        shouldRemove = true
    }

    func spawnWormSegments() {
        hasSplit = true

        // Create 2 smaller worms at current position
        // These will be handled by GameScene
        NotificationCenter.default.post(
            name: NSNotification.Name("WormSplit"),
            object: nil,
            userInfo: [
                "position": position,
                "path": path,
                "pathIndex": currentPathIndex,
                "level": level
            ]
        )
    }

    func createDeathEffect() {
        // Enemy-specific death effects
        switch enemyType {
        case .virus:
            // Explosive burst
            createParticleExplosion(color: .red, count: 12)
        case .worm:
            // Green goo splatter
            createParticleExplosion(color: .green, count: 8)
        case .trojan:
            // Yellow warning explosion
            createParticleExplosion(color: .yellow, count: 10)
        case .ransomware:
            // Purple boss explosion with screen shake
            createParticleExplosion(color: .purple, count: 20)
            NotificationCenter.default.post(name: NSNotification.Name("BossDefeated"), object: nil)
        case .packet:
            createParticleExplosion(color: mobColor(), count: 8)
        }

        // Binary particles for all
        for _ in 0..<6 {
            let bit = SKLabelNode(text: Bool.random() ? "1" : "0")
            bit.fontName = "Courier"
            bit.fontSize = 15
            bit.fontColor = .green
            bit.position = position
            if let parent = parent {
                parent.addChild(bit)

                let angle = CGFloat.random(in: 0..<(2 * .pi))
                let distance = CGFloat.random(in: 30...60)
                let move = SKAction.moveBy(x: cos(angle) * distance, y: sin(angle) * distance, duration: 0.5)
                let fade = SKAction.fadeOut(withDuration: 0.5)
                let remove = SKAction.removeFromParent()
                bit.run(SKAction.sequence([SKAction.group([move, fade]), remove]))
            }
        }
    }

    func createParticleExplosion(color: UIColor, count: Int) {
        guard let parent = parent else { return }

        for _ in 0..<count {
            let particle = SKShapeNode(circleOfRadius: CGFloat.random(in: 3...8))
            particle.fillColor = color
            particle.position = position
            parent.addChild(particle)

            let angle = CGFloat.random(in: 0..<(2 * .pi))
            let distance = CGFloat.random(in: 20...60)
            let move = SKAction.moveBy(x: cos(angle) * distance, y: sin(angle) * distance, duration: 0.4)
            let fade = SKAction.fadeOut(withDuration: 0.4)
            let scale = SKAction.scale(to: 0.1, duration: 0.4)
            let remove = SKAction.removeFromParent()
            particle.run(SKAction.sequence([SKAction.group([move, fade, scale]), remove]))
        }
    }

    func update(currentTime: TimeInterval) {
        guard !isDead else { return }

        // Animate worm segments
        if enemyType == .worm {
            animateWormSegments()
        }

        // Update state timers
        if stateTimer > 0 {
            stateTimer -= 0.016

            if state == .selfDestructing && stateTimer <= 0 {
                die()
                return
            }
        }

        // Reset state if timer expired
        if stateTimer <= 0 && (state == .attackingMobs || state == .selfDestructing) {
            state = .normal
            mobSprite?.fillColor = mobColor()
            childNode(withName: "warning")?.removeFromParent()
            childNode(withName: "confused")?.removeFromParent()
        }

        // Movement - confined to path
        guard currentPathIndex < path.count else {
            reachedEnd = true
            return
        }

        let target = path[currentPathIndex]
        let dx = target.x - position.x
        let dy = target.y - position.y
        let distanceToTarget = hypot(dx, dy)

        // Keep mob on path by projecting position onto path segment if too far
        var constrainedPosition = position
        if currentPathIndex > 0 && distanceToTarget > 30 {
            let prevPoint = path[max(0, currentPathIndex - 1)]
            constrainedPosition = closestPointOnSegment(point: position, segmentStart: prevPoint, segmentEnd: target)
            // Gently pull back toward path
            position.x = position.x * 0.95 + constrainedPosition.x * 0.05
            position.y = position.y * 0.95 + constrainedPosition.y * 0.05
        }

        if distanceToTarget < 5 {
            currentPathIndex += 1
        } else {
            let moveX = (dx / distanceToTarget) * self.moveSpeed * 0.016
            let moveY = (dy / distanceToTarget) * self.moveSpeed * 0.016
            position.x += moveX
            position.y += moveY
        }
    }

    func closestPointOnSegment(point: CGPoint, segmentStart: CGPoint, segmentEnd: CGPoint) -> CGPoint {
        let dx = segmentEnd.x - segmentStart.x
        let dy = segmentEnd.y - segmentStart.y
        let lengthSquared = dx * dx + dy * dy

        if lengthSquared == 0 {
            return segmentStart
        }

        var t = ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / lengthSquared
        t = max(0, min(1, t))

        return CGPoint(
            x: segmentStart.x + t * dx,
            y: segmentStart.y + t * dy
        )
    }

    func animateWormSegments() {
        // Animate worm segments following
        for i in 1...2 {
            if let segment = childNode(withName: "segment\(i)") {
                let offset = CGPoint(x: -CGFloat(i * 15), y: sin(Date().timeIntervalSince1970 * 5 + Double(i)) * 3)
                segment.position = offset
            }
        }
    }
}
