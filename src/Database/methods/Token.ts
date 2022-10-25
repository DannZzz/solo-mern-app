import { uuid } from "anytool";
import { Database } from "../Database";


export const token_add = async (id: string) => {
    const _tokens = await userData(id);

    let token = uuid(50, { aditional: "_$@#%^&*!" });
    while (_tokens.logins.find(obj => obj._token === token)) token = uuid(50, { aditional: "_$@#%^&*!" });
    await Database.getModel("User").updateOne(id, { field: "logins", value: { date: new Date(), _token: token }, method: "$push" });
    return token;
}

export const token_remove = async (token: string, id: string) => {
    const _tokens = await userData(id, true);
    const tokens = (_tokens?.logins || []).filter(obj => obj._token !== token);
    await Database.getModel("User").updateOne(id, { field: "logins", value: tokens, method: "$set" });
}

export const token_find = async (id: string) => {
    const _tokens = await userData(id);

    return _tokens?.logins?.find(obj => checkDate(obj.date))?._token || null;
}

export const token_has = async (id: string) => {
    return Boolean(await token_find(id));
}

export const token_check = async (token: string, id: string) => {
    const _tokens = (await userData(id)).logins || [];

    return Boolean(_tokens.find(obj => obj._token === token && checkDate(obj.date)));
}

export const token_findOrCreate = async (id: string) => {
    const found = await token_find(id);
    if (found) return found;
    return await token_add(id);
}

export const token_checkWithUsername = async (token: string, username: string) => {
    const user = await Database.getModel("User").findOne("username", username);
    if (!user) return false;
    return await token_check(token, user._id);
}

async function userData(id: string, ignore: boolean = false) {
    const _tokens = await Database.getModel("User").findOne("_id", id);
    if (!_tokens && !ignore) throw new Error("No user found for creating token");
    return _tokens;
}

function checkDate(date: Date) {
    return date.getTime() + 6 * 60 * 60 * 1000 > Date.now();
}