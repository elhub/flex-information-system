import jinja2
# This is a helper "module" to hide some of the weird "environment" stuff
# that Jinja2 does.


loader = jinja2.FileSystemLoader(searchpath="./local/scripts/templates/")
env = jinja2.Environment(
    loader=loader,
    keep_trailing_newline=True,
)


def template(resource, template, outfile):
    """
    Templates to a file using the resource object
    """
    # Load the template
    template = env.get_template(template)
    with open(outfile, "w") as f:
        # Render the template with the resource data
        rendered = template.render(resource=resource["id"], data=resource)
        # Write the rendered content to the file
        f.write(rendered)
