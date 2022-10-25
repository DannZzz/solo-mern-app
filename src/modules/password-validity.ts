import { memoize } from "anytool";

function passwordValidity(password: string): { status: "OK" | "Invalid", message: string } {
    const errors: Array<"min-length" | "lowercase" | "uppercase" | "numbers"> = [];;
    if (!password) password = "";
    if (password.length === password.replace(/[0-9]/g, "").length) errors.push("numbers");
    if (password.length === password.replace(/[a-z]/g, "").length) errors.push("lowercase");
    if (password.length === password.replace(/[A-Z]/g, "").length) errors.push("uppercase");
    if (password.length <= 5) errors.push("min-length");

    return errors.length > 0 ? { status: "Invalid", message: "Password must have at least 6 symbols length, lowercase and uppercase letters and nummbers" } : { status: "OK", message: "Password is cool" };
}

export default memoize(passwordValidity);