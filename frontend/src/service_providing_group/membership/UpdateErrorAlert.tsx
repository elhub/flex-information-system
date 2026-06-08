import { useState } from "react";
import { Alert, Link } from "../../components/ui";
import { ErrorMessage } from "../../generated-client";

const isApiErrorMessage = (error: unknown): error is ErrorMessage =>
  typeof error === "object" &&
  error !== null &&
  "message" in error &&
  typeof (error as Record<string, unknown>).message === "string";

export type FailedCU = { cuId: number; error: unknown };

type Props = {
  failedCUs: FailedCU[];
};

export const UpdateErrorAlert = ({ failedCUs }: Props) => {
  const [showDetails, setShowDetails] = useState(false);

  if (failedCUs.length === 0) return null;

  return (
    <Alert variant="error">
      <div className="flex flex-col gap-2">
        <span>
          {failedCUs.length} controllable unit
          {failedCUs.length > 1 ? "s" : ""} could not be updated.{" "}
          <Link
            as="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className="text-sm"
          >
            {showDetails ? "Hide details" : "See details"}
          </Link>
        </span>
        {showDetails && (
          <ul className="flex flex-col gap-1 list-none pl-0">
            {failedCUs.map(({ cuId, error }) => {
              const msg = isApiErrorMessage(error)
                ? error.message
                : "Unknown error";
              const hint = isApiErrorMessage(error) ? error.hint : null;
              return (
                <li key={cuId}>
                  <strong>CU {cuId}:</strong> {msg}
                  {hint && <span className="ml-1 text-sm">— {hint}</span>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Alert>
  );
};
