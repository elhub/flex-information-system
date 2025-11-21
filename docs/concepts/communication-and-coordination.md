# Communication and Coordination

Many of the business processes in the flexibility value chain require parties to
share information, clarify context, and coordinate actions around the resources
they manage. Most of this information is structured and stored directly in
resource fields in the Flexibility Information System (FIS). However, some collaboration
relies on unstructured communication. Such communication can be needed both whithin
one party or across several parties.

This section describes the comments function that supports communication and coordination
in FIS.

## Comments

Comments allow parties to attach free-text information to a resource. They are used
to capture context, clarify decisions, raise questions, and support coordination
around processes where the structured fields are not sufficient. This helps users
maintain a shared understanding.

Each comment is linked to a specific resource and follows its access rules. When
a comment is created or updated, notifications are available to the relevant parties.
Over time, comments create a traceable communication history
that helps parties understand past decisions and coordinate future actions.

### Purpose of comments

The purpose of comments is to enable communication within and between parties.
Business processes often involve multiple parties, and each party may have several
users working on the same resource. Comments help share information that does not
fit into structured fields, such as:

* explanations

* clarifications and questions

* updates

* agreements or conclusions

* internal notes and reminders

By storing this information alongside the resource, comments preserve context,
improve continuity, and support transparent collaboration.

### Visibility

Comments can be visible to:

* `same_party` - only users belonging to the party that created the comment.
This supports _internal collaboration_.

* `any_involved_party` - all parties involved in the referenced resource.
This supports _cross-party communication_.

#### Current comment resources

* [CU suspension comment](../resources/controllable_unit_suspension_comment.md)

* [SP product application comment](../resources/service_provider_product_application_comment.md)

* [SP product suspension comment](../resources/service_provider_product_suspension_comment.md)

* [SPG grid suspension comment](../resources/service_providing_group_grid_suspension_comment.md)

* [SPG product suspension comment](../resources/service_providing_group_product_suspension_comment.md)
