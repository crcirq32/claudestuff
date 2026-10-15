import SpriteKit

class Projectile: SKNode {
    let projectileType: TowerType
    let damage: Int
    weak var target: Mob?
    weak var gameScene: GameScene?
    var shouldRemove: Bool = false
    var moveSpeed: CGFloat = 300
    var isExplosive: Bool = false
    var createsSlowField: Bool = false
    var explosionRadius: CGFloat = 60

    init(type: TowerType, from start: CGPoint, to targetMob: Mob, damage: Int, scene: GameScene, isExplosive: Bool = false, createsSlowField: Bool = false) {
        self.projectileType = type
        self.damage = damage
        self.target = targetMob
        self.gameScene = scene
        self.isExplosive = isExplosive
        self.createsSlowField = createsSlowField
        super.init()
        self.position = start
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func didMoveToScene() {
        setupVisuals()
        moveToTarget()
    }

    func setupVisuals() {
        switch projectileType {
        case .csrf:
            // Explosive data packet
            let packet = SKShapeNode(rectOf: CGSize(width: 12, height: 12), cornerRadius: 2)
            packet.fillColor = isExplosive ? .red : .orange
            packet.strokeColor = .yellow
            packet.lineWidth = isExplosive ? 3 : 1
            addChild(packet)

            // Binary trail
            let trail = SKLabelNode(text: isExplosive ? "💥" : "1010")
            trail.fontName = "Courier"
            trail.fontSize = isExplosive ? 14 : 10
            trail.fontColor = .orange
            trail.alpha = 0.6
            trail.position = CGPoint(x: -15, y: 0)
            addChild(trail)

            // Extra glow for explosive
            if isExplosive {
                let glow = SKShapeNode(circleOfRadius: 15)
                glow.fillColor = .red
                glow.alpha = 0.3
                let pulse = SKAction.sequence([
                    SKAction.fadeAlpha(to: 0.6, duration: 0.2),
                    SKAction.fadeAlpha(to: 0.3, duration: 0.2)
                ])
                glow.run(SKAction.repeatForever(pulse))
                addChild(glow)
            }

        case .bruteForce:
            // Key projectile
            let keyHead = SKShapeNode(circleOfRadius: 6)
            keyHead.fillColor = .red
            addChild(keyHead)

            let keyShaft = SKShapeNode(rectOf: CGSize(width: 3, height: 15))
            keyShaft.fillColor = .orange
            keyShaft.position.y = -10
            addChild(keyShaft)

            // Password attempt trail
            let trail = SKLabelNode(text: "****")
            trail.fontName = "Courier-Bold"
            trail.fontSize = 8
            trail.fontColor = .red
            trail.alpha = 0.5
            trail.position = CGPoint(x: -12, y: 0)
            addChild(trail)

        case .pineapple:
            // Signal wave
            let core = SKShapeNode(circleOfRadius: 5)
            core.fillColor = createsSlowField ? .cyan : .purple
            addChild(core)

            // WiFi rings
            for i in 1...3 {
                let ring = SKShapeNode(circleOfRadius: CGFloat(i * 4))
                ring.strokeColor = createsSlowField ? .cyan : .purple
                ring.lineWidth = createsSlowField ? 2 : 1
                ring.alpha = 0.5
                addChild(ring)

                // Pulsing animation
                let pulse = SKAction.sequence([
                    SKAction.fadeAlpha(to: 0.8, duration: 0.2),
                    SKAction.fadeAlpha(to: 0.3, duration: 0.2)
                ])
                ring.run(SKAction.repeatForever(pulse))
            }

            // Signal trail
            let trailText = createsSlowField ? "❄️" : "~~~"
            let trail = SKLabelNode(text: trailText)
            trail.fontName = "Courier"
            trail.fontSize = 10
            trail.fontColor = createsSlowField ? .cyan : .purple
            trail.alpha = 0.4
            trail.position = CGPoint(x: -15, y: 0)
            addChild(trail)
        }
    }

    func moveToTarget() {
        guard let target = target, let parent = parent else {
            shouldRemove = true
            return
        }

        let startPos = position
        let endPos = target.position
        let distance = hypot(endPos.x - startPos.x, endPos.y - startPos.y)
        let duration = distance / moveSpeed

        let move = SKAction.move(to: endPos, duration: duration)
        let rotate = SKAction.rotate(byAngle: .pi * 2, duration: duration)

        run(SKAction.group([move, rotate])) { [weak self] in
            self?.hitTarget()
        }
    }

    func hitTarget() {
        guard let target = target else {
            shouldRemove = true
            return
        }

        // Apply damage to primary target
        if !target.isDead {
            target.takeDamage(damage, type: projectileType)
        }

        // Handle explosive splash damage
        if isExplosive {
            createExplosion(at: position)
        }

        // Handle slow field creation
        if createsSlowField {
            createSlowField(at: position)
        }

        // Create hit effect
        createHitEffect(at: position)

        shouldRemove = true
    }

    func createExplosion(at position: CGPoint) {
        guard let gameScene = gameScene else { return }

        // Visual explosion
        let explosion = SKShapeNode(circleOfRadius: explosionRadius)
        explosion.fillColor = .red
        explosion.strokeColor = .orange
        explosion.lineWidth = 3
        explosion.alpha = 0.8
        explosion.position = position
        gameScene.addChild(explosion)

        let expand = SKAction.scale(to: 1.2, duration: 0.3)
        let fade = SKAction.fadeOut(withDuration: 0.3)
        let remove = SKAction.removeFromParent()
        explosion.run(SKAction.sequence([expand, fade, remove]))

        // Damage all mobs in explosion radius
        for mob in gameScene.mobs where !mob.isDead {
            let distance = hypot(mob.position.x - position.x, mob.position.y - position.y)
            if distance <= explosionRadius {
                // Splash damage is 50% of primary damage
                mob.takeDamage(damage / 2, type: projectileType)
            }
        }

        // Binary fragments
        for _ in 0..<10 {
            let bit = SKLabelNode(text: Bool.random() ? "1" : "0")
            bit.fontName = "Courier"
            bit.fontSize = CGFloat.random(in: 12...20)
            bit.fontColor = .red
            bit.position = position
            gameScene.addChild(bit)

            let angle = CGFloat.random(in: 0..<(2 * .pi))
            let distance = CGFloat.random(in: 40...80)
            let move = SKAction.moveBy(x: cos(angle) * distance, y: sin(angle) * distance, duration: 0.4)
            let fade = SKAction.fadeOut(withDuration: 0.4)
            bit.run(SKAction.sequence([SKAction.group([move, fade]), SKAction.removeFromParent()]))
        }
    }

    func createSlowField(at position: CGPoint) {
        guard let gameScene = gameScene else { return }

        // Create persistent slow field
        let slowField = SKNode()
        slowField.position = position
        slowField.name = "slowField"
        gameScene.addChild(slowField)

        // Visual representation
        let field = SKShapeNode(circleOfRadius: 80)
        field.fillColor = .cyan
        field.alpha = 0.2
        field.strokeColor = .cyan
        field.lineWidth = 2
        slowField.addChild(field)

        // Pulsing ring
        let ring = SKShapeNode(circleOfRadius: 70)
        ring.strokeColor = .cyan
        ring.lineWidth = 2
        ring.alpha = 0.5
        slowField.addChild(ring)

        let pulse = SKAction.sequence([
            SKAction.scale(to: 1.1, duration: 1),
            SKAction.scale(to: 1.0, duration: 1)
        ])
        ring.run(SKAction.repeatForever(pulse))

        // Snow particles
        for _ in 0..<8 {
            let snow = SKLabelNode(text: "❄️")
            snow.fontSize = 12
            snow.position = CGPoint(
                x: CGFloat.random(in: -60...60),
                y: CGFloat.random(in: -60...60)
            )
            slowField.addChild(snow)

            let drift = SKAction.moveBy(x: CGFloat.random(in: -20...20), y: CGFloat.random(in: -30...30), duration: 2)
            let fade = SKAction.fadeAlpha(to: 0.3, duration: 2)
            snow.run(SKAction.repeatForever(SKAction.sequence([drift, fade.reversed()])))
        }

        // Duration and removal
        let wait = SKAction.wait(forDuration: 5.0) // 5 second duration
        let fadeOut = SKAction.fadeOut(withDuration: 0.5)
        let remove = SKAction.removeFromParent()
        slowField.run(SKAction.sequence([wait, fadeOut, remove]))

        // Apply slow effect to mobs in range
        let slowTimer = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { timer in
            guard slowField.parent != nil else {
                timer.invalidate()
                return
            }

            for mob in gameScene.mobs where !mob.isDead {
                let distance = hypot(mob.position.x - position.x, mob.position.y - position.y)
                if distance <= 80 && mob.state != .pushedBack {
                    // Slow the mob by 30%
                    mob.moveSpeed = mob.originalSpeed * 0.7
                }
            }
        }

        // Clean up timer when field expires
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.5) {
            slowTimer.invalidate()
        }
    }

