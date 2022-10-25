import { Database } from "../Database/Database";

export async function emailValidity(email: string): Promise<{ status: "OK" | "Invalid", message: string }> {
    const data = await Database.getModel("User").findOne("email", email);

    const validity = email.match(
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

    if (!validity || validity.length === 0) {
        return { status: "Invalid", message: "Invalid email" }
    }

    if (data) return {
        status: "Invalid",
        message: "This email already registered in our database"
    }
    return {
        status: "OK",
        message: ""
    }
}