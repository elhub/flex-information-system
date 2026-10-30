package no.elhub.flex.jobs.sendnoticemail

data class MailConfig(
    val host: String,
    val port: Int = 587,
    val username: String = "",
    val password: String = "",
    val from: String,
    val startTls: Boolean = true,
    /** When true, mails are logged instead of delivered, and no SMTP settings are needed. */
    val dryRun: Boolean = true,
) {
    companion object {
        /**
         * Reads the config from the `MAIL_*` environment variables, Used in job mode. Missing values are left blank
         * so that only the job that sends mail needs them.
         */
        fun fromEnv(): MailConfig = MailConfig(
            host = System.getenv("MAIL_SMTP_HOST") ?: "",
            port = (System.getenv("MAIL_SMTP_PORT") ?: "587").toInt(),
            username = System.getenv("MAIL_SMTP_USERNAME") ?: "",
            password = System.getenv("MAIL_SMTP_PASSWORD") ?: "",
            from = System.getenv("MAIL_FROM") ?: "",
            startTls = (System.getenv("MAIL_SMTP_STARTTLS") ?: "true").toBooleanStrict(),
            dryRun = (System.getenv("MAIL_DRY_RUN") ?: "true").toBooleanStrict(),
        )
    }
}
