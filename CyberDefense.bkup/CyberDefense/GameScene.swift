import SpriteKit
import SwiftUI

class GameScene: SKScene {
    weak var gameState: GameState?

    // Game elements
    var towers: [Tower] = []
    var mobs: [Mob] = []
    var projectiles: [Projectile] = []
    var baseNode: SKNode!
    var pathPoints: [CGPoint] = []

    // Level configuration
    var spawnTimer: Timer?
    var mobsToSpawn: Int = 0
    var mobsSpawned: Int = 0
    var waveCleared: Bool = false
    var waveComposition: [EnemyType] = []
    var currentSpawnIndex: Int = 0

    // Matrix effect
    var binaryParticles: [SKLabelNode] = []
    var matrixRainTimer: Timer?

    // Notifications
    var wormSplitObserver: NSObjectProtocol?
    var bossDefeatedObserver: NSObjectProtocol?

    override func didMove(to view: SKView) {
        backgroundColor = .black
        setupNotifications()
        setupLevel()
        setupMatrixEffect()
        setupGameState()
    }

    deinit {
        if let observer = wormSplitObserver {
            NotificationCenter.default.removeObserver(observer)
        }
        if let observer = bossDefeatedObserver {
            NotificationCenter.default.removeObserver(observer)
        }
    }

    func setupNotifications() {
        wormSplitObserver = NotificationCenter.default.addObserver(
            forName: NSNotification.Name("WormSplit"),
            object: nil,
            queue: .main
        ) { [weak self] notification in
            guard let userInfo = notification.userInfo,
                  let position = userInfo["position"] as? CGPoint,
                  let path = userInfo["path"] as? [CGPoint],
                  let pathIndex = userInfo["pathIndex"] as? Int,
                  let level = userInfo["level"] as? Int else { return }
            self?.handleWormSplit(position: position, path: path, pathIndex: pathIndex, level: level)
        }

        bossDefeatedObserver = NotificationCenter.default.addObserver(
            forName: NSNotification.Name("BossDefeated"),
            object: nil,
            queue: .main
        ) { [weak self] _ in
            self?.handleBossDefeated()
        }
    }

    func handleWormSplit(position: CGPoint, path: [CGPoint], pathIndex: Int, level: Int) {
        // Spawn 2 smaller worms
        for i in 0..<2 {
            let worm = Mob(level: level, path: path, type: .worm)
            worm.position = CGPoint(x: position.x + CGFloat(i * 20 - 10), y: position.y)
            worm.currentPathIndex = max(0, min(pathIndex, path.count - 1))
            worm.hasSplit = true // Prevent infinite splitting
            worm.setup(in: self)
            mobs.append(worm)
            addChild(worm)
        }
    }

    func handleBossDefeated() {
        // Screen shake effect
        let shake = SKAction.sequence([
            SKAction.moveBy(x: 10, y: 0, duration: 0.05),
            SKAction.moveBy(x: -20, y: 0, duration: 0.05),
            SKAction.moveBy(x: 20, y: 0, duration: 0.05),
            SKAction.moveBy(x: -10, y: 0, duration: 0.05),
            SKAction.moveBy(x: 0, y: 10, duration: 0.05),
            SKAction.moveBy(x: 0, y: -20, duration: 0.05),
            SKAction.moveBy(x: 0, y: 20, duration: 0.05),
            SKAction.moveBy(x: 0, y: -10, duration: 0.05)
        ])
        self.run(shake)

        // Bonus money
        gameState?.addMoney(100)
    }

    func setupGameState() {
        gameState?.onPlaceTower = { [weak self] towerType, position in
            self?.placeTower(type: towerType, at: position)
        }

        gameState?.onStartWave = { [weak self] in
            self?.startWave()
        }

        gameState?.onReset = { [weak self] in
            self?.resetGame()
        }
    }

    func setupLevel() {
        removeAllChildren()
        towers.removeAll()
        mobs.removeAll()
        projectiles.removeAll()
        pathPoints.removeAll()

        createPath()
        createBase()
        createTowerSpots()
        setupMatrixEffect()
    }

    func createPath() {
        pathPoints = generateRandomPath()
        renderPath()
    }

