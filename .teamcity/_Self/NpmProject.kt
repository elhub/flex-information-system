@file:Suppress("PackageName")

package _Self

import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.dsl.elhubProject
import no.elhub.devxp.build.configuration.pipeline.jobs.npmVerify


object NpmProject : TeamcityProject({
    name = "flex-information-system"
    elhubProject(Group.FLEX, name, this) {
        pipeline {
            npmVerify {
                workingDir = "frontend"
                sonarScanSettings = {
                    sonarProjectSources = "frontend"
                    workingDir = "frontend"
                    sonarProjectTests = null // no tests in frontend
                }
            }
        }
    }
})
