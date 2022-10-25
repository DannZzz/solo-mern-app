import express, { json, Router } from "express";
import { changeFollower, changeUsername, findUserByUsername, findUserById } from "../Database/methods/User";
import { Json } from "../structures/methods-for-routers";
import * as path from "path";
import { Database } from "../Database/Database";
import fieldsRequired from "./methods/FieldsReq";
import AuthError from "./methods/AuthError";
import { searchQuery } from "../Database/classes/Search";
import { changeComment, fetchComments, findPostById, findUserPosts, likeUnlikePost } from "../Database/methods/Post";
import { PostAccessType } from "../Database/classes/SuperPost";
import { QueryString } from "../typings";

const PrivateContentApiRouter = Router();


PrivateContentApiRouter.post("/follower/:method", async (req, res) => {
    const json = Json(res);

    const { method } = req.params as { method: "add" | "remove" };
    if (!method || !["remove", "add"].includes(method)) return json({
        status: "Invalid",
        message: "Invalid method"
    })

    const { _token, _id, targetId } = req.body;

    if (!_token || !_id || !targetId) return fieldsRequired(res, "_token", "_id", "targetId");

    if (await AuthError(_token, _id, res)) return;

    const data = await changeFollower(_id, targetId, method);
    if (data) {
        json({
            status: "OK",
            message: "Successfully did method: " + method,
            data: {
                followerFollowingCount: data.followerFollowing.length,
                targetFollowerCount: data.targetFollowers.length
            }
        })
    } else {
        json({
            status: "Invalid",
            message: "Something went wrong"
        })
    }
})


PrivateContentApiRouter.post("/search", async (req, res) => {
    const json = Json(res);

    const { query } = req.query;

    const { _token, _id, excludeThis = false } = req.body as { _token: string, _id: string, excludeThis?: boolean };

    if (!query || !_token || !_id) return fieldsRequired(res, "_token", "_id", "query");

    if (await AuthError(_token, _id, res)) return;

    const data = await searchQuery(query + "", excludeThis ? [_id] : []);

    json({
        status: "OK",
        data
    })

});

PrivateContentApiRouter.get("/post/:username", async (req, res) => {
    const json = Json(res);

    const username = req.params?.username;
    const { _token, _id } = req.query;
    if (!_token || !_id || !username) return fieldsRequired(res, "_token", "_id", "username");

    if (await AuthError(_token, _id, res)) return;

    const user = await findUserByUsername(username);
    if (!user) return json({ status: "Invalid", message: "Invalid user" });
    const posts = await findUserPosts(user.posts);
    const accessedData = posts.map(post => post.data(user.getAccessType(_id as string, post.accessType)));
    json({
        status: "OK",
        data: accessedData?.sort((a, b) => b?.createdAt?.getTime() - a?.createdAt?.getTime())
    })
})


PrivateContentApiRouter.post("/post/:postId/like/:method", async (req, res) => {
    const json = Json(res);

    const { postId, method } = req.params;
    const { _token, _id } = req.body;

    let m = (method || "like") as "unlike" | "like"

    if (!_token || !_id || !postId || !method) return fieldsRequired(res, "_token", "_id", "postId", "method");

    if (await AuthError(_token, _id, res)) return;

    const done = await likeUnlikePost(postId, _id, method as any);
    if (done) {
        const post = await findPostById(postId);
        // console.log(post);
        json({
            status: "OK",
            data: post.data(post.accessType)
        })
    } else {
        json({
            status: "Invalid",
            data: "Something went wrong"
        })
    }
});

PrivateContentApiRouter.get("/post/:postId/comments", async (req, res) => {
    const json = Json(res);

    const { postId } = req.params;

    const { _token, _id } = req.query as QueryString;

    if (!postId || !_token || !_id) return fieldsRequired(res, "postId", "_token", "_id")

    if (await AuthError(_token, _id, res)) return;

    json({
        status: "OK",
        data: await fetchComments(postId)
    })
})

PrivateContentApiRouter.post("/post/:postId/comment/:commentId/:method", async (req, res) => {
    const json = Json(res);
    const { postId, commentId, method } = req.params;

    const { _token, _id, text } = req.body;

    if (!postId || !method || !_token || !_id) return fieldsRequired(res, "postId", "commentId", "method", "_token", "_id");

    if (method === "add") {
        if (!text) return fieldsRequired(res, "text");

        const post = await changeComment(postId, 'add', { text, userId: _id });
        if (!post) return json({ status: "OK", message: "Something went wrong" });

        json({ status: 'OK', data: await fetchComments(postId) });
    }
})


export default PrivateContentApiRouter