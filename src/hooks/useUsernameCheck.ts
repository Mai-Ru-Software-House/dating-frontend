/**
 * useUsernameCheck.ts
 * Live username availability (api-integration.md 6.1): 500 ms after typing stops, only when the
 * format passes; a late answer for an older value is ignored.
 * Created by Tee (Kittiphon Kijpinyochai), 6 October 2026
 */
import { useEffect, useState } from "react";

import { profileApi } from "../api/profile";
import { USERNAME_CHECK_DEBOUNCE_MS } from "../constants/limits";
import { usernameRule } from "../utils/rules";

/** Where the check stands for the current text. */
export type UsernameStatus = "idle" | "checking" | "available" | "taken";

/**
 * Checks a username while it is typed.
 * @param username The current text.
 * @returns The status for exactly this text.
 */
export function useUsernameCheck(username: string): UsernameStatus {
  const [result, setResult] = useState<{ username: string; status: UsernameStatus }>({
    username: "",
    status: "idle",
  });
  const isFormatOk = usernameRule(username).isValid;

  useEffect(() => {
    if (!isFormatOk) {
      return undefined;
    }
    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        const isAvailable = await profileApi.checkUsername(username);
        if (isCurrent) {
          setResult({ username, status: isAvailable ? "available" : "taken" });
        }
      } catch {
        // No hint on failure: the same check runs again at Submit.
        if (isCurrent) {
          setResult({ username, status: "idle" });
        }
      }
    }, USERNAME_CHECK_DEBOUNCE_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [username, isFormatOk]);

  if (!isFormatOk) {
    return "idle";
  }
  return result.username === username ? result.status : "checking";
}
