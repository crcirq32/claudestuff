import SwiftUI
import SpriteKit

struct ContentView: View {
    @StateObject private var gameState = GameState()

    var body: some View {
        ZStack {
            // Game Scene
            GameSceneView(gameState: gameState)
                .edgesIgnoringSafeArea(.all)

            // UI Overlay
            GameUI(gameState: gameState)
        }
    }
}

struct GameSceneView: UIViewRepresentable {
    @ObservedObject var gameState: GameState

    func makeUIView(context: Context) -> SKView {
        let view = SKView()
        view.backgroundColor = .black
        view.ignoresSiblingOrder = true

        let scene = GameScene(size: UIScreen.main.bounds.size)
        scene.scaleMode = .resizeFill
        scene.gameState = gameState
        view.presentScene(scene)

        return view
    }

    func updateUIView(_ uiView: SKView, context: Context) {
        // Update handled by game state
    }
}

struct GameUI: View {
    @ObservedObject var gameState: GameState

    var body: some View {
        VStack {
            // Top HUD
            HStack {
                // Health
                HStack {
                    Image(systemName: "heart.fill")
                        .foregroundColor(.green)
                    Text("Base HP: \(gameState.baseHealth)/200")
                        .font(.system(.body, design: .monospaced))
                        .foregroundColor(.green)
                }
                .padding()
                .background(Color.black.opacity(0.8))
                .cornerRadius(10)

                Spacer()

                // Level, Score, and Money
                VStack(alignment: .trailing) {
                    Text("Level \(gameState.currentLevel)/15")
                        .font(.system(.title3, design: .monospaced))
                        .foregroundColor(.cyan)
                    Text("Score: \(gameState.score)")
                        .font(.system(.body, design: .monospaced))
                        .foregroundColor(.green)
                    Text("$\(gameState.money)")
                        .font(.system(.body, design: .monospaced))
                        .foregroundColor(.yellow)
                }
                .padding()
                .background(Color.black.opacity(0.8))
                .cornerRadius(10)
            }
            .padding(.horizontal)

            Spacer()

            // Tower Selection
            if gameState.showTowerMenu {
                TowerSelectionView(gameState: gameState)
            }

            // Game Over / Victory Screen
            if gameState.gameOver || gameState.victory {
                GameEndView(gameState: gameState)
            }

            Spacer()

            // Bottom Controls
            HStack(spacing: 20) {
                Button(action: { gameState.showTowerMenu.toggle() }) {
                    VStack {
                        Image(systemName: "plus.circle.fill")
                            .font(.system(size: 40))
                        Text("Build")
                            .font(.system(.caption, design: .monospaced))
                    }
                    .foregroundColor(.cyan)
                }

                Spacer()

                Button(action: { gameState.startLevel() }) {
                    VStack {
                        Image(systemName: "play.fill")
                            .font(.system(size: 40))
                        Text("Start Wave")
                            .font(.system(.caption, design: .monospaced))
                    }
                    .foregroundColor(gameState.waveActive ? .gray : .green)
                }
                .disabled(gameState.waveActive)
            }
            .padding()
            .background(Color.black.opacity(0.8))
        }
    }
}

struct TowerSelectionView: View {
    @ObservedObject var gameState: GameState

    var body: some View {
        HStack(spacing: 15) {
            TowerButton(
                name: "CSRF",
                icon: "burst.fill",
                color: .orange,
                cost: 50,
                description: "Self-destruct",
                action: {
                    gameState.selectedTower = .csrf
                    gameState.showTowerMenu = false
                }
            )

            TowerButton(
                name: "Brute Force",
                icon: "key.fill",
                color: .red,
                cost: 75,
                description: "Turns mobs",
                action: {
                    gameState.selectedTower = .bruteForce
                    gameState.showTowerMenu = false
                }
            )

            TowerButton(
                name: "Pineapple",
                icon: "wifi",
                color: .purple,
                cost: 100,
                description: "Pushes back",
                action: {
                    gameState.selectedTower = .pineapple
                    gameState.showTowerMenu = false
                }
            )
        }
        .padding()
        .background(Color.black.opacity(0.9))
        .cornerRadius(15)
    }
}

struct TowerButton: View {
    let name: String
    let icon: String
    let color: Color
    let cost: Int
    let description: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack {
                Image(systemName: icon)
                    .font(.system(size: 30))
                    .foregroundColor(color)
                Text(name)
                    .font(.system(.caption, design: .monospaced))
                    .foregroundColor(.white)
                Text("$\(cost)")
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundColor(.green)
                Text(description)
                    .font(.system(.caption2, design: .monospaced))
                    .foregroundColor(.gray)
                    .multilineTextAlignment(.center)
            }
            .frame(width: 100)
            .padding()
            .background(Color.gray.opacity(0.3))
            .cornerRadius(10)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(color, lineWidth: 2)
            )
        }
    }
}

struct GameEndView: View {
    @ObservedObject var gameState: GameState

    var body: some View {
        ZStack {
            Color.black.opacity(0.9)
                .edgesIgnoringSafeArea(.all)

            VStack(spacing: 30) {
                if gameState.victory {
                    Text("SYSTEM SECURED")
                        .font(.system(.largeTitle, design: .monospaced))
                        .foregroundColor(.green)
                    Text("All threats eliminated!")
                        .font(.system(.title2, design: .monospaced))
                        .foregroundColor(.cyan)
                } else {
                    Text("SYSTEM BREACHED")
                        .font(.system(.largeTitle, design: .monospaced))
                        .foregroundColor(.red)
                    Text("Base health depleted")
                        .font(.system(.title2, design: .monospaced))
                        .foregroundColor(.orange)
                }

                Text("Final Score: \(gameState.score)")
                    .font(.system(.title, design: .monospaced))
                    .foregroundColor(.green)

                Button(action: { gameState.resetGame() }) {
                    Text("REBOOT SYSTEM")
                        .font(.system(.title2, design: .monospaced))
                        .foregroundColor(.black)
                        .padding()
                        .background(Color.green)
                        .cornerRadius(10)
                }
            }
        }
    }
}
