import { Database } from "../Database/Database";

export async function usernameValidity(username: string): Promise<{ status: "OK" | "Invalid", message: string }> {
    username = username?.toLowerCase();
    if (!username) {
        return { status: "Invalid", message: "" }
    } else if (username.length < 3) {
        return { status: "Invalid", message: "Username must have minimum length - 3 symbols" }
    } else if (username.length > 16) {
        return { status: "Invalid", message: "Username must have maximum length - 16 symbols" }
    } else if (/[^a-z0-9]/.test(username)) {
        return { status: "Invalid", message: "Username must contain only letters (a-z) and numbers (0-9)" }
    }

    const userWithThisName = await Database.getModel("User").findOne("username", username);
    if (userWithThisName) return { status: "Invalid", message: "This username is already taken" }
    return { status: "OK", message: "This username is OK" }
}