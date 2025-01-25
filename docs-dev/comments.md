# Comments

This document gathers design notes on the comment resources we have in the
system.

## Record time and history

_Audit fields_ are needed because we need to track the time when comments are
added as well as who added them, so that we can properly display them as a kind
of conversation between the parties involved.

_History_ is enabled because the users can make mistakes while adding comments.
They need to be able to correct themselves or even remove some of their
comments.

## Deleting comments

In order not to break the logic of a conversation, conceptually "deleting"
comments can be done by _emptying_ their content. In that way, we can keep track
of the place where deleted comments used to be.

## Factorisation of the work

This section explains how we implement several comment resources without
duplicating work.

### Code generation

As comment resources are very similar (they only differ by their name and the
name of the field linking comments to the resources they belong to), we use code
generation, so that we do not have to copy-paste a lot of SQL code. This
generation is done by the use of _templating_.

### Common UI components

In the UI, comments are represented as a subresource of each concerned resource.
In order to build common components that can be reused across several comment
resources, these subresource components just have to get access to the name of
the main resource and perform the queries/actions on the API with this name.

## Future ideas

Our design starts from a simple solution, but makes room for possible future
changes:

- _rich text content_, for instance HTML with the
  [`RichTextInput` component](https://marmelab.com/react-admin/RichTextInput.html)
  already available in React Admin (requires some server-side validation);
- _nested comments_ so that the comment section looks more like a list of
  _threads_ of discussion, through the addition of a `parent_id` field linking a
  comment to its parent (the depth level can be limited);
- an _attachment_ resource inspired from comments, where the content is a _file_
  instead of just text (NB: file ID, actual data would be stored externally).
