import { memoize } from "anytool";

export const UsernamePattern = /[a-z0-9]/;

function usernameValidity(username: string) {
  username = username?.toLowerCase() || "";

  const errors: Array<"min-length" | "max-length" | "chars"> = [];

  if (username.length < 3) {
    errors.push("min-length");
  }
  if (username.length > 16) {
    errors.push("max-length");
  }
  if (!UsernamePattern.test(username)) {
    errors.push("chars");
  }

  return errors;
}

export default memoize(usernameValidity);
