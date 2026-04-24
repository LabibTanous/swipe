// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "VerdictApp",
    platforms: [.iOS(.v17)],
    dependencies: [
        .package(
            url: "https://github.com/supabase/supabase-swift.git",
            from: "2.0.0"
        ),
    ],
    targets: [
        .target(
            name: "VerdictApp",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
            ],
            path: "VerdictApp"
        ),
    ]
)
