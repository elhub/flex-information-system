import no.elhub.devxp.build.configuration.pipeline.ElhubProject.Companion.elhubProject
import no.elhub.devxp.build.configuration.pipeline.Pipeline
import no.elhub.devxp.build.configuration.pipeline.constants.AgentScope
import no.elhub.devxp.build.configuration.pipeline.constants.Group
import no.elhub.devxp.build.configuration.pipeline.constants.ProjectType
import no.elhub.devxp.build.configuration.pipeline.jobs.SonarScan
import no.elhub.devxp.build.configuration.pipeline.jobs.customJob
import no.elhub.devxp.build.configuration.pipeline.jobs.settings.SonarScanSettings

elhubProject(Group.DEVXP, "your-project-name-here") {

    pipeline {
        parallel {
            val goSonarSettings : SonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.GO) {
                workingDir = "backend"
            }.build()

            val npmSonarSettings : SonarScanSettings = SonarScanSettings.Builder(this.projectContext, ProjectType.NPM) {
                workingDir = "frontend"
            }.build()

            customJob(AgentScope.LinuxAgentContext) {
                id("GoSonarScan")
                this.name = "Backend Sonar Scan"

                steps {
                    SonarScan(goSonarSettings).build(vcsSettings, teamcityProject)
                }
           }

            customJob(AgentScope.LinuxAgentContext) {
                id("NpmSonarScan")
                this.name = "Frontend Sonar Scan"

                steps {
                    SonarScan(npmSonarSettings).build(vcsSettings, teamcityProject)
                }
            }
        }
    }
}

// For documentation on how to write these pipelines, see
// https://docs.elhub.cloud/enabling-systems/devxp/devxp-build-configuration/user-guide.html
