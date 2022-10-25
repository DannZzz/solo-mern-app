import { Router } from "express";
import multer from "multer";
import { token_check } from "../Database/methods/Token";
import { Json } from "../structures/methods-for-routers";
import * as fs from "fs";
import { uuid } from "anytool";
import { Database } from "../Database/Database";
import { changeAvatarFilePath, findUserById } from "../Database/methods/User";
import fieldsRequired from "./methods/FieldsReq";
import AuthError from "./methods/AuthError";
import { createPost } from "../Database/methods/Post";

const avatarsMulterConfig = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "./uploads/avatars")
    },
    filename(req, file, cb) {
        const name = `${req.body._id}-${uuid(50)}${file.originalname.slice(file.originalname.lastIndexOf("."))}`;
        cb(null, name);
    },
});
const avatarsMulter = multer({
    storage: avatarsMulterConfig, fileFilter(req, file, callback) {
        const { _token, _id } = req.body || {};
        if (!_token || !_id) callback(null, false);
        callback(null, true);
    },
});

const postImagesMulterConfig = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, "./uploads/posts")
    },
    filename(req, file, cb) {
        const name = `${Date.now()}-${uuid(50)}${file.originalname.slice(file.originalname.lastIndexOf("."))}`;
        cb(null, name);
    },
});
const postImagesMulter = multer({
    storage: postImagesMulterConfig, fileFilter(req, file, callback) {
        const { _token, _id, text } = req.body || {};
        if (!_token || !_id || !text) callback(null, false);
        callback(null, true);
    },
});

const UploadRouter = Router();

UploadRouter.post(
    "/user/avatar",
    avatarsMulter.single("avatar"),
    // avatarsMulter.fields([{ name: 'avatar', maxCount: 1 }]),
    async (req, res) => {
        const json = Json(res);
        // console.log("body", req.body)
        const { _token, _id } = req.body;
        const file = req.file;
        if (!file || !_token || !_id) return fieldsRequired(res, "avatar", "_token", "_id")

        if (await AuthError(_token, _id, res)) {
            remove(file.filename);
            err();
        }

        const oldUser = await findUserById(_id);
        const oldAvatarFileName = await oldUser.fetchField("avatarFile");
        if (oldAvatarFileName) remove(oldAvatarFileName);
        const added = await changeAvatarFilePath(_id, file.filename);
        const user = await findUserById(_id);
        if (added) {
            json({
                status: "OK",
                message: "Successfully uploaded new avatar",
                avatarFile: user.avatarFile
            })
        } else {
            err();
            remove(file.filename);
        }

        function remove(file: string) {
            fs.unlink("./uploads/avatars/" + file, () => { });
        }

        function err() {
            json({
                status: "Invalid",
                message: "Something went wrong"
            })
        }
    }
);

UploadRouter.post(
    "/post/new",
    postImagesMulter.array("attachments", 5),
    async (req, res) => {
        const json = Json(res);
        const files = ((req.files || []) as any[]).map(file => file.filename);
        const { _token, _id, text, privacyType = "all" } = req.body;

        if (!_token || !_id || !text) return fieldsRequired(res, "text", "_token", "_id")

        if (await AuthError(_token, _id, res)) {
            remove(files);
            err();
        }

        const isCreated = await createPost({ accessType: ["all", "followers", "following"].includes(privacyType) ? privacyType : "all", text, attachments: files, creatorId: _id });

        if (isCreated) {
            json({
                status: "OK",
                message: "Successfully created",
            })
        } else {
            err();
            remove(files);
        }

        function remove(files: string[]) {
            files.forEach(file => fs.unlink("./uploads/avatars/" + file, () => { }));
        }

        function err() {
            json({
                status: "Invalid",
                message: "Something went wrong"
            })
        }
    }
)

export default UploadRouter;