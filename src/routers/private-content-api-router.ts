import express, { json, Router } from "express";
import {
  changeFollower,
  changeUsername,
  findUserByUsername,
  findUserById,
  fetchFollowers,
} from "../Database/methods/User";
import { Json } from "../structures/methods-for-routers";
import * as path from "path";
import { Database } from "../Database/Database";
import fieldsRequired from "./methods/FieldsReq";
import AuthError from "./methods/AuthError";
import { searchQuery } from "../Database/classes/Search";
import {
  changeComment,
  deletePost,
  fetchComments,
  fetchFeedContent,
  fetchLikes,
  findPostById,
  findUserPosts,
  likeUnlikePost,
} from "../Database/methods/Post";
import { PostAccessType } from "../Database/classes/SuperPost";
import { QueryString } from "../typings";
import {
  addMessage,
  createUserMessage,
  fetchMessages,
  fetchOneMessage,
  findUserMessage,
  isMessage,
} from "../Database/methods/UserMessage";

const PrivateContentApiRouter = Router();

PrivateContentApiRouter.post("/follower/:method", async (req, res) => {
  const json = Json(res);

  const { method } = req.params as { method: "add" | "remove" };
  if (!method || !["remove", "add"].includes(method))
    return json({
      status: "Invalid",
      message: "Invalid method",
    });

  const { _token, _id, targetId } = req.body;

  if (!_token || !_id || !targetId)
    return fieldsRequired(res, "_token", "_id", "targetId");

  if (await AuthError(_token, _id, res)) return;

  const data = await changeFollower(_id, targetId, method);
  if (data) {
    json({
      status: "OK",
      message: "Successfully did method: " + method,
      data: {
        followerFollowingCount: data.followerFollowing.length,
        targetFollowerCount: data.targetFollowers.length,
      },
    });
  } else {
    json({
      status: "Invalid",
      message: "Something went wrong",
    });
  }
});

PrivateContentApiRouter.post("/search", async (req, res) => {
  const json = Json(res);

  const { query } = req.query;

  const {
    _token,
    _id,
    excludeThis = false,
  } = req.body as { _token: string; _id: string; excludeThis?: boolean };

  if (!query || !_token || !_id)
    return fieldsRequired(res, "_token", "_id", "query");

  if (await AuthError(_token, _id, res)) return;

  const data = await searchQuery(query + "", excludeThis ? [_id] : []);

  json({
    status: "OK",
    data,
  });
});

PrivateContentApiRouter.get("/post/:username", async (req, res) => {
  const json = Json(res);

  const username = req.params?.username;
  const { _token, _id } = req.query;
  if (!_token || !_id || !username)
    return fieldsRequired(res, "_token", "_id", "username");

  if (await AuthError(_token, _id, res)) return;

  const user = await findUserByUsername(username);
  if (!user) return json({ status: "Invalid", message: "Invalid user" });
  const posts = await findUserPosts(user.posts);
  const accessedData = posts.map((post) =>
    post.data(user.getAccessType(_id as string, post.accessType))
  );
  json({
    status: "OK",
    data: accessedData?.sort(
      (a, b) => b?.createdAt?.getTime() - a?.createdAt?.getTime()
    ),
  });
});

PrivateContentApiRouter.post("/post/:postId/like/:method", async (req, res) => {
  const json = Json(res);

  const { postId, method } = req.params;
  const { _token, _id } = req.body;

  let m = (method || "like") as "unlike" | "like";

  if (!_token || !_id || !postId || !method)
    return fieldsRequired(res, "_token", "_id", "postId", "method");

  if (await AuthError(_token, _id, res)) return;

  const done = await likeUnlikePost(postId, _id, method as any);
  if (done) {
    const post = await findPostById(postId);
    // console.log(post);
    json({
      status: "OK",
      data: post.data(post.accessType),
    });
  } else {
    json({
      status: "Invalid",
      data: "Something went wrong",
    });
  }
});

PrivateContentApiRouter.get("/post/:postId/comments", async (req, res) => {
  const json = Json(res);

  const { postId } = req.params;

  const { _token, _id } = req.query as QueryString;

  if (!postId || !_token || !_id)
    return fieldsRequired(res, "postId", "_token", "_id");

  if (await AuthError(_token, _id, res)) return;

  json({
    status: "OK",
    data: await fetchComments(postId),
  });
});

PrivateContentApiRouter.post(
  "/post/:postId/comment/:commentId/:method",
  async (req, res) => {
    const json = Json(res);
    const { postId, commentId, method } = req.params;

    const { _token, _id, text } = req.body;

    if (!postId || !method || !_token || !_id)
      return fieldsRequired(
        res,
        "postId",
        "commentId",
        "method",
        "_token",
        "_id"
      );

    if (method === "add") {
      if (!text) return fieldsRequired(res, "text");

      const post = await changeComment(postId, "add", { text, userId: _id });
      if (!post) return json({ status: "OK", message: "Something went wrong" });

      json({ status: "OK", data: await fetchComments(postId) });
    }
  }
);