    func createHitEffect(at position: CGPoint) {
        guard let gameScene = gameScene else { return }

        switch projectileType {
        case .csrf:
            // Explosion effect
            let explosion = SKShapeNode(circleOfRadius: isExplosive ? 40 : 25)
            explosion.fillColor = isExplosive ? .red : .orange
            explosion.alpha = 0.7
            explosion.position = position
            gameScene.addChild(explosion)

            let expand = SKAction.scale(to: isExplosive ? 2.0 : 1.5, duration: 0.2)
            let fade = SKAction.fadeOut(withDuration: 0.2)
            let remove = SKAction.removeFromParent()
            explosion.run(SKAction.sequence([expand, fade, remove]))

            // Binary fragments
            let fragmentCount = isExplosive ? 10 : 6
            for _ in 0..<fragmentCount {
                let bit = SKLabelNode(text: Bool.random() ? "1" : "0")
                bit.fontName = "Courier"
                bit.fontSize = CGFloat.random(in: 10...18)
                bit.fontColor = isExplosive ? .red : .orange
                bit.position = position
                gameScene.addChild(bit)

                let angle = CGFloat.random(in: 0..<(2 * .pi))
                let distance = CGFloat.random(in: 30...50)
                let move = SKAction.moveBy(x: cos(angle) * distance, y: sin(angle) * distance, duration: 0.3)
                let fade = SKAction.fadeOut(withDuration: 0.3)
                bit.run(SKAction.sequence([SKAction.group([move, fade]), SKAction.removeFromParent()]))
            }

        case .bruteForce:
            // Key smash effect
            let spark = SKShapeNode(circleOfRadius: 20)
            spark.fillColor = .red
            spark.alpha = 0.6
            spark.position = position
            gameScene.addChild(spark)

            let fade = SKAction.fadeOut(withDuration: 0.2)
            let remove = SKAction.removeFromParent()
            spark.run(SKAction.sequence([fade, remove]))

            // Password cracked text
            let cracked = SKLabelNode(text: "ACCESS")
            cracked.fontName = "Courier-Bold"
            cracked.fontSize = 14
            cracked.fontColor = .red
            cracked.position = position
            gameScene.addChild(cracked)

            let moveUp = SKAction.moveBy(x: 0, y: 30, duration: 0.5)
            let fadeText = SKAction.fadeOut(withDuration: 0.5)
            cracked.run(SKAction.sequence([SKAction.group([moveUp, fadeText]), SKAction.removeFromParent()]))

        case .pineapple:
            // Signal disruption effect
            let wave = SKShapeNode(circleOfRadius: 10)
            wave.strokeColor = createsSlowField ? .cyan : .purple
            wave.lineWidth = createsSlowField ? 4 : 2
            wave.position = position
            gameScene.addChild(wave)

            let expand = SKAction.scale(to: createsSlowField ? 5 : 3, duration: createsSlowField ? 0.6 : 0.4)
            let fade = SKAction.fadeOut(withDuration: createsSlowField ? 0.6 : 0.4)
            wave.run(SKAction.sequence([SKAction.group([expand, fade]), SKAction.removeFromParent()]))

            // Interference pattern
            let patternCount = createsSlowField ? 8 : 4
            for _ in 0..<patternCount {
                let zigzag = SKShapeNode()
                let path = UIBezierPath()
                path.move(to: CGPoint(x: -20, y: 0))
                for i in 0..<5 {
                    path.addLine(to: CGPoint(x: CGFloat(i) * 10 - 20, y: i % 2 == 0 ? 10 : -10))
                }
                zigzag.path = path.cgPath
                zigzag.strokeColor = createsSlowField ? .cyan : .purple
                zigzag.lineWidth = createsSlowField ? 3 : 2
                zigzag.position = position

                let rotate = SKAction.rotate(byAngle: .pi / 2 * CGFloat.random(in: 1...4), duration: createsSlowField ? 0.5 : 0.3)
                let fade = SKAction.fadeOut(withDuration: createsSlowField ? 0.5 : 0.3)
                gameScene.addChild(zigzag)
                zigzag.run(SKAction.sequence([SKAction.group([rotate, fade]), SKAction.removeFromParent()]))
            }
        }
    }

    func update() {
        // Remove if target is dead and not explosive/slow field (those still do their effect)
        if let target = target, target.isDead && !isExplosive && !createsSlowField {
            shouldRemove = true
        }
    }
}
