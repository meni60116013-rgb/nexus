plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }

android { namespace = "com.vcore.nexus"; compileSdk = 35
    defaultConfig { applicationId = "com.vcore.nexus"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "1.0.0-cloud-mirror" }
}

dependencies { implementation("androidx.appcompat:appcompat:1.7.0"); implementation("androidx.activity:activity-ktx:1.10.1") }
