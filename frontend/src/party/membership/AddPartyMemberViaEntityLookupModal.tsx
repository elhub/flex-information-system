import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  BodyText,
  Button,
  Chips,
  FormItem,
  FormItemLabel,
  Modal,
  TextField,
} from "../../components/ui";
import { IconSearch, IconPlus } from "@elhub/ds-icons";
import { apiURL, API_VERSION } from "../../httpConfig";
import { createPartyMembership } from "../../generated-client";
import { AuthScope } from "../../generated-client/types.gen";
import { throwOnError } from "../../util";
import { Identifier } from "ra-core";

// ScopesInput
// TODO: improve/move this component when we have support for general scopes
// (this is reimplemented here to avoid z-index issues when mixing RA with EDS)

const ALL_SCOPES: AuthScope[] = [
  "read:data",
  "use:data",
  "use:data:entity:lookup",
  "manage:data",
  "manage:data:party_membership",
  "manage:data:entity_client",
  "read:auth",
  "use:auth",
  "manage:auth",
];

const DEFAULT_SCOPES: AuthScope[] = ["manage:data", "manage:auth"];

const ScopesInput = ({
  value,
  onChange,
  disabled,
}: {
  value: AuthScope[];
  onChange: (scopes: AuthScope[]) => void;
  disabled?: boolean;
}) => {
  const toggle = (scope: AuthScope) => {
    if (disabled) return;
    onChange(
      value.includes(scope)
        ? value.filter((s) => s !== scope)
        : [...value, scope],
    );
  };

  return (
    <FormItem>
      <FormItemLabel>Scopes</FormItemLabel>
      <Chips>
        {ALL_SCOPES.map((scope) => (
          <Chips.Chip
            key={scope}
            onClick={() => toggle(scope)}
            aria-pressed={value.includes(scope)}
            disabled={disabled}
            style={{
              fontWeight: value.includes(scope) ? 600 : undefined,
              opacity: value.includes(scope) ? 1 : 0.5,
            }}
          >
            {scope}
          </Chips.Chip>
        ))}
      </Chips>
    </FormItem>
  );
};

// -----------------------------------------------------------------------------

// the modal is either
//   - starting: entity lookup has to be done
//   - entity_found: entity lookup was successful, now scopes can be chosen
//   - submitting: the member is being added, inputs are disabled
type Phase = "start" | "entity_found" | "submitting";

type Props = {
  partyId: Identifier;
  open: boolean;
  onClose: () => void;
};

// component to be able to perform entity lookup and party membership creation
// to add the found entity to the current party in one flow
export const AddPartyMemberViaEntityLookupModal = ({
  partyId,
  open,
  onClose,
}: Props) => {
  const queryClient = useQueryClient();

  const [phase, setPhase] = useState<Phase>("start");
  const [businessId, setBusinessId] = useState("");
  const [name, setName] = useState("");
  const [entityId, setEntityId] = useState<number | null>(null);
  const [scopes, setScopes] = useState<AuthScope[]>(DEFAULT_SCOPES);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLooking, setIsLooking] = useState(false);

  const reset = () => {
    setPhase("start");
    setBusinessId("");
    setName("");
    setEntityId(null);
    setScopes(DEFAULT_SCOPES);
    setLookupError(null);
    setSubmitError(null);
    setIsLooking(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // action when the user launches entity lookup
  const handleLookup = async () => {
    setLookupError(null);
    setIsLooking(true);

    try {
      const response = await fetch(apiURL + "/entity/lookup", {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          "Api-Version": API_VERSION,
        }),
        body: JSON.stringify({ business_id: businessId, name, type: "person" }),
      });

      const result = await response.json();
      if (!response.ok) {
        setLookupError(
          result.message ??
            "Lookup failed. Please check the information provided.",
        );
      } else {
        // set the entity ID and move to the found phase
        setEntityId(result.entity_id);
        setPhase("entity_found");
      }
    } catch {
      setLookupError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLooking(false);
    }
  };

  // action when the user tries to add the member after lookup
  const handleAdd = async () => {
    if (entityId === null) return;

    setSubmitError(null);
    setPhase("submitting");

    try {
      await createPartyMembership({
        body: {
          party_id: Number(partyId),
          entity_id: entityId,
          scopes: scopes,
        },
      }).then(throwOnError);

      // invalidate the party_membership list so it refreshes
      queryClient.invalidateQueries({ queryKey: ["party_membership"] });
      handleClose();
    } catch (e) {
      setSubmitError(
        e instanceof Error
          ? e.message
          : "Failed to add member. Please try again.",
      );
      setPhase("entity_found");
    }
  };

  const canLookup = businessId.trim().length > 0 && name.trim().length > 0;

  return (
    <Modal open={open} onClose={handleClose} aria-label="Add member via lookup">
      <Modal.Header
        title="Add member via lookup"
        description="Look up an entity by their business ID (personnummer) and name to add them as a member of this party."
      />
      <Modal.Content className="flex flex-col gap-4 min-w-lg">
        {/* lookup form (always visible) */}
        <div className="flex flex-col gap-3">
          <FormItem>
            <FormItemLabel htmlFor="lookup-business-id">
              Business ID (personnummer)
            </FormItemLabel>
            <TextField
              id="lookup-business-id"
              value={businessId}
              onChange={(e) => {
                setBusinessId(e.target.value);
                // reset found state if the user changes inputs
                if (phase === "entity_found") {
                  setPhase("start");
                  setEntityId(null);
                }
              }}
              disabled={phase === "submitting"}
              placeholder="Enter the entity's business ID (personnummer)"
            />
          </FormItem>
          <FormItem>
            <FormItemLabel htmlFor="lookup-name">Name</FormItemLabel>
            <TextField
              id="lookup-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // reset found state if the user changes inputs
                if (phase === "entity_found") {
                  setPhase("start");
                  setEntityId(null);
                }
              }}
              disabled={phase === "submitting"}
              placeholder="Enter the person's full name"
            />
          </FormItem>
          {/* on error after lookup, display it under the lookup form */}
          {lookupError && <Alert variant="error">{lookupError}</Alert>}
          <Button
            icon={IconSearch}
            variant="secondary"
            onClick={handleLookup}
            disabled={!canLookup || isLooking || phase === "submitting"}
          >
            {isLooking ? "Searching…" : "Search"}
          </Button>
        </div>

        {/* confirmation and scopes (visible when entity is found) */}
        {phase === "entity_found" && entityId !== null && (
          <div className="flex flex-col gap-3 border-t pt-4">
            <Alert variant="info">
              <BodyText>
                Entity found (ID: {entityId}). Choose the scopes to grant and
                confirm.
              </BodyText>
            </Alert>
            <ScopesInput value={scopes} onChange={setScopes} disabled={false} />
            {/* on error after submit, display it under the scopes input */}
            {submitError && <Alert variant="error">{submitError}</Alert>}
          </div>
        )}
      </Modal.Content>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={phase === "submitting"}
        >
          Cancel
        </Button>
        <Button
          icon={IconPlus}
          onClick={handleAdd}
          disabled={phase !== "entity_found" || entityId === null}
        >
          {phase === "submitting" ? "Adding…" : "Add member"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
