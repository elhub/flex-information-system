@file:Suppress("PackageName")

package _Self

import no.elhub.devxp.build.configuration.pipeline.ElhubProject
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.context.ElhubProjectContext
import jetbrains.buildServer.configs.kotlin.Project as TeamcityProject

object Project : TeamcityProject({
    val group = Group.FLEX
    val name = "flex-information-system"
    val projectContext = ElhubProjectContext(group, name)

    ElhubProject(projectContext, this).apply {
        subProject(GoProject.Project)
        subProject(NpmProject.Project)
    }
})
