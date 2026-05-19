import { Form, useNotify } from "ra-core";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormContext } from "react-hook-form";
import { apiURL, API_VERSION } from "../../httpConfig";
import { FormContainer, Heading, Button } from "../../components/ui";
import { TextInput } from "../../components/EDS-ra/inputs";

const LookupToolbar = () => {
  const navigate = useNavigate();
  const { getValues } = useFormContext();
  const notify = useNotify();

  const {
    state: { party_id },
  } = useLocation();

  const lookup = async () => {
    const body: any = {};
    const values = getValues();

    // do not put undefined/null into the request body
    for (const key in values) {
      if (values[key]) {
        body[key] = values[key];
      }
    }

    const response = await fetch(apiURL + "/entity/lookup", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Api-Version": API_VERSION,
      }),
      body: JSON.stringify(body),
    });
    const lookupResult = await response.json();

    if (!response.ok) {
      notify(lookupResult.message, { type: "error" });
    } else {
      // navigate to the create party membership page with all information
      navigate(`/party/${party_id}/membership/create`, {
        state: {
          party_id: party_id,
          entity_id: lookupResult?.entity_id,
          // tell the party membership input page not to try to read the name
          // of the entity: since it is looked up, we have no idea whether
          // the party doing the lookup has permission to see its details
          showTechnicalEntityID: true,
        },
      });
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <Button type="button" variant="primary" onClick={lookup}>
        Lookup
      </Button>
      <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
        Cancel
      </Button>
    </div>
  );
};

export const EntityLookupInput = () => (
  <Form defaultValues={{ type: "person" }}>
    <FormContainer>
      <Heading level={3} size="medium">
        Lookup an entity
      </Heading>
      <div className="flex flex-col gap-3">
        <TextInput
          source="business_id"
          overrideLabel="Business ID (Person Number)"
          required
        />
        <TextInput source="name" required />
        <TextInput source="type" readOnly />
      </div>
      <LookupToolbar />
    </FormContainer>
  </Form>
);
