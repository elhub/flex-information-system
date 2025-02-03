import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.sequential
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.jobs.Job
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings
import no.elhub.devxp.build.configuration.pipeline.utils.Stage

import no.elhub.devxp.build.configuration.pipeline.ElhubProject
import no.elhub.devxp.build.configuration.pipeline.ElhubProject.Companion.elhubProject
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.extensions.subProject
import no.elhub.devxp.build.configuration.pipeline.jobs.subsystemAutoRelease

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

fun ElhubProject.customSubProject(projectName: String) {
//    pipeline { TODO this pipeline works, but only for backend
//        sequential {
//            val sonarScanSettings = SonarScanSettings.Builder(projectContext, ProjectType.GO, settings).build()
//            val sonarScan = SonarScan(sonarScanSettings)
//            addJob(sonarScan)
//        }
//    }

    val subProject = subProject(projectName)
    subProject.subProject {
        id("SonarScan2")
        name = "SonarScan2"
        pipeline {
            sequential {
                val jobSettings: SonarScanSettings.Builder.() -> Unit = {
                    sonarProjectSources = projectName
                    workingDir = projectName
                }
                goSonarScan(jobSettings)
            }
        }
    }

}

elhubProject(Group.DEVXP, "flex-transformation-system", withUiDisabled = false) {
    customSubProject("backend")
//    customSubProject("frontend")
}

// For documentation on how to write these pipelines, see
// https://docs.elhub.cloud/enabling-systems/devxp/devxp-build-configuration/user-guide.html
