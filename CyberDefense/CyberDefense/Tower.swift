import SpriteKit

class Tower: SKNode {
    let towerType: TowerType
    let range: CGFloat
    let damage: Int
    let fireRate: TimeInterval
    var lastFireTime: TimeInterval = 0
    var targetMob: Mob?
    var upgradeLevel: Int = 1
    var maxUpgradeLevel: Int = 3

    // Upgrade multipliers
    var currentDamage: Int {
        let base = Double(damage)
        let multiplier = 1.0 + (Double(upgradeLevel - 1) * 0.5)
        return Int(base * multiplier)
    }

    var currentFireRate: TimeInterval {
        let base = fireRate
        let reduction = Double(upgradeLevel - 1) * 0.15
        return max(0.2, base - reduction)
    }

    var currentRange: CGFloat {
        let base = Double(range)
        let multiplier = 1.0 + (Double(upgradeLevel - 1) * 0.2)
        return CGFloat(base * multiplier)
    }

    // Visual elements
    var baseNode: SKShapeNode?
    var turretNode: SKNode?
    var glowNode: SKShapeNode?
    var levelIndicators: [SKNode] = []

    init(type: TowerType, position: CGPoint) {
        self.towerType = type
        self.range = type.range
        self.damage = type.damage
        self.fireRate = type.fireRate
        super.init()
        self.position = position
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func setup(in scene: SKScene) {
        // Tower base - smaller for zoomed out view
        let base = SKShapeNode(circleOfRadius: 22)
        base.fillColor = .darkGray
        base.strokeColor = towerColor()
        base.lineWidth = 2
        base.glowWidth = 3
        addChild(base)
        baseNode = base

        // Turret container
        turretNode = SKNode()
        addChild(turretNode!)

        // Create turret based on type and level
        updateTurretAppearance()

        // Tower label - smaller
        let label = SKLabelNode(text: towerType.rawValue)
        label.fontName = "Courier-Bold"
        label.fontSize = 7
        label.fontColor = .white
        label.position.y = -10
        addChild(label)

        // Range indicator (hidden by default)
        let rangeCircle = SKShapeNode(circleOfRadius: currentRange)
        rangeCircle.strokeColor = towerColor()
        rangeCircle.lineWidth = 1
        rangeCircle.alpha = 0.0
        rangeCircle.name = "rangeIndicator"
        addChild(rangeCircle)

        // Show range on placement
        let fadeIn = SKAction.fadeAlpha(to: 0.2, duration: 0.2)
        let fadeOut = SKAction.fadeAlpha(to: 0.0, duration: 0.2)
        rangeCircle.run(SKAction.sequence([fadeIn, fadeOut]))

        // Add level indicators
        updateLevelIndicators()

        scene.addChild(self)
    }

    func updateTurretAppearance() {
        turretNode?.removeAllChildren()

        let turret = createTurretForLevel()
        turretNode?.addChild(turret)

        // Add glow effect for higher levels
        if upgradeLevel >= 2 {
            let glow = SKShapeNode(circleOfRadius: 25 + CGFloat(upgradeLevel * 3))
            glow.strokeColor = towerColor()
            glow.lineWidth = 2
            glow.alpha = 0.3 - (0.05 * CGFloat(upgradeLevel))

            let pulse = SKAction.sequence([
                SKAction.fadeAlpha(to: 0.5, duration: 0.5),
                SKAction.fadeAlpha(to: 0.3 - (0.05 * CGFloat(upgradeLevel)), duration: 0.5)
            ])
            glow.run(SKAction.repeatForever(pulse))
            turretNode?.addChild(glow)
            glowNode = glow
        }
    }

    func createTurretForLevel() -> SKNode {
        let container = SKNode()

        switch towerType {
        case .csrf:
            container.addChild(createCSRFIcon(level: upgradeLevel))
        case .bruteForce:
            container.addChild(createBruteForceIcon(level: upgradeLevel))
        case .pineapple:
            container.addChild(createPineappleIcon(level: upgradeLevel))
        }

        return container
    }

    func createCSRFIcon(level: Int) -> SKNode {
        let container = SKNode()

        // Core explosion icon - scaled down
        let shape = SKShapeNode(circleOfRadius: 10 + CGFloat(level * 2))
        shape.fillColor = .orange
        shape.alpha = 0.8
        shape.name = "csrfCore"
        container.addChild(shape)

        // Sparks increase with level - smaller
        let sparkCount = level == 1 ? 2 : (level == 2 ? 4 : 8)
        for i in 0..<sparkCount {
            let angle = (CGFloat(i) / CGFloat(sparkCount)) * 2 * .pi
            let spark = SKShapeNode(rectOf: CGSize(width: 3, height: 6 + level * 2))
            spark.fillColor = .yellow
            spark.position = CGPoint(x: cos(angle) * (12 + CGFloat(level) * 2), y: sin(angle) * (12 + CGFloat(level) * 2))
            spark.zRotation = angle + .pi / 2
            container.addChild(spark)
        }

        // Level 3: Add rotating ring - smaller
        if level >= 3 {
            let ring = SKShapeNode(circleOfRadius: 18)
            ring.strokeColor = .red
            ring.lineWidth = 2
            ring.alpha = 0.6
            ring.name = "rotatingRing"

            let rotate = SKAction.rotate(byAngle: .pi * 2, duration: 2)
            ring.run(SKAction.repeatForever(rotate))
            container.addChild(ring)
        }

        return container
    }

    func createBruteForceIcon(level: Int) -> SKNode {
        let container = SKNode()

        // Key head - grows with level - smaller base
        let keyHead = SKShapeNode(circleOfRadius: 6 + CGFloat(level))
        keyHead.fillColor = .red
        container.addChild(keyHead)

        // Key shaft - shorter
        let shaftLength: CGFloat = 12 + CGFloat(level * 4)
        let keyShaft = SKShapeNode(rectOf: CGSize(width: 4, height: shaftLength))
        keyShaft.fillColor = .orange
        keyShaft.position.y = -shaftLength / 2 - 5
        container.addChild(keyShaft)

        // Key teeth - more teeth at higher levels - smaller
        let teethCount = level == 1 ? 1 : (level == 2 ? 2 : 3)
        for i in 0..<teethCount {
            let teeth = SKShapeNode(rectOf: CGSize(width: 6 + CGFloat(level * 2), height: 3))
            teeth.fillColor = .orange
            teeth.position = CGPoint(x: 2 + CGFloat(i * 2), y: -14 - CGFloat(i * 3))
            container.addChild(teeth)
        }

        // Level 2+: Add electric effect - smaller
        if level >= 2 {
            let bolt = SKLabelNode(text: "⚡")
            bolt.fontSize = 14
            bolt.position.y = 12
            container.addChild(bolt)

            let pulse = SKAction.sequence([
                SKAction.scale(to: 1.3, duration: 0.2),
                SKAction.scale(to: 1.0, duration: 0.2)
            ])
            bolt.run(SKAction.repeatForever(pulse))
        }

        // Level 3: Dual keys - smaller offset
        if level >= 3 {
            let secondKey = createBruteForceIcon(level: 1)
            secondKey.position = CGPoint(x: 12, y: 0)
            secondKey.setScale(0.6)
            container.addChild(secondKey)
        }

        return container
    }

    func createPineappleIcon(level: Int) -> SKNode {
        let container = SKNode()

        // Base dot - smaller
        let baseDot = SKShapeNode(circleOfRadius: 3)
        baseDot.fillColor = .purple
        baseDot.position.y = -12
        container.addChild(baseDot)

        // Signal arcs - more arcs at higher levels - smaller base
        let arcCount = level == 1 ? 2 : (level == 2 ? 3 : 4)
        let baseRadius: CGFloat = level == 1 ? 6 : (level == 2 ? 8 : 10)

        for i in 0..<arcCount {
            let radius = baseRadius + CGFloat(i) * 5
            let arc = SKShapeNode(arcOfRadius: radius, startAngle: 0, endAngle: .pi, clockwise: false)
            arc.strokeColor = .purple
            arc.lineWidth = 1 + CGFloat(level) * 0.5
            arc.alpha = 0.7 + (0.1 * CGFloat(level))
            arc.position.y = -6

            // Animate arcs at level 3
            if level >= 3 {
                let pulse = SKAction.sequence([
                    SKAction.fadeAlpha(to: 1, duration: 0.3),
                    SKAction.fadeAlpha(to: 0.7, duration: 0.3)
                ])
                arc.run(SKAction.repeatForever(pulse))
            }

            container.addChild(arc)
        }

        // Level 2+: Add wave pulses - smaller
        if level >= 2 {
            for _ in 0...2 {
                let wave = SKShapeNode(circleOfRadius: 30)
                wave.strokeColor = .purple
                wave.lineWidth = 1.5
                wave.alpha = 0
                wave.position.y = -6
                container.addChild(wave)

                let expand = SKAction.scale(to: 1.5, duration: 1.5)
                let fadeIn = SKAction.fadeAlpha(to: 0.5, duration: 0.3)
                let fadeOut = SKAction.fadeAlpha(to: 0, duration: 1.2)
                let sequence = SKAction.sequence([fadeIn, SKAction.group([expand, fadeOut])])
                wave.run(SKAction.repeatForever(sequence))
            }
        }

        return container
    }

    func updateLevelIndicators() {
        // Remove old indicators
        for indicator in levelIndicators {
            indicator.removeFromParent()
        }
        levelIndicators.removeAll()

        // Add pips to show upgrade level - smaller and closer
        for i in 0..<upgradeLevel {
            let pip = SKShapeNode(circleOfRadius: 2.5)
            pip.fillColor = towerColor()
            pip.position = CGPoint(x: -10 + (i * 10), y: -22)
            addChild(pip)
            levelIndicators.append(pip)
        }
    }

    func towerColor() -> UIColor {
        switch towerType {
        case .csrf:
            return .orange
        case .bruteForce:
            return .red
        case .pineapple:
            return .purple
        }
    }

    func canUpgrade() -> Bool {
        return upgradeLevel < maxUpgradeLevel
    }

    func upgradeCost() -> Int {
        let baseCost = towerType.cost
        return Int(Double(baseCost) * 0.7 * Double(upgradeLevel))
    }

    func upgrade() -> Bool {
        guard canUpgrade() else { return false }

        upgradeLevel += 1

        // Update visual appearance
        updateTurretAppearance()

        // Update level indicators
        updateLevelIndicators()

        // Update range indicator
        if let rangeCircle = childNode(withName: "rangeIndicator") as? SKShapeNode {
            rangeCircle.removeFromParent()
            let newRangeCircle = SKShapeNode(circleOfRadius: currentRange)
            newRangeCircle.strokeColor = towerColor()
            newRangeCircle.lineWidth = 1
            newRangeCircle.alpha = 0.0
            newRangeCircle.name = "rangeIndicator"
            addChild(newRangeCircle)

            // Flash the new range
            let fadeIn = SKAction.fadeAlpha(to: 0.3, duration: 0.3)
            let fadeOut = SKAction.fadeAlpha(to: 0.0, duration: 0.3)
            newRangeCircle.run(SKAction.sequence([fadeIn, fadeOut]))
        }

        return true
    }

    func update(currentTime: TimeInterval, mobs: [Mob], scene: GameScene) {
        // Find target using current range
        if targetMob == nil || targetMob!.isDead || !isInRange(targetMob!) {
            targetMob = findTarget(mobs: mobs)
        }

        // Fire at target using current fire rate
        if let target = targetMob, currentTime - lastFireTime > currentFireRate {
            fire(at: target, in: scene)
            lastFireTime = currentTime
        }

        // Animate rotating parts
        if let ring = turretNode?.childNode(withName: "rotatingRing") {
            ring.zRotation += 0.05
        }
    }

    func isInRange(_ mob: Mob) -> Bool {
        let distance = hypot(mob.position.x - position.x, mob.position.y - position.y)
        return distance <= currentRange
    }

    func findTarget(mobs: [Mob]) -> Mob? {
        var closestMob: Mob?
        var closestDistance: CGFloat = currentRange

        for mob in mobs where !mob.isDead {
            let distance = hypot(mob.position.x - position.x, mob.position.y - position.y)
            if distance < closestDistance {
                closestDistance = distance
                closestMob = mob
            }
        }

        return closestMob
    }

    func fire(at mob: Mob, in scene: GameScene) {
        // Level 3 CSRF: Splash damage
        if towerType == .csrf && upgradeLevel >= 3 {
            createSplashAttack(target: mob, in: scene)
        }

        // Level 3 Brute Force: Chain attack
        else if towerType == .bruteForce && upgradeLevel >= 3 {
            createChainAttack(target: mob, in: scene)
        }

        // Level 3 Pineapple: Permanent slow field (handled in update)
        else if towerType == .pineapple && upgradeLevel >= 3 {
            createSlowField(target: mob, in: scene)
        }

        else {
            // Normal attack
            let projectile = Projectile(type: towerType, from: position, to: mob, damage: currentDamage, scene: scene)
            scene.projectiles.append(projectile)
            scene.addChild(projectile)
            projectile.didMoveToScene()
        }

        // Create binary data stream effect
        createBinaryStream(to: mob.position)
    }

    func createSplashAttack(target: Mob, in scene: GameScene) {
        // Create projectile that explodes on impact
        let projectile = Projectile(type: towerType, from: position, to: target, damage: currentDamage, scene: scene, isExplosive: true)
        scene.projectiles.append(projectile)
        scene.addChild(projectile)
        projectile.didMoveToScene()
    }

    func createChainAttack(target: Mob, in scene: GameScene) {
        // Hit primary target
        target.takeDamage(currentDamage, type: towerType)

        // Chain to nearby enemies
        let chainRange: CGFloat = 100
        var chainedCount = 0
        let maxChains = 2

        for mob in scene.mobs where mob !== target && !mob.isDead && chainedCount < maxChains {
            let distance = hypot(mob.position.x - target.position.x, mob.position.y - target.position.y)
            if distance <= chainRange {
                // Create chain lightning effect
                createChainLightning(from: target.position, to: mob.position, in: scene)

                // Damage chained target
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    mob.takeDamage(self.currentDamage / 2, type: self.towerType)
                }
                chainedCount += 1
            }
        }

        // Create binary stream to primary target
        createBinaryStream(to: target.position)
    }