    func generateRandomPath() -> [CGPoint] {
        let width = size.width
        let height = size.height
        let margin: CGFloat = 80
        let endY: CGFloat = 200

        var points: [CGPoint] = []

        let startPoint = CGPoint(x: margin, y: height - margin)
        let endPoint = CGPoint(x: width - margin, y: endY)

        points.append(startPoint)

        let level = gameState?.currentLevel ?? 1
        // More zigzag segments for better tower placement
        let complexity = min(8 + (level / 3), 24)
        let numSegments = Int.random(in: complexity...(complexity + 4))

        var currentPoint = startPoint
        let minSegmentLength: CGFloat = 80
        var maxSegmentLength: CGFloat = min(width, height) * 0.35
        if maxSegmentLength < minSegmentLength {
            maxSegmentLength = minSegmentLength * 2
        }

        for i in 0..<numSegments {
            let progress = CGFloat(i + 1) / CGFloat(numSegments + 1)

            var candidates: [CGPoint] = []
            for _ in 0..<20 {
                let angleVariation: CGFloat = .pi / 2.5
                let baseAngle = -CGFloat.pi / 2 + (progress * CGFloat.pi / 2)
                let angle = baseAngle + CGFloat.random(in: -angleVariation...angleVariation)
                let length = CGFloat.random(in: minSegmentLength...maxSegmentLength)

                var newX = currentPoint.x + cos(angle) * length
                var newY = currentPoint.y + sin(angle) * length

                newX = max(margin * 2, min(width - margin * 2, newX))
                newY = max(endY + margin, min(height - margin, newY))

                let candidate = CGPoint(x: newX, y: newY)

                var tooClose = false
                for existingPoint in points {
                    if distance(candidate, existingPoint) < minSegmentLength * 0.8 {
                        tooClose = true
                        break
                    }
                }

                if !tooClose && distance(candidate, endPoint) > minSegmentLength {
                    candidates.append(candidate)
                }
            }

            if let bestCandidate = candidates.min(by: { distance($0, endPoint) < distance($1, endPoint) }) {
                points.append(bestCandidate)
                currentPoint = bestCandidate
            }
        }

        points.append(endPoint)

        return smoothPath(points)
    }

    func smoothPath(_ points: [CGPoint]) -> [CGPoint] {
        guard points.count > 2 else { return points }

        var smoothed: [CGPoint] = [points[0]]

        for i in 1..<points.count - 1 {
            let prev = points[i - 1]
            let curr = points[i]
            let next = points[i + 1]

            let avgX = (prev.x + curr.x * 2 + next.x) / 4
            let avgY = (prev.y + curr.y * 2 + next.y) / 4
            smoothed.append(CGPoint(x: avgX, y: avgY))
        }

        smoothed.append(points.last!)
        return smoothed
    }

    func renderPath() {
        let path = CGMutablePath()
        path.move(to: pathPoints[0])
        for i in 1..<pathPoints.count {
            path.addLine(to: pathPoints[i])
        }

        let pathLine = SKShapeNode(path: path)
        pathLine.strokeColor = .green
        pathLine.lineWidth = 20
        pathLine.alpha = 0.3
        pathLine.glowWidth = 10
        pathLine.name = "pathLine"
        addChild(pathLine)

        for i in stride(from: 0, to: pathPoints.count - 1, by: 1) {
            let start = pathPoints[i]
            let end = pathPoints[i + 1]
            let mid = CGPoint(x: (start.x + end.x) / 2, y: (start.y + end.y) / 2)

            let binary = SKLabelNode(text: Bool.random() ? "1" : "0")
            binary.fontName = "Courier"
            binary.fontSize = 20
            binary.fontColor = .green
            binary.position = mid
            binary.alpha = 0.5
            binary.name = "pathBinary"
            addChild(binary)
        }
    }

    func createBase() {
        guard let lastPoint = pathPoints.last else { return }

        baseNode = SKNode()
        baseNode.position = lastPoint

        let core = SKShapeNode(circleOfRadius: 40)
        core.fillColor = .darkGray
        core.strokeColor = .green
        core.lineWidth = 3
        core.glowWidth = 5
        baseNode.addChild(core)

        let label = SKLabelNode(text: "BASE")
        label.fontName = "Courier-Bold"
        label.fontSize = 16
        label.fontColor = .green
        label.position.y = -8
        baseNode.addChild(label)

        let shield = SKShapeNode(circleOfRadius: 50)
        shield.strokeColor = .cyan
        shield.lineWidth = 2
        shield.alpha = 0.3

        let pulseAction = SKAction.sequence([
            SKAction.fadeAlpha(to: 0.6, duration: 1),
            SKAction.fadeAlpha(to: 0.3, duration: 1)
        ])
        shield.run(SKAction.repeatForever(pulseAction))
        baseNode.addChild(shield)

        addChild(baseNode)
    }

