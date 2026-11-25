// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "Glimmer",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [.library(name: "Glimmer", targets: ["Glimmer"])],
    targets: [
        .target(name: "Glimmer", resources: [.process("Fonts")]),
        .testTarget(name: "GlimmerTests", dependencies: ["Glimmer"]),
    ]
)
