plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.vcore.masterfactory"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.vcore.masterfactory"
        minSdk = 26
        targetSdk = 35
        versionCode = 100
        versionName = "1.0.0"
    }
}
