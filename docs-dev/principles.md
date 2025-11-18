# Principles

The following is a list of principles that we follow while developing the
Flexibility Information System.

## Write as little code as possible

Code is a liability and maintenance is a drag. Adding code means (possibly)
slowing down the rate of change. We should only build the minimal solution we
need to learn what we need to learn.

## Build for change, not stability

In the current phase of the project, the main focus should be on change. We need
to iterate on ideas. The way we set up our technical work should mainly focus on
facilitating discussion and change.

To reflect this, regarding contributions to the version controlled repository,
we use [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow)
with short-lived branches (ideally merged in the 24h).

## Generate good documentation for discussion

[Manifesto for Agile Software Development](https://agilemanifesto.org/) says:

> [...] we have come to value:
>
> * Working software over comprehensive documentation

Since we are doing research, the opposite is true. Thorough
documentation of the current state of the system is paramount for us to be able
to discuss, learn and adapt the implementation together - technical and
non-technical people together.

## Keep it simple

We always look for ways to make things simpler and avoid incidental
complexity. Our goal is to make the system as simple as possible, but no
simpler. Our system means:

* models
* code
* deployments
* operations
* requirements

We acknowledge that `Simple != Easy` and that it takes effort.
But we should take our time to seek simplification.
[Experiment, Simplify, Ship](https://go.dev/blog/experiment)

> The definition of genius is taking the complex and making it simple.
> -- Albert Einstein
>
> Clear is better than clever
> -- Rob Pike

For instance, in the database, we start with simple fields to model the data,
like free text, integer IDs, or booleans, and we complexify later _if needed_.

## ... and boring

We choose well understood technologies and
[embrace boredom](https://mcfunley.com/choose-boring-technology) when we
engineer our solutions.

## Dogfooding

We
[eat our own dog food](https://en.wikipedia.org/wiki/Eating_your_own_dog_food).
The purpose is to test and ensure quality of the stuff we produce. This is not
really relevant on a "system" level, but we can do it on parts. Examples are:

* using the frontend we build to interact with the API
* generating (test) code from OpenAPI documents
* using the same test-data packages as our external testers

## Strive for low effort operations and maintenance

We refuse to be slowed down by having to spend time on operating our systems.

One way to do that is SaaS over PaaS over IaaS.
Another way to do that is limit the number of moving parts, or introduce
breaking changes gradually. This corresponds to, for instance to replace an
already existing feature in the database, adding new behaviour without deleting
the existing behaviour. It allows experimenting and possibly easily rolling
back to the previous version if needed.

## Automate & generate

We want to avoid having to perform the same tasks on repeat. If we see a pattern
appearing in the development (be it for configuration files, code,
specifications, tests, _etc_.), we try to automate it away to gain time for
tasks bringing new value to our project.

Most of the automation in this project consists in _generating_ parts of the
files through the use of _scripts_ located in the `local/scripts` directory,
or _factoring_ code in common functions, libraries, components, used across
several files in the rest of the project.

## Open source

We want to use open source software as much as possible. This allows us to get
going fast and have a lot of flexibility. We must also be prepared to contribute
back to the open source community, e.g. with bug reports, documentation and
code.

## ..but we are not afraid of lock-in

Being locked into a technology or with a vendor is not a problem in itself. When
we choose a technology, we should use all its features, even tho that means we
cannot move away from it easily. We should not try to generalize to be able to
switch database technology or cloud.

## Testing, testing, testing

Automated validation of our code and setup is paramount to be able to have a
rapid pace of change. We should architect and design our systems to be testable
and choose technologies that can be tested, both locally and in CI.

The ability to control/fiddle with time in our tests is one of the most critical
features of our testing rig.

## Separate storage and compute

This principle could have other names, like "stateless services".
Separating storage and compute is a way to:

* make our systems more scalable
* simplify deployments and operations

## Version controlled plain text

We strive to use plain text for all documentation, configuration and (obviously)
code. [The Unreasonable Effectiveness Of Plain Text](https://www.youtube.com/watch?v=WgV6M1LyfNY).

Plain text allows us to lint, format, test, search, find-and-replace, diff,
compile ++++.

## Diagrams

The preferred way we create diagrams is to use a plain text diagram tool, either
PlantUML or graphviz/dot (we use dot via PlantUML).

If we need to use a graphical drawing tool, we use
[Draw.io](https://app.diagrams.net/) or [excalidraw](https://excalidraw.com/)
(typically via extenstion in VSCode). Files should be saved as
[.drawio.png](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
or
[.excalidraw.png](https://marketplace.visualstudio.com/items?itemName=pomdtr.excalidraw-editor)
and committed to the repository.
