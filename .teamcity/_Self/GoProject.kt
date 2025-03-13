@file:Suppress("PackageName")

package _Self

import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.dsl.elhubProject
import no.elhub.devxp.build.configuration.pipeline.jobs.ansibleSonarScan
import jetbrains.buildServer.configs.kotlin.Project as TeamcityProject

object GoProject : TeamcityProject({
    name = "flex-information-system-backend"
    elhubProject(Group.FLEX, name, this) {
        pipeline {
            ansibleSonarScan { // SonarScan settings are identical for ansible and go
                sonarProjectSources = "backend"
                workingDir = "backend"
            }
        }
    }
})
