import { useEffect, useState } from "react";
import { Alert } from "@mui/material";

// show the banner 5 minutes before expiry
const WARN_BEFORE_MS = 5 * 60 * 1000;

const SESSION_KEY = "flexSession";

function getExpiry(): number | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw)["exp"] ?? null;
  } catch {
    return null;
  }
}

// component to show a banner when the session is about to expire
// TODO: remove when we have proper session refresh
export const SessionExpiryBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timer: number;

    function schedule() {
      setShow(false);
      clearTimeout(timer);

      const exp = getExpiry();
      if (!exp) return;

      const delay = exp * 1000 - Date.now() - WARN_BEFORE_MS;

      if (delay <= 0 && exp * 1000 > Date.now()) {
        // already within the warning window but not yet expired
        setShow(true);
      } else if (delay > 0) {
        timer = setTimeout(() => setShow(true), delay);
      }
      // if already expired, don't show — checkAuth will handle the redirect
    }

    // schedule the banner on mount
    schedule();

    // and whenever the session changes (for example if several tabs are open)
    window.addEventListener("storage", schedule);

    // cleanup on unmount
    return () => {
      clearTimeout(timer);
      window.removeEventListener("storage", schedule);
    };
  }, []);

  if (!show) return null;

  return (
    <Alert
      severity="error"
      variant="filled"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999, // above everything else
        borderRadius: 0,
      }}
    >
      Your session will expire in 5 minutes. To continue your work in the
      Flexibility Information System, please log out and log in again.
    </Alert>
  );
};
