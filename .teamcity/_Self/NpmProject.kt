@file:Suppress("PackageName")

package _Self

import jetbrains.buildServer.configs.kotlin.ArtifactRule
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.dsl.elhubProject
import no.elhub.devxp.build.configuration.pipeline.jobs.npmVerify


object NpmProject : TeamcityProject({
    name = "flex-information-system"
    elhubProject(Group.FLEX, name, this) {
        pipeline {
            npmVerify {
                workingDir = "frontend"
                buildArtifactRules = listOf(ArtifactRule.include("frontend/dist", "frontend/dist.zip"))
                outputArtifactRules = listOf(ArtifactRule.include("frontend/dist.zip!**", "frontend/dist"))

                sonarScanSettings = {
                    sonarProjectSources = "frontend/src"
                    workingDir = "frontend"
                    sonarProjectTests = null // no tests in frontend
                }
                disableLint = true
                analyzeDependencies = false // will be solved by TDX-587
            }
        }
    }
})
