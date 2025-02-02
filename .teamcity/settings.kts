import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.triggers.vcs
import no.elhub.devxp.build.configuration.pipeline.ElhubProject.Companion.elhubProject
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.AgentScope
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.jobs.Job
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.customJob
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings
import no.elhub.devxp.build.configuration.pipeline.utils.Stage

elhubProject(Group.DEVXP, "flex-transformation-system") {

    pipeline {
        sequential {

            val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                sonarProjectSources = "backend"
                workingDir = "backend"
            }

            val goSonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.GO, goSonarSettings).build()

            /* val npmSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                sonarProjectSources = "frontend"
                workingDir = "frontend"
            }

            val npmSonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.NPM, npmSonarSettings).build() */

            customJob(AgentScope.LinuxAgentContext) {
                id("GoSonarScan")
                this.name = "Backend Build"
                steps {
                    val buildType = sonarScan(goSonarScanSettings)
                    buildType.apply {
                        triggers {
                            vcs {
                                branchFilter = """
                                    -:*
                                    +:testing-branch
                                """.trimIndent()
                            }
                        }
                    }
                }
           }

            /* customJob(AgentScope.LinuxAgentContext) {
                id("NpmSonarScan")
                this.name = "Frontend Build"
                steps {
                    val buildType = sonarScan(npmSonarScanSettings)
                    buildType.apply {
                        triggers {
                            vcs {
                                branchFilter = """
                                    -:*
                                    +:testing-branch
                                """.trimIndent()
                            }
                        }
                    }
                }
            } */
        }
    }
}

fun Pipeline.sonarScan(settings: SonarScanSettings): BuildType {
    return addJob(SonarScan(settings))
}

fun Pipeline.addJob(job: Job): BuildType {
    val buildType = job.build(vcsSettings, teamcityProject)

    stages = stages.plus(Stage.Single(buildType))

    // after adding the built job we can add the validation requirements
    validations = validations.plus(job.validations)

    return buildType
}

// For documentation on how to write these pipelines, see
// https://docs.elhub.cloud/enabling-systems/devxp/devxp-build-configuration/user-guide.html
