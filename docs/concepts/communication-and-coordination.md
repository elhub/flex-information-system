# Communication and Coordination

Many interactions in the Flexibility Information System (FIS) require parties to
share information, clarify context, and coordinate actions around the resources
they manage. While most of this information is structured and stored directly in
resource fields, some collaboration relies on unstructured communication.

Such communication can happen internally within a party, where several users work
together on the same resource, or across parties, when coordination between
organisations is needed.

This section describes the mechanisms that support this type of interaction in FIS.
For now, it introduces comments, that is one way to attach free-text information
to a resource. In the future, this section may expand to include additional
communication channels that support coordination across processes.

## Comments

Comments allow parties to attach free-text information to a resource. They are used
to capture context, clarify decisions, raise questions, and support coordination
around processes where structured fields are not sufficient.

Comments keep communication tied to the relevant resource instead of being scattered
across emails or other external channels. This helps users maintain a shared understanding
and provides historical traceability.

### Purpose of comments

Business processes often involve multiple parties, and each party may have several
users working on the same resource. Comments help both individuals within
a party and different parties share information that does not fit into structured
fields, such as:

* explanations

* clarifications and questions

* updates

* agreements or conclusions

* internal notes and reminders

By storing this information alongside the resource, comments preserve context,
improve continuity, and support transparent collaboration.

### Visibility

Comments can be visible to:

* `same_party` - only users belonging to the party that created the comment

* `any_involved_party` - all parties involved in the referenced resource

These two levels support two distinct needs:

* **Internal collaboration** within a party (drafts, reminders, private assessments,
or other coordination between individuals in the same organisation)

* **Cross-party communication** when coordination between different parties is needed

### How comments work

Each comment is linked to a specific resource and follows its access rules. When
a comment is created or updated, notifications are available to the relevant parties.
Over time, comments create a traceable communication history
that helps parties understand past decisions and coordinate future actions.

#### Current comment resources

* [CU suspension comment](../resources/controllable_unit_suspension_comment.md)

* [SP product application comment](../resources/service_provider_product_application_comment.md)

* [SP product suspension comment](../resources/service_provider_product_suspension_comment.md)

* [SPG grid suspension comment](../resources/service_providing_group_grid_suspension_comment.md)

* [SPG product suspension comment](../resources/service_providing_group_product_suspension_comment.md)
