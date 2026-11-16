plugins {
    alias(libs.plugins.elhub.gradle.plugin)
    alias(libs.plugins.ktor.plugin)
    alias(libs.plugins.kotlin.plugin.serialization)
    alias(libs.plugins.gradle.docker)
    alias(libs.plugins.koin.compiler)
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
    // Scheduling
    implementation(libs.angus.mail)
    // Object storage (S3)
    implementation(libs.storage.aws.s3)
    // File validation
    implementation(libs.storage.pdfbox)
    // Caching
    implementation(libs.caching.caffeine)
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
    testImplementation(libs.test.testcontainers.s3mock)
    testImplementation(libs.test.mybatis)
    testImplementation(libs.test.wiremock)
}

kotlin {
    compilerOptions {
        freeCompilerArgs.add("-Xcontext-parameters")
    }
}

koinCompiler {
    userLogs = true  // Log component detection
}

application {
    mainClass.set("no.elhub.flex.ApplicationKt")
    val isDevelopment: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDevelopment")
}

configurations.all {
    resolutionStrategy.eachDependency {
        if (requested.group == "io.netty") {
            useVersion("4.2.15.Final")
            because("CVE-2026-48006: RedisArrayAggregator direct-memory leak fixed in 4.2.15.Final")
        }
    }
}

// the API documentation serves the OpenAPI documents, which live outside of src/
tasks.processResources {
    from("data/static") {
        include("openapi.json")
        into("openapi/data")
    }
    from("grid/static") {
        include("openapi.json")
        into("openapi/grid")
    }
    from("auth/static") {
        include("openapi.json")
        into("openapi/auth")
    }
}

// API tests run the data API in-process against real Postgres and PostgREST containers.
// They are kept apart from the unit tests so that `./gradlew test` stays fast; `check` runs both.
val apiTest: SourceSet by sourceSets.creating {
    compileClasspath += sourceSets.main.get().output + sourceSets.test.get().output
    runtimeClasspath += sourceSets.main.get().output + sourceSets.test.get().output
}

configurations["apiTestImplementation"].extendsFrom(configurations.testImplementation.get())
configurations["apiTestRuntimeOnly"].extendsFrom(configurations.testRuntimeOnly.get())

val apiTestTask = tasks.register<Test>("apiTest") {
    description = "Runs the API tests against Postgres and PostgREST containers."
    group = "verification"
    testClassesDirs = apiTest.output.classesDirs
    classpath = apiTest.runtimeClasspath
    useJUnitPlatform()
    shouldRunAfter(tasks.test)
}

tasks.check {
    dependsOn(apiTestTask)
}
