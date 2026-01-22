import jetbrains.buildServer.configs.kotlin.ArtifactRule
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.constants.KubeCluster
import no.elhub.devxp.build.configuration.pipeline.dsl.elhubProject
import no.elhub.devxp.build.configuration.pipeline.extensions.triggerOnVcsChange
import no.elhub.devxp.build.configuration.pipeline.jobs.dockerBuild
import no.elhub.devxp.build.configuration.pipeline.jobs.gitOps
import no.elhub.devxp.build.configuration.pipeline.jobs.liquiBuild
import no.elhub.devxp.build.configuration.pipeline.jobs.makeVerify
import no.elhub.devxp.build.configuration.pipeline.jobs.npmVerify
import no.elhub.devxp.build.configuration.pipeline.jobs.common.Source

elhubProject(Group.FLEX, "flex-information-system") {

    val gitOpsRepo = "https://github.com/elhub/flex"
    val imageRepoPrefix = "flex/information-system"
    val imageRepoFrontend = "$imageRepoPrefix-frontend"
    val imageRepoBackend = "$imageRepoPrefix-backend"


    pipeline {
        parallel {
            sequential {
                makeVerify {
                    workingDir = "backend"
                    sonarScanSettings = {
                        sonarProjectSources = "backend"
                        workingDir = "backend"
                    }
                }

                dockerBuild {
                    registrySettings = {
                        repository = imageRepoBackend
                    }
                    contextDirectory = "backend"
                    dockerBuildNameSuffix = "Backend"
                    dockerfileName = "./backend/Dockerfile"
                    source = Source.CommitSha
                }

                liquiBuild {
                    registrySettings = {
                        repository = imageRepoBackend
                    }
                    changelogDirectory = "./db"
                    liquibaseEntrypoint = "changelog.yml"
                    source = Source.CommitSha
                }

                gitOps {
                    buildNameSuffix = "Backend"
                    clusters = setOf(KubeCluster.TEST9)
                    gitOpsRepository = gitOpsRepo
                    projectName = "fis-backend"
                    source = Source.CommitSha
                    isMonoRepo = true
                }.triggerOnVcsChange { triggerRules = """
                            -:*
                            +:backend/**
                            +:db/**
                    """.trimIndent()
                }
            }
            sequential {
                npmVerify {
                    workingDir = "frontend"
                    sonarScanSettings = {
                        sonarProjectSources = "frontend/src"
                        workingDir = "frontend"
                        sonarProjectTests = null // no tests in frontend
                    }
                    buildArtifactRules = listOf(ArtifactRule.include("frontend/dist", "frontend/dist.zip"))
                    outputArtifactRules = listOf(ArtifactRule.include("frontend/dist.zip!**", "frontend/dist"))
                    analyzeDependencies = false // will be solved by TDX-587
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

                gitOps {
                    buildNameSuffix = "Frontend"
                    clusters = setOf(KubeCluster.TEST9)
                    gitOpsRepository = gitOpsRepo
                    projectName = "fis-frontend"
                    source = Source.CommitSha
                    isMonoRepo = true
                }.triggerOnVcsChange { triggerRules = "+:frontend/**" }
            }
        }
    }
}
