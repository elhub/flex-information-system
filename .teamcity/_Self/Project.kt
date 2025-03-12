@file:Suppress("PackageName")

package _Self

import jetbrains.buildServer.configs.kotlin.Project
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.dsl.elhubProject

typealias TeamcityProject = Project

object Project : TeamcityProject({
    elhubProject(Group.FLEX, "flex-information-system", this) {
        subProject(GoProject)
        subProject(NpmProject)
    }
})
