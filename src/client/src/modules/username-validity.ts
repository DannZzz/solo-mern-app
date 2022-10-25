import { memoize } from "anytool";

function usernameValidity(username: string) {
    username = username?.toLowerCase() || "";

    const errors: Array<"min-length" | "max-length" | "chars"> = [];

    if (username.length < 3) {
        errors.push("min-length")
    }
    if (username.length > 16) {
        errors.push("max-length")
    }
    if (/[^a-z0-9]/.test(username)) {
        errors.push("chars");
    }

    return errors;
}

export default memoize(usernameValidity)