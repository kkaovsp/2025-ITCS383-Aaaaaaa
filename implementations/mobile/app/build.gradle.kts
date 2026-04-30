plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("jacoco")
}

android {
    namespace = "com.kkaovsp.boothorganizer"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.kkaovsp.boothorganizer"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    jvmToolchain(17)
}

dependencies {
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("androidx.core:core:1.13.1")
    testImplementation("junit:junit:4.13.2")
}

jacoco {
    toolVersion = "0.8.11"
}

tasks.register<JacocoReport>("jacocoTestReport") {
    dependsOn("testDebugUnitTest")

    reports {
        xml.required.set(true)
        xml.outputLocation.set(layout.buildDirectory.file("reports/jacoco/jacocoTestReport/jacocoTestReport.xml"))
        html.required.set(false)
    }

    val bd = layout.buildDirectory.get().asFile

    sourceDirectories.setFrom(files("$projectDir/src/main/java/com/kkaovsp/boothorganizer/util"))

    classDirectories.setFrom(
        fileTree("$bd/tmp/kotlin-classes/debug/com/kkaovsp/boothorganizer/util")
    )

    executionData.setFrom(
        fileTree("$bd") {
            include(
                "jacoco/testDebugUnitTest.exec",
                "test-results/testDebugUnitTest/**/*.exec",
                "outputs/code-coverage/connected coverage/coverage.ec",
                "reports/jacoco/jacocoTestReport/*.exec"
            )
        }
    )
}
