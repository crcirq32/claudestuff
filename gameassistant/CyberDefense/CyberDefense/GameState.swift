import Foundation
import SwiftUI
import Combine

enum TowerType: String, CaseIterable {
    case csrf = "CSRF"
    case bruteForce = "Brute Force"
    case pineapple = "Pineapple"

    var cost: Int {
        switch self {
        case .csrf: return 50
        case .bruteForce: return 75
        case .pineapple: return 100
        }
    }

    var range: CGFloat {
        switch self {
        case .csrf: return 150
        case .bruteForce: return 120
        case .pineapple: return 100
        }
    }

    var damage: Int {
        switch self {
        case .csrf: return 50
        case .bruteForce: return 30
        case .pineapple: return 20
        }
    }

    var fireRate: TimeInterval {
        switch self {
        case .csrf: return 1.5
        case .bruteForce: return 1.0
        case .pineapple: return 0.8
        }
    }
}

class GameState: ObservableObject {
    @Published var baseHealth: Int = 200
    @Published var score: Int = 0
    @Published var currentLevel: Int = 1
    @Published var waveActive: Bool = false
    @Published var gameOver: Bool = false
    @Published var victory: Bool = false
    @Published var showTowerMenu: Bool = false
    @Published var selectedTower: TowerType?
    @Published var money: Int = 300

    var onPlaceTower: ((TowerType, CGPoint) -> Void)?
    var onStartWave: (() -> Void)?
    var onReset: (() -> Void)?

    func startLevel() {
        guard !waveActive && !gameOver && !victory else { return }
        waveActive = true
        onStartWave?()
    }

    func damageBase(_ amount: Int) {
        baseHealth -= amount
        if baseHealth <= 0 {
            baseHealth = 0
            gameOver = true
            waveActive = false
        }
    }

    func addScore(_ points: Int) {
        score += points
    }

    func addMoney(_ amount: Int) {
        money += amount
    }

    func canAfford(_ towerType: TowerType) -> Bool {
        return money >= towerType.cost
    }

    func purchaseTower(_ towerType: TowerType) -> Bool {
        guard canAfford(towerType) else { return false }
        money -= towerType.cost
        return true
    }

    func nextLevel() {
        currentLevel += 1
        if currentLevel > 15 {
            victory = true
            waveActive = false
        } else {
            waveActive = false
        }
    }

    func resetGame() {
        baseHealth = 200
        score = 0
        currentLevel = 1
        waveActive = false
        gameOver = false
        victory = false
        money = 300
        showTowerMenu = false
        selectedTower = nil
        onReset?()
    }

    func placeTower(at position: CGPoint) {
        guard let towerType = selectedTower, purchaseTower(towerType) else { return }
        onPlaceTower?(towerType, position)
        selectedTower = nil
        showTowerMenu = false
    }
}
