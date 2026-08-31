plugins {
    kotlin("jvm") version "1.9.24"
}

repositories { mavenCentral() }

dependencies {
    testImplementation("junit:junit:4.13.2")
}

tasks.test { useJUnit() }
