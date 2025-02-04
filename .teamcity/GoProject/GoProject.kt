@file:Suppress("PackageName")

package GoProject

import jetbrains.buildServer.configs.kotlin.BuildType
import no.elhub.devxp.build.configuration.pipeline.ElhubProject
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.context.ElhubProjectContext
import no.elhub.devxp.build.configuration.pipeline.jobs.Job
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings
import no.elhub.devxp.build.configuration.pipeline.utils.Stage
import jetbrains.buildServer.configs.kotlin.Project as TeamcityProject

object Project : TeamcityProject({
    id("FlexInformationSystemBackend")
    val group = Group.DEVXP
    name = "flex-information-system-backend"
    val projectContext = ElhubProjectContext(group, name)

    ElhubProject(projectContext, this).apply {
        pipeline {
            sequential {
                val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                    sonarProjectSources = "backend"
                    workingDir = "backend"
                }

                goSonarScan(goSonarSettings) // triggers backend, but cannot run sonar scan on frontend due to id conflict (SonarScan)
            }
        }
    }
})

fun Pipeline.goSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType {
    val settings = SonarScanSettings.Builder(projectContext, ProjectType.GO, block).build()
    return sonarScan(SonarScan(settings), "Sandbox_FlexInformationSystemSandbox_SonarScan_go", "Sonar Scan GO Backend")
}

internal fun Pipeline.sonarScan(sonarScan: SonarScan, buildTypeId: String, buildTypeName: String): BuildType {
    return addJob(sonarScan, buildTypeId, buildTypeName)
}

internal fun Pipeline.addJob(job: Job, buildTypeId: String, buildTypeName: String): BuildType {
    val buildType = job.build(vcsSettings, teamcityProject)

    stages = stages.plus(Stage.Single(buildType))

    // after adding the built job we can add the validation requirements
    validations = validations.plus(job.validations)

    return buildType.apply {
        id(buildTypeId)
        name = buildTypeName
    }
}
