import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.buildSteps.script
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
        parallel {
            val goSonarSettings : SonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.GO) {
                workingDir = "backend"
            }.build()

            val npmSonarSettings : SonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.NPM) {
                workingDir = "frontend"
            }.build()

            customJob(
                AgentScope.LinuxAgentContext,
                buildArtifactRules = emptyList(),
                outputArtifactRules = emptyList(),
                block = {
                    id("GoBuild")
                    this.name = "Backend Build"
                    steps {
                        addJob(SonarScan(goSonarSettings))
                    }
                }
            )

            customJob(
                AgentScope.LinuxAgentContext,
                buildArtifactRules = emptyList(),
                outputArtifactRules = emptyList(),
                block = {
                    id("NpmBuild")
                    this.name = "Frontend Build"
                    steps {
                        addJob(SonarScan(npmSonarSettings))
                    }
                }
            )

        }
    }
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
