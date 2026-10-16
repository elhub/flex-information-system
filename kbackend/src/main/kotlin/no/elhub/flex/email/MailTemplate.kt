package no.elhub.flex.email

/**
 * An HTML mail template with `{{placeholder}}` variables.
 *
 * Placeholders are replaced in both [subject] and [body]; a placeholder without a
 * matching value fails fast so broken mails are never sent. Values are HTML-escaped
 * in the body, and `{{subject}}` is available in the body.
 */
class MailTemplate(
    private val subject: String,
    private val body: String,
) {
    fun render(to: String, variables: Map<String, String> = emptyMap()): Mail {
        val values = DEFAULT_VARIABLES + variables
        val renderedSubject = inject(subject, values, escape = false)
        return Mail(
            mailTo = to,
            subject = renderedSubject,
            content = inject(body, values + ("subject" to renderedSubject), escape = true),
        )
    }

    private fun inject(text: String, values: Map<String, String>, escape: Boolean): String =
        PLACEHOLDER.replace(text) { match ->
            val key = match.groupValues[1]
            val value = requireNotNull(values[key]) { "Missing value for mail template placeholder '{{$key}}'" }
            if (escape) escapeHtml(value) else value
        }

    private fun escapeHtml(text: String): String =
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")

    companion object {
        private val PLACEHOLDER = Regex("""\{\{\s*([a-zA-Z0-9_]+)\s*}}""")

        private val DEFAULT_VARIABLES = mapOf("systemName" to "Flexibility Information System")

        private fun resource(name: String): String =
            requireNotNull(MailTemplate::class.java.getResourceAsStream("/mail/template/$name")) {
                "Mail template resource '$name' not found"
            }.use { it.readBytes().toString(Charsets.UTF_8) }.replace("\r\n", "\n").trimEnd()

        /** Reminder sent to recipients of active notices. English only for now. */
        val ACTIVE_NOTICES: MailTemplate by lazy {
            MailTemplate(
                subject = "You have notices in the {{systemName}}",
                body = resource("mail-content.html"),
            )
        }
    }
}
