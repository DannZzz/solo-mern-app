import express, { Router } from "express";
import { findUserById } from "../Database/methods/User";
import { Json } from "../structures/methods-for-routers";
import * as path from "path";

const PublicApiRouter = Router();


PublicApiRouter.get("/user/:id", async (req, res) => {
    const _id = req.params.id;

    const json = Json(res);

    if (!_id) return json({
        status: "Invalid",
        message: "id param is required"
    });

    const user = await findUserById(_id);
    if (!user) return json({
        status: "Invalid",
        message: "Something went wrong"
    });

    return json({
        status: "OK",
        data: user.data()
    })
})

PublicApiRouter.use("/user/avatar/", express.static("uploads/avatars"));
PublicApiRouter.use("/post/attachment/", express.static("uploads/posts"));

export default PublicApiRouter