    func createChainLightning(from start: CGPoint, to end: CGPoint, in scene: GameScene) {
        let midPoint = CGPoint(x: (start.x + end.x) / 2, y: (start.y + end.y) / 2)

        // Create jagged lightning path
        let path = CGMutablePath()
        path.move(to: start)

        var current = start
        while hypot(end.x - current.x, end.y - current.y) > 20 {
            let angle = atan2(end.y - current.y, end.x - current.x)
            let distance = min(30, hypot(end.x - current.x, end.y - current.y))
            let offset = CGFloat.random(in: -15...15)

            current = CGPoint(
                x: current.x + cos(angle) * distance + cos(angle + .pi/2) * offset,
                y: current.y + sin(angle) * distance + sin(angle + .pi/2) * offset
            )
            path.addLine(to: current)
        }
        path.addLine(to: end)

        let lightning = SKShapeNode(path: path)
        lightning.strokeColor = .yellow
        lightning.lineWidth = 3
        lightning.glowWidth = 5
        scene.addChild(lightning)

        let fade = SKAction.fadeOut(withDuration: 0.2)
        let remove = SKAction.removeFromParent()
        lightning.run(SKAction.sequence([fade, remove]))
    }

    func createSlowField(target: Mob, in scene: GameScene) {
        // Fire projectile that creates a slow field
        let projectile = Projectile(type: towerType, from: position, to: target, damage: currentDamage, scene: scene, createsSlowField: true)
        scene.projectiles.append(projectile)
        scene.addChild(projectile)
        projectile.didMoveToScene()
    }

