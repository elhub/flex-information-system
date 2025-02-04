@file:Suppress("PackageName")

package NpmProject

import jetbrains.buildServer.configs.kotlin.Project
import no.elhub.devxp.build.configuration.pipeline.ElhubProject
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.context.ElhubProjectContext
import no.elhub.devxp.build.configuration.pipeline.jobs.npmVerify


private typealias TeamcityProject = Project

object Project : TeamcityProject({
    id("FlexInformationSystemFrontend")
    val group = Group.DEVXP
    name = "flex-information-system-frontend"
    val projectContext = ElhubProjectContext(group, name)

    ElhubProject(projectContext, this).apply {
        pipeline {
            sequential {
                npmVerify {
                    workingDir = "frontend"
                    sonarScanSettings = {
                        sonarProjectSources = "frontend"
                        sonarProjectTests = null // no tests in npm
                    }
                }
            }
        }
    }
})