PrivateContentApiRouter.get("/post/:postId/likes", async (req, res) => {
  const json = Json(res);

  const { postId } = req.params;

  const { _token, _id } = req.query as QueryString;

  if (!postId || !_token || !_id)
    return fieldsRequired(res, "postId", "_token", "_id");

  if (await AuthError(_token, _id, res)) return;

  json({
    status: "OK",
    data: await fetchLikes(postId),
  });
});

PrivateContentApiRouter.get(
  "/user/:userId/:followerType/",
  async (req, res) => {
    const json = Json(res);

    const { userId, followerType } = req.params;

    const { _token, _id } = req.query as QueryString;

    if (!userId || !followerType || !_token || !_id)
      return fieldsRequired(res, "userId", "followerType", "_token", "_id");

    if (await AuthError(_token, _id, res)) return;
    const data = await fetchFollowers(userId, _id, followerType as any);
    if (!data)
      return json({
        status: "Invalid",
        message: "Something went wrong",
      });

    json({
      status: "OK",
      data,
    });
  }
);

PrivateContentApiRouter.get("/feed/content", async (req, res) => {
  const json = Json(res);
  const { _token, _id } = req.query as QueryString;

  if (!_token || !_id) return fieldsRequired(res, "_token", "_id");

  if (await AuthError(_token, _id, res)) return;

  json({
    status: "OK",
    data: await fetchFeedContent(_id),
  });
});

PrivateContentApiRouter.get("/post/id/:postId", async (req, res) => {
  const json = Json(res);
  const { postId } = req.params;
  const { _token, _id } = req.query as QueryString;

  if (!_token || !_id || !postId)
    return fieldsRequired(res, "postId", "_token", "_id");

  if (await AuthError(_token, _id, res)) return;

  const data = await findPostById(postId);
  if (data) {
    const user = await findUserById(_id);
    json({
      status: "OK",
      data: {
        ...data.data(user.getAccessType(data.creatorId, data.accessType)),
        user: (await findUserById(data.creatorId))?.data(),
      },
    });
  } else {
    json({
      status: "Invalid",
      message: "Something went wrong",
    });
  }
});

PrivateContentApiRouter.delete("/post/:id", async (req, res) => {
  const json = Json(res);
  const { id } = req.params;
  const { _token, _id } = req.body;

  if (!_token || !_id || !id) return fieldsRequired(res, "id", "_token", "_id");

  if (await AuthError(_token, _id, res)) return;

  const post = await findPostById(id);
  const err = () =>
    json({
      status: "Invalid",
      message: "Something went wrong",
    });
  if (!post || post.creatorId !== _id) return err();
  const deleted = await deletePost(post);
  if (deleted)
    return json({
      status: "OK",
      message: "Successfully deleted",
    });

  err();
});

PrivateContentApiRouter.get("/messages/dm", async (req, res) => {
  const json = Json(res);
  const { _token, _id } = req.query as QueryString;

  if (!_token || !_id) return fieldsRequired(res, "_token", "_id");

  if (await AuthError(_token, _id, res)) return;

  const data = await fetchMessages(_id);

  json({
    status: "OK",
    data,
  });
});

PrivateContentApiRouter.post("/message/dm/:method", async (req, res) => {
  const json = Json(res);
  const { method } = req.params;

  const { _token, _id, data, targetId } = req.body;

  if (!_token || !_id || !method || !data || !targetId)
    return fieldsRequired(res, "data", "method", "_token", "_id", "targetId");

  if (await AuthError(_token, _id, res)) return;

  if (method === "add") {
    const msg: Database.Message = { ...data, date: new Date() };

    const err = () =>
      json({
        status: "Invalid",
        message: "Something went wrong",
      });

    if (!isMessage(msg)) return err();

    await addMessage(_id, targetId, msg);

    json({
      status: "OK",
      message: "Successfully sent a message",
    });
  }
});

PrivateContentApiRouter.get("/messages/with/:userId", async (req, res) => {
  const json = Json(res);
  const { _token, _id } = req.query as QueryString;
  const { userId } = req.params;

  if (!_token || !_id || !userId)
    return fieldsRequired(res, "_token", "_id", "userId");

  if (await AuthError(_token, _id, res)) return;

  if (_id === userId)
    return json({
      status: "Invalid",
      message: "Something went wrong",
    });

  const msgs = await fetchOneMessage(_id, userId);

  if (msgs)
    return json({
      status: "OK",
      data: msgs,
    });
  const created = await createUserMessage(_id, userId);

  if (created) {
    const msg = await fetchOneMessage(_id, userId);
    return json({
      status: "OK",
      data: msg,
    });
  }

  json({
    status: "Invalid",
    message: "Something went wrong",
  });
});

export default PrivateContentApiRouter;
