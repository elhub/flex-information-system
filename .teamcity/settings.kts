import jetbrains.buildServer.configs.kotlin.ArtifactRule
import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.triggers.finishBuildTrigger
import jetbrains.buildServer.configs.kotlin.ui.id
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

            val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                sonarProjectSources = "backend"
                workingDir = "backend"
            }

            /*val npmSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                sonarProjectSources = "frontend"
                workingDir = "frontend"
            } */

            goSonarScan(goSonarSettings)

            customJob(AgentScope.LinuxAgentContext,
                buildArtifactRules = listOf(ArtifactRule.include("backend/*", "build.zip")),
                outputArtifactRules = listOf(ArtifactRule.include("build.zip!**", "backend"))) {
                id("GoSonarScan")
                name = "GoSonarScan"
                steps {
                    goSonarScan(goSonarSettings)
                }
            }

            //npmSonarScan(npmSonarSettings)

        }
    }
}

internal fun Pipeline.goSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType {
    return sonarScan(SonarScanSettings.Builder(projectContext, ProjectType.GO, block).build())
}

internal fun Pipeline.sonarScan(settings: SonarScanSettings): BuildType {
    val buildType = SonarScan(settings)
    return addJob(buildType)
}

internal fun Pipeline.addJob(job: Job): BuildType {
    val buildType = job.build(vcsSettings, teamcityProject)

    stages = stages.plus(Stage.Single(buildType))

    // after adding the built job we can add the validation requirements
    validations = validations.plus(job.validations)

    return buildType
}

// For documentation on how to write these pipelines, see
// https://docs.elhub.cloud/enabling-systems/devxp/devxp-build-configuration/user-guide.html