    func createTowerSpots() {
        let width = size.width
        let height = size.height

        for x in stride(from: 100, through: width - 100, by: 80) {
            for y in stride(from: 150, through: height - 150, by: 80) {
                let point = CGPoint(x: x, y: y)
                if !isPointOnPath(point) {
                    createTowerSpot(at: point)
                }
            }
        }
    }

    func isPointOnPath(_ point: CGPoint, tolerance: CGFloat = 50) -> Bool {
        guard pathPoints.count > 1 else { return false }

        for i in 0..<pathPoints.count - 1 {
            let start = pathPoints[i]
            let end = pathPoints[i + 1]
            if distanceToSegment(point: point, segmentStart: start, segmentEnd: end) < tolerance {
                return true
            }
        }
        return false
    }

    func distanceToSegment(point: CGPoint, segmentStart: CGPoint, segmentEnd: CGPoint) -> CGFloat {
        let dx = segmentEnd.x - segmentStart.x
        let dy = segmentEnd.y - segmentStart.y
        let lengthSquared = dx * dx + dy * dy

        if lengthSquared == 0 {
            return distance(point, segmentStart)
        }

        var t = ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) / lengthSquared
        t = max(0, min(1, t))

        let projectionX = segmentStart.x + t * dx
        let projectionY = segmentStart.y + t * dy

