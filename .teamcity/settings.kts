import jetbrains.buildServer.configs.kotlin.ArtifactRule
import jetbrains.buildServer.configs.kotlin.buildSteps.gradle
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.constants.KubeCluster
import no.elhub.devxp.build.configuration.pipeline.dsl.elhubProject
import no.elhub.devxp.build.configuration.pipeline.extensions.triggerOnVcsChange
import no.elhub.devxp.build.configuration.pipeline.jobs.common.Source
import no.elhub.devxp.build.configuration.pipeline.jobs.dockerBuild
import no.elhub.devxp.build.configuration.pipeline.jobs.gitOps
import no.elhub.devxp.build.configuration.pipeline.jobs.gradleJib
import no.elhub.devxp.build.configuration.pipeline.jobs.gradleVerify
import no.elhub.devxp.build.configuration.pipeline.jobs.liquiBuild
import no.elhub.devxp.build.configuration.pipeline.jobs.npmVerify

elhubProject(Group.FLEX, "flex-information-system") {

    val gitOpsRepo = "https://github.com/elhub/flex"
    val imageRepoPrefix = "flex/information-system"
    val imageRepoFrontend = "$imageRepoPrefix-frontend"
    val imageRepoKotlinBackend = "$imageRepoPrefix-kbackend"

    pipeline {
        parallel {
            sequential {
                npmVerify {
                    workingDir = "frontend"
                    // vite-plugin-checker v1 requires Node ^22.22.0 || >=24.11.0 (devxp default is 22.20)
                    dockerImage = "docker.jfrog.elhub.cloud/node:24"
                    sonarScanSettings = {
                        sonarProjectSources = "frontend/src"
                        workingDir = "frontend"
                        sonarProjectTests = null // no tests in frontend
                    }
                    buildArtifactRules = listOf(ArtifactRule.include("frontend/dist", "frontend/dist.zip"))
                    outputArtifactRules = listOf(ArtifactRule.include("frontend/dist.zip!**", "frontend/dist"))
                    dependencyTrackProjectName = "flex-information-system-frontend"
                }

                dockerBuild {
                    registrySettings = {
                        repository = imageRepoFrontend
                    }
                    contextDirectory = "frontend"
                    dockerBuildNameSuffix = "Frontend"
                    dockerfileName = "./frontend/Dockerfile"
                    source = Source.CommitSha
                }

                parallel {
                    gitOps {
                        buildNameSuffix = "frontend test"
                        clusters = setOf(KubeCluster.TEST9)
                        gitOpsRepository = gitOpsRepo
                        projectName = "fis-frontend"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = true
                    }.triggerOnVcsChange { triggerRules = "+:frontend/**" }

                    gitOps {
                        buildNameSuffix = "frontend prod1"
                        clusters = setOf(KubeCluster.PROD1)
                        gitOpsRepository = gitOpsRepo
                        projectName = "fis-frontend"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = false
                    }.triggerOnVcsChange { triggerRules = "+:frontend/**" }
                }
            }
            sequential {
                gradleVerify {
                    workingDir = "kbackend"
                    analyzeDependencies = false
                    dependencyTrackProjectName = "flex-information-system-kbackend"
                }.buildType.apply {
                    // runs after the unit tests, against Postgres and PostgREST containers
                    steps {
                        gradle {
                            name = "API tests"
                            tasks = "apiTest"
                            workingDir = "kbackend"
                            useGradleWrapper = true
                        }
                    }
                }.triggerOnVcsChange {
                    triggerRules = """
                        -:*
                        +:kbackend/**
                        +:db/**
                    """.trimIndent()
                }

                // the migrations are executed as part of the kbackend deployment, so both images
                // must exist before it starts
                parallel {
                    gradleJib {
                        workingDir = "kbackend"
                        source = Source.CommitSha
                        registrySettings = {
                            repository = imageRepoKotlinBackend
                        }
                    }

                    // the image is tagged with a "liquibase-" prefix, so it can share the repository
                    liquiBuild {
                        registrySettings = {
                            repository = imageRepoKotlinBackend
                        }
                        changelogDirectory = "./db"
                        liquibaseEntrypoint = "changelog.yml"
                        source = Source.CommitSha
                    }
                }

                parallel {
                    gitOps {
                        buildNameSuffix = "kbackend test"
                        clusters = setOf(KubeCluster.TEST9)
                        gitOpsRepository = gitOpsRepo
                        projectName = "flex-kbackend"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = true
                    }.triggerOnVcsChange {
                        // skip changes that only touch the jobs code, and test-only changes
                        // keep DB because liquibase is linked to the kbackend app
                        triggerRules = """
                            -:*
                            +:kbackend/**
                            +:db/**
                            -:kbackend/src/main/kotlin/no/elhub/flex/jobs/**
                            -:kbackend/src/test/**
                            -:kbackend/src/apiTest/**
                        """.trimIndent()
                    }

                    gitOps {
                        buildNameSuffix = "kbackend jobs test"
                        clusters = setOf(KubeCluster.TEST9)
                        gitOpsRepository = gitOpsRepo
                        projectName = "flex-scheduled-jobs-kbackend"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = true
                    }.triggerOnVcsChange {
                        // whitelist: only the jobs code, the shared code, logback and mail
                        // templates, build files, the entry point
                        // remove the event worker as it has its own deployment
                        triggerRules = """
                            -:*
                            +:kbackend/build.gradle.kts
                            +:kbackend/settings.gradle.kts
                            +:kbackend/gradle.properties
                            +:kbackend/gradle/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/shared/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/Application.kt
                            +:kbackend/src/main/resources/logback.xml
                            +:kbackend/src/main/resources/mail/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/jobs/**
                            -:kbackend/src/main/kotlin/no/elhub/flex/jobs/eventworker/**
                        """.trimIndent()
                    }

                    gitOps {
                        buildNameSuffix = "event-worker test"
                        clusters = setOf(KubeCluster.TEST9)
                        gitOpsRepository = gitOpsRepo
                        projectName = "flex-event-worker"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = true
                    }.triggerOnVcsChange {
                        // whitelist: only the event worker code, the shared code, logback, build
                        // files, the entry point
                        // (code under /jobs for other jobs is not included)
                        triggerRules = """
                            -:*
                            +:kbackend/build.gradle.kts
                            +:kbackend/settings.gradle.kts
                            +:kbackend/gradle.properties
                            +:kbackend/gradle/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/shared/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/Application.kt
                            +:kbackend/src/main/resources/logback.xml
                            +:kbackend/src/main/kotlin/no/elhub/flex/jobs/*
                            +:kbackend/src/main/kotlin/no/elhub/flex/jobs/eventworker/**
                        """.trimIndent()
                    }

                    gitOps {
                        buildNameSuffix = "kbackend prod1"
                        clusters = setOf(KubeCluster.PROD1)
                        gitOpsRepository = gitOpsRepo
                        projectName = "flex-kbackend"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = false
                    }.triggerOnVcsChange {
                        // skip changes that only touch the jobs code, and test-only changes
                        // keep DB because liquibase is linked to the kbackend app
                        triggerRules = """
                            -:*
                            +:kbackend/**
                            +:db/**
                            -:kbackend/src/main/kotlin/no/elhub/flex/jobs/**
                            -:kbackend/src/test/**
                            -:kbackend/src/apiTest/**
                        """.trimIndent()
                    }

                    gitOps {
                        buildNameSuffix = "kbackend jobs prod1"
                        clusters = setOf(KubeCluster.PROD1)
                        gitOpsRepository = gitOpsRepo
                        projectName = "flex-scheduled-jobs-kbackend"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = false
                    }.triggerOnVcsChange {
                        // whitelist: only the jobs code, the shared code, logback and mail
                        // templates, build files, the entry point
                        // remove the event worker as it has its own deployment
                        triggerRules = """
                            -:*
                            +:kbackend/build.gradle.kts
                            +:kbackend/settings.gradle.kts
                            +:kbackend/gradle.properties
                            +:kbackend/gradle/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/shared/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/Application.kt
                            +:kbackend/src/main/resources/logback.xml
                            +:kbackend/src/main/resources/mail/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/jobs/**
                            -:kbackend/src/main/kotlin/no/elhub/flex/jobs/eventworker/**
                        """.trimIndent()
                    }

                    gitOps {
                        buildNameSuffix = "event-worker prod1"
                        clusters = setOf(KubeCluster.PROD1)
                        gitOpsRepository = gitOpsRepo
                        projectName = "flex-event-worker"
                        source = Source.CommitSha
                        isMonoRepo = true
                        autoMerge = false
                    }.triggerOnVcsChange {
                        // whitelist: only the event worker code, the shared code, logback, build
                        // files, the entry point
                        // (code under /jobs for other jobs is not included)
                        triggerRules = """
                            -:*
                            +:kbackend/build.gradle.kts
                            +:kbackend/settings.gradle.kts
                            +:kbackend/gradle.properties
                            +:kbackend/gradle/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/shared/**
                            +:kbackend/src/main/kotlin/no/elhub/flex/Application.kt
                            +:kbackend/src/main/resources/logback.xml
                            +:kbackend/src/main/kotlin/no/elhub/flex/jobs/*
                            +:kbackend/src/main/kotlin/no/elhub/flex/jobs/eventworker/**
                        """.trimIndent()
                    }
                }
            }
        }
    }
}
