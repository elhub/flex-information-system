import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Alert,
  BodyText,
  Button,
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
import {
  zAuthScope,
  zEntityLookupRequest,
} from "../../generated-client/zod.gen";
import { throwOnError } from "../../util";
import { Identifier } from "ra-core";
import {
  ScopesChipsInput,
  DEFAULT_SCOPES,
} from "../../components/EDS-ra/inputs/ScopesInput";

// ScopesChipsInput is used directly here (instead of the RA-integrated
// ScopesInput wrapper) to avoid z-index issues when mixing RA and EDS in
// modal contexts.

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
          <Controller
            name="business_id"
            control={control}
            render={({ field }) => (
              <TextField
                id="lookup-business-id"
                {...field}
                onChange={(e) => field.onChange(e.target.value.toLowerCase())}
                disabled={isPending}
                placeholder="Enter the entity's email address"
                aria-invalid={!!errors.business_id}
              />
            )}
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
            <FormItem>
              <FormItemLabel>Scopes</FormItemLabel>
              <BodyText variant="subtle" className="mb-2">
                Scopes determine the access level of the party member and what
                actions they can perform on behalf of the party.
              </BodyText>
              <ScopesChipsInput
                value={field.value}
                onChange={field.onChange}
                disabled={isPending}
              />
            </FormItem>
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
