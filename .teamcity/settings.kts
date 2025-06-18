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

elhubProject(Group.FLEX, "flex-information-system") {

    val gitOpsRepo = "https://github.com/elhub/flex"
    val imageRepo = "elhub/flex-information-system"

    pipeline {
        sequential {
            makeVerify {
                workingDir = "backend"
                sonarScanSettings = {
                    sonarProjectSources = "backend"
                    workingDir = "backend"
                }
            }

            dockerBuild {
                dockerBuildNameSuffix = "backend"
                dockerfileName = "path_to_dockerfile"
            }

            liquiBuild {
                registrySettings = {
                    repository = imageRepo
                }
                changelogDirectory = "path_to_changelog_directory"
            }

            gitOps {
                clusters = setOf(KubeCluster.TEST11) // TODO: Change this to relevant cluster
                gitOpsRepository = gitOpsRepo
            }.triggerOnVcsChange { triggerRules = "+:backend/**" }

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
                    dockerBuildNameSuffix = "frontend"
                    dockerfileName = "path_to_dockerfile"
                }

                gitOps {
                    clusters = setOf(KubeCluster.TEST13) // TODO: Change this to relevant cluster
                    gitOpsRepository = gitOpsRepo
                }.triggerOnVcsChange { triggerRules = "+:frontend/**" }
            }
        }
    }
}
