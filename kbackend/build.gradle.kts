plugins {
    alias(libs.plugins.elhub.gradle.plugin)
    alias(libs.plugins.ktor.plugin)
    alias(libs.plugins.kotlin.plugin.serialization)
    alias(libs.plugins.ksp.plugin)
    alias(libs.plugins.gradle.docker)
}

buildscript {
    dependencies {
        classpath(libs.database.liquibase.core)
    }
}

dependencies {
    // Ktor
    implementation(libs.bundles.ktor)
    implementation(libs.bundles.functional.programming)
    // Koin
    implementation(libs.bundles.dependency.injection)
    ksp(libs.di.koin.ksp.compiler)
    // Serialization
    implementation(libs.bundles.serialization)
    // Database
    implementation(libs.bundles.database)
    // Documentation
    implementation(libs.bundles.documentation)
    // Observability
    implementation(libs.bundles.logging)
    implementation(libs.bundles.monitoring)
    implementation(libs.elhub.jsonapi)
    // Unit Testing
    testImplementation(testFixtures(libs.elhub.jsonapi))
    testImplementation(libs.database.postgresql)
    testImplementation(libs.test.mockk)
    testImplementation(libs.bundles.functional.programming)
    testImplementation(libs.test.ktor.server.test.host)
    testImplementation(libs.test.kotest.runner.junit5)
    testImplementation(libs.test.kotest.assertions.arrow)
    testImplementation(libs.test.kotest.assertions.core)
    testImplementation(libs.test.kotest.assertions.json)
    testImplementation(libs.test.kotest.extensions.koin)
    testImplementation(libs.test.koin.test)
    testImplementation(libs.test.testcontainers)
    testImplementation(libs.test.testcontainers.postgres)
    testImplementation(libs.test.mybatis)
}

kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-parameters")
    }
}

ksp {
    arg("KOIN_CONFIG_CHECK", "true")
    arg("KOIN_DEFAULT_MODULE", "true")
}

application {
    mainClass.set("io.ktor.server.netty.EngineMain")
    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

// Security Fixes
configurations.all {
    resolutionStrategy {
        eachDependency {
            if (requested.group == "io.netty" && requested.version == "4.2.7.Final") {
                useVersion("4.2.9.Final")
                because(
                    "Override Netty version to 4.2.9.Final to address CVE-2025-67735. Should be fixed in future Ktor versions after 3.3.3.",
                )
            }
        }
    }
}
