import express, { Router } from "express";
import { changeUsername, findUserById } from "../Database/methods/User";
import { Json } from "../structures/methods-for-routers";
import * as path from "path";
import { Database } from "../Database/Database";
import { token_check } from "../Database/methods/Token";
import { usernameValidity } from "../modules/username-validity";
import AuthError from "./methods/AuthError";
import fieldsRequired from "./methods/FieldsReq";

const UserUpdateRouter = Router();

interface UserUpdateOptions {
    _id: string;
    _token: string;
    update: { [k in keyof Database.User]: Database.User[k] };
}

UserUpdateRouter.post("/by/field", async (req, res) => {
    const { _token, _id, update } = req.body as UserUpdateOptions;

    const json = Json(res);

    if (!_token || !_id) return fieldsRequired(res, "_token", "_id");

    if (await AuthError(_token, _id, res)) return;

    const oldUser = await findUserById(_id);

    const _username = update?.username || null;
    update['username'] = null;
    if (_username) {
        const usernameValid = await usernameValidity(_username);
        if (usernameValid.status === "OK") {
            await changeUsername(_id, _username);
        } else {
            return json({
                status: "Invalid",
                message: "This username is already taken"
            })
        }
    }

    const allow_only_these_keys: Array<keyof Database.User> = ['bio', 'characteristics', 'email', 'password', "name"];
    const models = Database.getModel("User");
    await Promise.all(Object.keys(update).map(async (key: any) => {
        if (allow_only_these_keys.includes(key)) {
            return await models.updateOne(_id, { field: key, value: update[key] === "" ? null : update[key] })
        }
    }))

    const user = await findUserById(_id);

    json({
        status: "OK",
        message: "Successfully updated",
        data: user.data()
    })
})


export default UserUpdateRouter