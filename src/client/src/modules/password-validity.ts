import { memoize } from "anytool";

function passwordValidity(password: string): Array<"min-length" | "lowercase" | "uppercase" | "numbers"> {
    const errors: Array<"min-length" | "lowercase" | "uppercase" | "numbers"> = [];;
    if (!password) password = "";
    if (password.length === password.replace(/[0-9]/g, "").length) errors.push("numbers");
    if (password.length === password.replace(/[a-z]/g, "").length) errors.push("lowercase");
    if (password.length === password.replace(/[A-Z]/g, "").length) errors.push("uppercase");
    if (password.length <= 5) errors.push("min-length");

    return errors;
}

export default memoize(passwordValidity);