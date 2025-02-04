@file:Suppress("PackageName")

package NpmProject

import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.Project
import no.elhub.devxp.build.configuration.pipeline.ElhubProject
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.context.ElhubProjectContext
import no.elhub.devxp.build.configuration.pipeline.jobs.Job
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings
import no.elhub.devxp.build.configuration.pipeline.utils.Stage


private typealias TeamcityProject = Project

object Project : TeamcityProject({
    id("FlexInformationSystemFrontend")
    val group = Group.DEVXP
    name = "flex-information-system-frontend"
    val projectContext = ElhubProjectContext(group, name)

    ElhubProject(projectContext, this).apply {
        pipeline {
            sequential {
                val npmSonarSettings: SonarScanSettings.Builder.() -> Unit = {
                    sonarProjectSources = "frontend"
                    workingDir = "frontend"
                    sonarProjectTests = null // no tests in npm
                }

                npmSonarScan(npmSonarSettings)
            }
        }
    }
})

internal fun Pipeline.npmSonarScan(block: SonarScanSettings.Builder.() -> Unit = {}): BuildType {
    val settings = SonarScanSettings.Builder(projectContext, ProjectType.NPM, block).build()
    val sonarScan = SonarScan(settings)
    return sonarScan(sonarScan,"Sandbox_FlexInformationSystemSandbox_SonarScan_npm", "Sonar Scan NPM Frontend")
}
//
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