        return distance(point, CGPoint(x: projectionX, y: projectionY))
    }

    func distance(_ a: CGPoint, _ b: CGPoint) -> CGFloat {
        return sqrt(pow(a.x - b.x, 2) + pow(a.y - b.y, 2))
    }

    func createTowerSpot(at position: CGPoint) {
        let spot = SKShapeNode(circleOfRadius: 30)
        spot.fillColor = .clear
        spot.strokeColor = .gray
        spot.lineWidth = 1
        spot.alpha = 0.3
        spot.position = position
        spot.name = "towerSpot"
        spot.userData = ["position": position]
        addChild(spot)
    }

    func placeTower(type: TowerType, at position: CGPoint) {
        // Check if there's already a tower here
        if let existingTower = towers.first(where: { distance($0.position, position) < 10 }) {
            // Try to upgrade existing tower
            if existingTower.canUpgrade() {
                if existingTower.upgrade() {
                    gameState?.addMoney(-existingTower.upgradeCost())
                    createUpgradeEffect(at: position)
                }
            }
            return
        }

        // Place new tower
        let tower = Tower(type: type, position: position)
        tower.setup(in: self)
        towers.append(tower)
        createBinaryBurst(at: position)
    }

    func createUpgradeEffect(at position: CGPoint) {
        // Create upgrade visual effect
        let burst = SKShapeNode(circleOfRadius: 20)
        burst.strokeColor = .yellow
        burst.lineWidth = 3
        burst.position = position
        addChild(burst)

        let expand = SKAction.scale(to: 2, duration: 0.3)
        let fade = SKAction.fadeOut(withDuration: 0.3)
        let remove = SKAction.removeFromParent()
        burst.run(SKAction.sequence([SKAction.group([expand, fade]), remove]))

        // Floating "UPGRADE!" text
        let label = SKLabelNode(text: "UPGRADE!")
        label.fontName = "Courier-Bold"
        label.fontSize = 14
        label.fontColor = .yellow
        label.position = position
        addChild(label)

        let moveUp = SKAction.moveBy(x: 0, y: 50, duration: 1)
        let fadeOut = SKAction.fadeOut(withDuration: 1)
        label.run(SKAction.sequence([SKAction.group([moveUp, fadeOut]), remove]))

        // Particles
        for _ in 0..<12 {
            let particle = SKLabelNode(text: "+")
            particle.fontName = "Courier"
            particle.fontSize = 20
            particle.fontColor = .yellow
            particle.position = position
            addChild(particle)

            let angle = CGFloat.random(in: 0..<(2 * .pi))
            let distance = CGFloat.random(in: 30...80)
            let move = SKAction.moveBy(x: cos(angle) * distance, y: sin(angle) * distance, duration: 0.5)
            let particleFade = SKAction.fadeOut(withDuration: 0.5)
            particle.run(SKAction.sequence([SKAction.group([move, particleFade]), remove]))
        }
    }

    func createBinaryBurst(at position: CGPoint) {
        for _ in 0..<8 {
            let binary = SKLabelNode(text: Bool.random() ? "1" : "0")
            binary.fontName = "Courier"
            binary.fontSize = CGFloat.random(in: 10...20)
            binary.fontColor = .green
            binary.position = position
            binary.alpha = 1.0
            addChild(binary)

            let angle = CGFloat.random(in: 0...(2 * .pi))
            let distance = CGFloat.random(in: 50...150)
            let endPosition = CGPoint(
                x: position.x + cos(angle) * distance,
                y: position.y + sin(angle) * distance
            )

            let move = SKAction.move(to: endPosition, duration: 1.0)
            let fade = SKAction.fadeOut(withDuration: 1.0)
            let scale = SKAction.scale(to: 0.5, duration: 1.0)
            let group = SKAction.group([move, fade, scale])
            let remove = SKAction.removeFromParent()

            binary.run(SKAction.sequence([group, remove]))
        }
    }

    func generateWaveComposition(level: Int) -> [EnemyType] {
        var composition: [EnemyType] = []
        // Significantly more mobs per level - longer waves
        let baseCount = 8 + (level * 4)

        switch level {
        case 1:
            // Level 1: Just packets
            composition = Array(repeating: .packet, count: baseCount)

        case 2:
            // Level 2: Packets + some viruses
            let virusCount = baseCount / 4
            composition = Array(repeating: .packet, count: baseCount - virusCount)
            composition += Array(repeating: .virus, count: virusCount)

        case 3:
            // Level 3: Mix of packets, viruses, and worms
            let wormCount = baseCount / 5
            let virusCount = baseCount / 4
            composition = Array(repeating: .packet, count: baseCount - virusCount - wormCount)
            composition += Array(repeating: .virus, count: virusCount)
            composition += Array(repeating: .worm, count: wormCount)

        case 4:
            // Level 4: Introduce Trojans
            let trojanCount = 2
            let wormCount = baseCount / 5
            let virusCount = baseCount / 4
            composition = Array(repeating: .packet, count: baseCount - virusCount - wormCount - trojanCount)
            composition += Array(repeating: .virus, count: virusCount)
            composition += Array(repeating: .worm, count: wormCount)
            composition += Array(repeating: .trojan, count: trojanCount)

        case 5:
            // Level 5: Everything including Ransomware boss
            composition = Array(repeating: .packet, count: baseCount / 3)
            composition += Array(repeating: .virus, count: baseCount / 4)
            composition += Array(repeating: .worm, count: baseCount / 5)
            composition += Array(repeating: .trojan, count: 3)
            composition += [.ransomware]

        case 6:
            // Level 6: More intense mix, mini boss wave
            composition = Array(repeating: .packet, count: baseCount / 4)
            composition += Array(repeating: .virus, count: baseCount / 3)
            composition += Array(repeating: .worm, count: baseCount / 4)
            composition += Array(repeating: .trojan, count: 4)

        case 7:
            // Level 7: Virus swarm
            composition = Array(repeating: .packet, count: baseCount / 5)
            composition += Array(repeating: .virus, count: baseCount / 2)
            composition += Array(repeating: .worm, count: baseCount / 5)
            composition += Array(repeating: .trojan, count: 3)

        case 8:
            // Level 8: Worm-heavy with double trouble
            composition = Array(repeating: .packet, count: baseCount / 5)
            composition += Array(repeating: .virus, count: baseCount / 4)
            composition += Array(repeating: .worm, count: baseCount / 3)
            composition += Array(repeating: .trojan, count: 5)

        case 9:
            // Level 9: Trojan invasion
            composition = Array(repeating: .packet, count: baseCount / 6)
            composition += Array(repeating: .virus, count: baseCount / 4)
            composition += Array(repeating: .worm, count: baseCount / 5)
            composition += Array(repeating: .trojan, count: 6)

        case 10:
            // Level 10: Second Ransomware boss
            composition = Array(repeating: .packet, count: baseCount / 4)
            composition += Array(repeating: .virus, count: baseCount / 4)
            composition += Array(repeating: .worm, count: baseCount / 5)
            composition += Array(repeating: .trojan, count: 4)
            composition += [.ransomware]

        case 11:
            // Level 11: Dense mixed assault
            composition = Array(repeating: .packet, count: baseCount / 4)
            composition += Array(repeating: .virus, count: baseCount / 3)
            composition += Array(repeating: .worm, count: baseCount / 4)
            composition += Array(repeating: .trojan, count: 5)

        case 12:
            // Level 12: Speed demons (virus heavy)
            composition = Array(repeating: .virus, count: baseCount / 2)
            composition += Array(repeating: .worm, count: baseCount / 3)
            composition += Array(repeating: .trojan, count: 6)

        case 13:
            // Level 13: Elite wave with more bosses
            composition = Array(repeating: .packet, count: baseCount / 5)
            composition += Array(repeating: .virus, count: baseCount / 4)
            composition += Array(repeating: .worm, count: baseCount / 4)
            composition += Array(repeating: .trojan, count: 5)
            composition += [.ransomware]

        case 14:
            // Level 14: The gauntlet
            composition = Array(repeating: .packet, count: baseCount / 5)
            composition += Array(repeating: .virus, count: baseCount / 3)
            composition += Array(repeating: .worm, count: baseCount / 3)
            composition += Array(repeating: .trojan, count: 7)

        case 15:
            // Level 15: FINAL BOSS - Multiple ransomware + everything
            composition = Array(repeating: .packet, count: baseCount / 6)
            composition += Array(repeating: .virus, count: baseCount / 4)
            composition += Array(repeating: .worm, count: baseCount / 4)
            composition += Array(repeating: .trojan, count: 5)
            composition += [.ransomware, .ransomware] // Double boss!

        default:
            composition = Array(repeating: .packet, count: baseCount)
        }

        return composition.shuffled()
    }

    func startWave() {
        guard let level = gameState?.currentLevel else { return }

        // Generate wave composition
        waveComposition = generateWaveComposition(level: level)
        mobsToSpawn = waveComposition.count
        mobsSpawned = 0
        currentSpawnIndex = 0
        waveCleared = false

        // Spawn rate gets faster at higher levels but caps at 0.4 seconds
        let spawnInterval = max(0.4, 1.8 - Double(level) * 0.1)

        spawnTimer = Timer.scheduledTimer(withTimeInterval: spawnInterval, repeats: true) { [weak self] _ in
            self?.spawnMob()
        }
    }

    func spawnMob() {
        guard currentSpawnIndex < waveComposition.count else {
            spawnTimer?.invalidate()
            spawnTimer = nil
            return
        }

        guard let startPoint = pathPoints.first else { return }

        let enemyType = waveComposition[currentSpawnIndex]
        let mob = Mob(level: gameState?.currentLevel ?? 1, path: pathPoints, type: enemyType)
        mob.position = startPoint
        mob.setup(in: self)
        mobs.append(mob)
        addChild(mob)

        currentSpawnIndex += 1
        mobsSpawned += 1

        // Show incoming warning for special enemies
        if enemyType == .trojan || enemyType == .ransomware {
            showEnemyWarning(type: enemyType)
        }
    }

    func showEnemyWarning(type: EnemyType) {
        let warningText: String
        let color: UIColor

        switch type {
        case .trojan:
            warningText = "⚠️ TROJAN DETECTED"
            color = .yellow
        case .ransomware:
            warningText = "🚨 RANSOMWARE BOSS INCOMING 🚨"
            color = .purple
        default:
            return
        }

        let label = SKLabelNode(text: warningText)
        label.fontName = "Courier-Bold"
        label.fontSize = 20
        label.fontColor = color
        label.position = CGPoint(x: size.width / 2, y: size.height - 50)
        label.alpha = 0
        addChild(label)

        let fadeIn = SKAction.fadeIn(withDuration: 0.3)
        let wait = SKAction.wait(forDuration: 2)
        let fadeOut = SKAction.fadeOut(withDuration: 0.3)
        let remove = SKAction.removeFromParent()

        label.run(SKAction.sequence([fadeIn, wait, fadeOut, remove]))
    }

    func setupMatrixEffect() {
        matrixRainTimer = Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { [weak self] _ in
            self?.createMatrixRainDrop()
        }
    }

    func createMatrixRainDrop() {
        let digit = SKLabelNode(text: Bool.random() ? "1" : "0")
        digit.fontName = "Courier"
        digit.fontSize = CGFloat.random(in: 12...24)
        digit.fontColor = .green
        digit.alpha = CGFloat.random(in: 0.1...0.4)
        digit.position = CGPoint(
            x: CGFloat.random(in: 0...size.width),
            y: size.height + 50
        )
        digit.zPosition = -1
        addChild(digit)

        let fallDuration = Double.random(in: 3...6)
        let move = SKAction.moveTo(y: -50, duration: fallDuration)
        let fade = SKAction.fadeOut(withDuration: 1)
        let group = SKAction.group([move, fade])
        let remove = SKAction.removeFromParent()

        digit.run(SKAction.sequence([group, remove]))
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        let location = touch.location(in: self)

        let nodes = self.nodes(at: location)
        for node in nodes {
            if node.name == "towerSpot" {
                if let position = node.userData?["position"] as? CGPoint {
                    gameState?.placeTower(at: position)
                    return
                }
            }

            // Check if clicked on a tower to show upgrade info
            if let tower = towers.first(where: { distance($0.position, location) < 40 }) {
                showTowerInfo(tower)
                return
            }
        }
    }

    func showTowerInfo(_ tower: Tower) {
        // Remove any existing info panels
        childNode(withName: "towerInfo")?.removeFromParent()

        let panel = SKNode()
        panel.name = "towerInfo"
        panel.position = CGPoint(x: tower.position.x, y: tower.position.y - 60)

        // Background
        let bg = SKShapeNode(rectOf: CGSize(width: 150, height: 60), cornerRadius: 8)
        bg.fillColor = .darkGray
        bg.strokeColor = .cyan
        bg.lineWidth = 2
        panel.addChild(bg)

        // Tower name and level
        let nameLabel = SKLabelNode(text: "\(tower.towerType.rawValue) Lv.\(tower.upgradeLevel)")
        nameLabel.fontName = "Courier-Bold"
        nameLabel.fontSize = 12
        nameLabel.fontColor = .white
        nameLabel.position.y = 15
        panel.addChild(nameLabel)

        // Upgrade info
        if tower.canUpgrade() {
            let cost = tower.upgradeCost()
            let upgradeLabel = SKLabelNode(text: "Upgrade: $\(cost)")
            upgradeLabel.fontName = "Courier"
            upgradeLabel.fontSize = 10
            upgradeLabel.fontColor = gameState?.money ?? 0 >= cost ? .green : .red
            upgradeLabel.position.y = -5
            panel.addChild(upgradeLabel)
        } else {
            let maxLabel = SKLabelNode(text: "MAX LEVEL")
            maxLabel.fontName = "Courier"
            maxLabel.fontSize = 10
            maxLabel.fontColor = .yellow
            maxLabel.position.y = -5
            panel.addChild(maxLabel)
        }

        // Damage info
        let damageLabel = SKLabelNode(text: "DMG: \(tower.currentDamage)")
        damageLabel.fontName = "Courier"
        damageLabel.fontSize = 10
        damageLabel.fontColor = .cyan
        damageLabel.position.y = -20
        panel.addChild(damageLabel)

        addChild(panel)

        // Auto-remove after 3 seconds
        let wait = SKAction.wait(forDuration: 3)
        let remove = SKAction.removeFromParent()
        panel.run(SKAction.sequence([wait, remove]))
    }

    override func update(_ currentTime: TimeInterval) {
        // Update towers
        for tower in towers {
            tower.update(currentTime: currentTime, mobs: mobs, scene: self)
        }

        // Update mobs
        for mob in mobs {
            mob.update(currentTime: currentTime)

            if mob.reachedEnd {
                let damage = mob.enemyType == .ransomware ? 10 : 1
                gameState?.damageBase(damage)
                mob.removeFromParent()
            }

            if mob.shouldRemove {
                mob.removeFromParent()
            }
        }

        // Clean up dead mobs
        let removedMobs = mobs.filter { $0.shouldRemove || $0.reachedEnd }
        for mob in removedMobs {
            if mob.isDead {
                gameState?.addScore(mob.enemyType.scoreValue)
                gameState?.addMoney(mob.enemyType.reward)
            }
        }
        mobs.removeAll { $0.shouldRemove || $0.reachedEnd }

        // Check wave completion
        if !waveCleared && mobsSpawned >= mobsToSpawn && mobs.isEmpty {
            waveCleared = true
            DispatchQueue.main.asyncAfter(deadline: .now() + 1) { [weak self] in
                self?.gameState?.nextLevel()
                if self?.gameState?.victory == false {
                    self?.setupLevel()
                }
            }
        }

        // Update projectiles
        for projectile in projectiles {
            projectile.update()
        }
        projectiles.removeAll { $0.shouldRemove }
    }

    func resetGame() {
        spawnTimer?.invalidate()
        spawnTimer = nil
        matrixRainTimer?.invalidate()
        matrixRainTimer = nil

        removeAllChildren()
        towers.removeAll()
        mobs.removeAll()
        projectiles.removeAll()

        setupLevel()
        setupMatrixEffect()
    }
}
