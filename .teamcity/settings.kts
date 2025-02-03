import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.Project
import jetbrains.buildServer.configs.kotlin.sequential
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.jobs.Job
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings
import no.elhub.devxp.build.configuration.pipeline.utils.Stage

import no.elhub.devxp.build.configuration.pipeline.ElhubProject
import no.elhub.devxp.build.configuration.pipeline.ElhubProject.Companion.elhubProject
import no.elhub.devxp.build.configuration.pipeline.constants.AgentScope
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.extensions.subProject
import no.elhub.devxp.build.configuration.pipeline.jobs.customJob

elhubProject(Group.DEVXP, "flex-information-system") {

    pipeline {
        sequential {

//            val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
//                sonarProjectSources = "backend"
//                workingDir = "backend"
//            }
//
//            val npmSonarSettings: SonarScanSettings.Builder.() -> Unit = {
//                sonarProjectSources = "frontend"
//                workingDir = "frontend"
//            }

//            goSonarScan(goSonarSettings)
//            npmSonarScan(npmSonarSettings)


            customJob(AgentScope.LinuxAgentContext) {
                id("GoSonarScan")
                name = "GoSonarScan"
                steps {
                    val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                        sonarProjectSources = "backend"
                        workingDir = "backend"
                    }

                    val settings = SonarScanSettings.Builder(projectContext, ProjectType.GO, goSonarSettings).build()
                    val sonarScan = SonarScan(settings)

                    val buildType = sonarScan.build(vcsSettings, teamcityProject)

                    stages = stages.plus(Stage.Single(buildType))

                    // after adding the built job we can add the validation requirements
                    validations = validations.plus(sonarScan.validations)

                }
            }


        }
    }
}

fun Pipeline.goSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType {
    val settings = SonarScanSettings.Builder(projectContext, ProjectType.GO, block).build()
    return sonarScan(SonarScan(settings))
}

internal fun Pipeline.npmSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType {
    val settings = SonarScanSettings.Builder(projectContext, ProjectType.NPM, block).build()
    return sonarScan(SonarScan(settings))
}

internal fun Pipeline.sonarScan(sonarScan: SonarScan): BuildType {
    return addJob(sonarScan)
}

internal fun Pipeline.addJob(job: Job): BuildType {
    val buildType = job.build(vcsSettings, teamcityProject)

    stages = stages.plus(Stage.Single(buildType))

    // after adding the built job we can add the validation requirements
    validations = validations.plus(job.validations)

    return buildType
}

//fun ElhubProject.customSubProject(projectName: String) {
////    pipeline { this pipeline works, but only for backend
////        sequential {
////            val sonarScanSettings = SonarScanSettings.Builder(projectContext, ProjectType.GO, settings).build()
////            val sonarScan = SonarScan(sonarScanSettings)
////            addJob(sonarScan)
////        }
////    }
//
//    val subProject = subProject(projectName)
//    subProject.sequential {
//        pipeline {
//            sequential {
//                val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
//                    sonarProjectSources = projectName
//                    workingDir = projectName
//                }
//                val settings = SonarScanSettings.Builder(projectContext, ProjectType.GO, goSonarSettings).build()
//                val sonarScanJob = SonarScan(settings)
//                val buildType = sonarScanJob.build(vcsSettings, subProject)
//                stages = stages.plus(Stage.Single(buildType))
//
//                // after adding the built job we can add the validation requirements
//                validations = validations.plus(sonarScanJob.validations)
//            }
//        }
//    }
//
//}
//
//elhubProject(Group.DEVXP, "flex-information-system") {
//    customSubProject("backend")
////    customSubProject("frontend")
//}

// For documentation on how to write these pipelines, see
// https://docs.elhub.cloud/enabling-systems/devxp/devxp-build-configuration/user-guide.html
