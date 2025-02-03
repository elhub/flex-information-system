import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.project
import jetbrains.buildServer.configs.kotlin.sequential
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.AgentScope
import no.elhub.devxp.build.configuration.pipeline.constants.JavaVersion.VERSION_17
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.extensions.subProject
import no.elhub.devxp.build.configuration.pipeline.jobs.Job
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.customJob
import no.elhub.devxp.build.configuration.pipeline.jobs.goVerify
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings
import no.elhub.devxp.build.configuration.pipeline.utils.Stage

import no.elhub.devxp.build.configuration.pipeline.ElhubProject
import no.elhub.devxp.build.configuration.pipeline.ElhubProject.Companion.elhubProject
import no.elhub.devxp.build.configuration.pipeline.constants.DeployEnvironment
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.extensions.subSystem

//elhubProject(Group.DEVXP, "flex-transformation-system") {
//
//    pipeline {
//        sequential {
//
//            val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
//                sonarProjectSources = "backend"
//                workingDir = "backend"
//            }
//
//            val npmSonarSettings: SonarScanSettings.Builder.() -> Unit = {
//                sonarProjectSources = "frontend"
//                workingDir = "frontend"
//            }
//
////            goSonarScan(goSonarSettings)
////            npmSonarScan(npmSonarSettings)
//
//            customJob(AgentScope.LinuxAgentContext) {
//                id("GoSonarScan")
//                name = "GoSonarScan"
//                steps {
//                    val settings = SonarScanSettings.Builder(projectContext, ProjectType.GO, goSonarSettings).build()
//                    val sonarScanJob = SonarScan(settings)
//                    addJob(sonarScanJob)
////                    goSonarScan(goSonarSettings)
//                }
//            }
//
//            //npmSonarScan(npmSonarSettings)
//
//        }
//    }
//}

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

fun ElhubProject.customProject(projectName: String) {
//    pipeline { TODO this pipeline works, but only for backend
//        sequential {
//            val sonarScanSettings = SonarScanSettings.Builder(projectContext, ProjectType.GO, settings).build()
//            val sonarScan = SonarScan(sonarScanSettings)
//            addJob(sonarScan)
//        }
//    }

    val sp = subProject(projectName)
    sp.sequential {
        pipeline {
            val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                sonarProjectSources = "backend"
                workingDir = "backend"
            }

            goSonarScan(goSonarSettings)
        }
    }

//    subProject(projectName).subProject {
//        id("CustomProject")
//        name = "SonarScan"
//        pipeline {
//            sequential {
//                goSonarScan(settings)
//            }
//        }
//    }

}

elhubProject(Group.DEVXP, "flex-transformation-system") {
    val npmSonarSettings: SonarScanSettings.Builder.() -> Unit = {
        sonarProjectSources = "frontend"
        workingDir = "frontend"
    }

//    customProject("flex-transformation-system-backend")

    subProject("flex-transformation-system-backend").sequential {
        pipeline {
            val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                sonarProjectSources = "backend"
                workingDir = "backend"
            }
            goSonarScan(goSonarSettings)
        }
    }
//    customProject("frontend", npmSonarSettings)
//    customProject("frontend")
}

// For documentation on how to write these pipelines, see
// https://docs.elhub.cloud/enabling-systems/devxp/devxp-build-configuration/user-guide.html
