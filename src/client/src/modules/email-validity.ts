import { memoize } from "anytool";

function emailValidity(email: string) {
    const errors: Array<"invalid"> = []

    if (!email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )) {
        errors.push("invalid")
    }

    return errors;
};

export default memoize(emailValidity);