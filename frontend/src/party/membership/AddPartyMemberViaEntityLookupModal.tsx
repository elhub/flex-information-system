import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { IconPlus } from "@elhub/ds-icons";
import {
  callEntityLookup,
  createPartyMembership,
} from "../../generated-client";
import { AuthScope } from "../../generated-client/types.gen";
import {
  zAuthScope,
  zEntityLookupRequest,
} from "../../generated-client/zod.gen";
import { throwOnError } from "../../util";
import { Identifier } from "ra-core";

// ScopesInput
// TODO: improve/move this component when we have support for general scopes
// (this is reimplemented here to avoid z-index issues when mixing RA with EDS)

const ALL_SCOPES: AuthScope[] = zAuthScope.options;

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
      <BodyText variant="subtle" className="mb-2">
        Scopes determine the access level of the party member and what actions
        they can perform on behalf of the party.
      </BodyText>
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

const formSchema = zEntityLookupRequest.pick({ name: true }).extend({
  business_id: z.string().email("Must be a valid email address"),
  scopes: z.array(zAuthScope),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  partyId: Identifier;
  open: boolean;
  onClose: () => void;
};

// component to perform entity lookup and party membership creation in one step:
// clicking "Add" will first look up the entity, then immediately add it to the
// party (an error message is displayed if either step fails)
export const AddPartyMemberViaEntityLookupModal = ({
  partyId,
  open,
  onClose,
}: Props) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      business_id: "",
      name: "",
      scopes: DEFAULT_SCOPES,
    },
    mode: "onChange",
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const {
    mutate: addMember,
    isPending,
    error: mutationError,
  } = useMutation({
    mutationFn: async (values: FormValues) => {
      // step 1: entity lookup
      const lookupResult = await callEntityLookup({
        body: {
          business_id: values.business_id,
          business_id_type: "email",
          name: values.name,
          type: "person",
        },
      }).then(throwOnError);

      // step 2: add entity to party
      await createPartyMembership({
        body: {
          party_id: Number(partyId),
          entity_id: lookupResult.entity_id!,
          scopes: values.scopes,
        },
      }).then(throwOnError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["party_membership"] });
      handleClose();
    },
  });

  const errorMessage = mutationError
    ? mutationError instanceof Error
      ? mutationError.message
      : "An unexpected error occurred. Please try again."
    : null;

  return (
    <Modal open={open} onClose={handleClose} aria-label="Add member">
      <Modal.Header
        title="Add member"
        description="Add a member to the party. This will allow the person to act on behalf of the party."
      />
      <Modal.Content className="flex flex-col gap-4 min-w-lg">
        <FormItem>
          <FormItemLabel htmlFor="lookup-business-id">Email</FormItemLabel>
          <TextField
            id="lookup-business-id"
            {...register("business_id")}
            disabled={isPending}
            placeholder="Enter the entity's email address"
            aria-invalid={!!errors.business_id}
          />
          {errors.business_id && (
            <Alert variant="error">{errors.business_id.message}</Alert>
          )}
        </FormItem>
        <FormItem>
          <FormItemLabel htmlFor="lookup-name">Name</FormItemLabel>
          <TextField
            id="lookup-name"
            {...register("name")}
            disabled={isPending}
            placeholder="Enter the person's full name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <Alert variant="error">{errors.name.message}</Alert>}
        </FormItem>
        <Controller
          name="scopes"
          control={control}
          render={({ field }) => (
            <ScopesInput
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
            />
          )}
        />
        {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
      </Modal.Content>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          icon={IconPlus}
          onClick={handleSubmit((values) => addMember(values))}
          disabled={!isValid || isPending}
        >
          {isPending ? "Adding…" : "Add"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