    func createBinaryStream(to target: CGPoint) {
        let start = position
        let end = target
        let distance = hypot(end.x - start.x, end.y - start.y)
        let steps = Int(distance / 20)

        for i in 0..<steps {
            let t = CGFloat(i) / CGFloat(steps)
            let pos = CGPoint(
                x: start.x + (end.x - start.x) * t,
                y: start.y + (end.y - start.y) * t
            )

            let bit = SKLabelNode(text: Bool.random() ? "1" : "0")
            bit.fontName = "Courier"
            bit.fontSize = 12
            bit.fontColor = towerColor()
            bit.position = pos
            bit.alpha = 0.8

            if let parent = parent {
                parent.addChild(bit)

                let fade = SKAction.fadeOut(withDuration: 0.3)
                let remove = SKAction.removeFromParent()
                bit.run(SKAction.sequence([fade, remove]))
            }
        }
    }
}

// MARK: - Helper Extensions

extension SKShapeNode {
    convenience init(arcOfRadius radius: CGFloat, startAngle: CGFloat, endAngle: CGFloat, clockwise: Bool) {
        let path = UIBezierPath(arcCenter: .zero, radius: radius, startAngle: startAngle, endAngle: endAngle, clockwise: clockwise)
        self.init(path: path.cgPath)
    }
}
