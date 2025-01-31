import jetbrains.buildServer.configs.kotlin.BuildType
import no.elhub.devxp.build.configuration.pipeline.ElhubProject.Companion.elhubProject
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.AgentScope
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.jobs.Job
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.ansibleSonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.customJob
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings
import no.elhub.devxp.build.configuration.pipeline.utils.Stage

elhubProject(Group.DEVXP, "flex-transformation-system") {

    pipeline {
        parallel {

            goSonarScan()
            npmSonarScan()

//            val goSonarSettings : SonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.GO) {
//                workingDir = "backend"
//            }.build()
//
//            val npmSonarSettings : SonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.NPM) {
//                workingDir = "frontend"
//            }.build()
//
//            customJob(AgentScope.LinuxAgentContext) {
//                id("GoSonarScan")
//                this.name = "Backend Sonar Scan"
//
//                steps {
//                    val sonarScan = SonarScan(goSonarSettings)
//                    sonarScan.configure { }
//                    addJob(sonarScan)
//                }
//           }
//
//            customJob(AgentScope.LinuxAgentContext) {
//                id("NpmSonarScan")
//                this.name = "Frontend Sonar Scan"
//
//                steps {
//                    val sonarScan = SonarScan(npmSonarSettings)
//                    sonarScan.configure { }
//                    addJob(sonarScan)
//                }
//            }
        }
    }
}

fun Pipeline.npmSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType =
    sonarScan(SonarScanSettings.Builder(projectContext, ProjectType.NPM, block).build())

fun Pipeline.goSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType =
    sonarScan(SonarScanSettings.Builder(projectContext, ProjectType.GO, block).build())

internal fun Pipeline.sonarScan(settings: SonarScanSettings): BuildType =
    addJob(SonarScan(settings = settings))

fun Pipeline.addJob(job: Job): BuildType {
    val buildType = job.build(vcsSettings, teamcityProject)

    stages = stages.plus(Stage.Single(buildType))

    // after adding the built job we can add the validation requirements
    validations = validations.plus(job.validations)

    return buildType
}

// For documentation on how to write these pipelines, see
// https://docs.elhub.cloud/enabling-systems/devxp/devxp-build-configuration/user-guide.html
