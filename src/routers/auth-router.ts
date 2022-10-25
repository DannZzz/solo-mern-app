import { Router } from "express";
import { validationResult, check } from "express-validator"
import * as bcrypt from "bcrypt";
import { usernameValidity } from "../modules/username-validity";
import { emailValidity } from "../modules/email-validity";
import { Database } from "../Database/Database";
import passwordValidity from "../modules/password-validity";
import { Json } from "../structures/methods-for-routers";
import { createUserWithEmailAndPassword, loginWithUsernameAndPassword, findUserById, findUserByUsername } from "../Database/methods/User";
import { token_check, token_checkWithUsername } from "../Database/methods/Token";
import AuthError from "./methods/AuthError";
import fieldsRequired from "./methods/FieldsReq";

const AuthRouter = Router();

AuthRouter.post(
    "/register",
    async (req, res) => {
        const { username, email, password } = req.body;

        const usernameRes = await usernameValidity(username);
        const emailRes = await emailValidity(email);
        const passwordRes = passwordValidity(password);
        const err = [usernameRes, emailRes, passwordRes].find(res => res.status !== "OK")
        if (err) {
            return res.status(400).json(err)
        }
        const _password = await bcrypt.hash(password, 12);
        const isCreated = await createUserWithEmailAndPassword({ email, username, password: _password });
        if (isCreated) {
            const loginToken = await loginWithUsernameAndPassword(username, password);

            return res.status(200).json({
                status: "OK",
                message: "Successfully created new user",
                ...loginToken
            })
        } else {
            return res.status(400).json({
                status: "Invalid",
                message: "Something went wrong at registering"
            })
        }
    }
)

AuthRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const json = Json(res);
    // return console.log(req.body, typeof req.body);
    const logged = await loginWithUsernameAndPassword(username, password);
    if (!logged) return json({
        status: "Invalid",
        message: "Wrong username or password"
    })

    return json({
        status: "OK",
        message: "Successfully logged in",
        ...logged
    })

})

AuthRouter.post("/token/user", async (req, res) => {
    const json = Json(res);

    const { _token, _id, _public = false } = req.body;
    if (!_token || !_id) return fieldsRequired(res, "_token", "_id");

    if (await AuthError(_token, _id, res)) return;

    const userData = await findUserById(_id);
    if (userData) {
        return json({
            status: "OK",
            data: userData.data(Boolean(_public))
        })
    } else {
        return json({
            status: "Invalid",
            message: "Something went really wrong"
        })
    }
})

AuthRouter.post("/token/user/username", async (req, res) => {
    const json = Json(res);

    const { _token, username } = req?.body;
    if (!_token || !username) return fieldsRequired(res, "_token", "username");

    const comp = await token_checkWithUsername(_token, username);
    if (comp) return json({
        status: "OK",
        message: "It's ok"
    })

    json({
        status: "Invalid",
        message: "Something went wrong"
    })
})

AuthRouter.post("/user/by/username", async (req, res) => {
    const json = Json(res);

    const { _token, _id, username } = req?.body;
    if (!_token || !username || !_id) return fieldsRequired(res, "_token", "username", "_id")

    if (await AuthError(_token, _id, res)) return;

    const user = await findUserByUsername(username);
    json({
        status: "OK",
        message: "OK",
        data: user.data()
    })
})

export default AuthRouter;