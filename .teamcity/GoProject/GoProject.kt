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
    val group = Group.FLEX
    name = "flex-information-system-backend"
    val projectContext = ElhubProjectContext(group, name)

    ElhubProject(projectContext, this).apply {
        pipeline {
            sequential {
                val goSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                    sonarProjectSources = "backend"
                    workingDir = "backend"
                }

                goSonarScan(goSonarSettings)
            }
        }
    }
})

fun Pipeline.goSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType {
    val settings = SonarScanSettings.Builder(projectContext, ProjectType.GO, block).build()
    return sonarScan(SonarScan(settings))
}

internal fun Pipeline.sonarScan(sonarScan: SonarScan): BuildType {
    return addJob(sonarScan)
}

internal fun Pipeline.addJob(job: Job): BuildType {
    val buildType = job.build(vcsSettings, teamcityProject)

    stages = stages.plus(Stage.Single(buildType))

    validations = validations.plus(job.validations)

    return buildType
}
