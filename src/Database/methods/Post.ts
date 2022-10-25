import { uuid } from "anytool";
import { idGeneratorUnique } from "../../modules/id-generator";
import keepOnlyThisKeys from "../../modules/keep-only-this-keys";
import SuperPost from "../classes/SuperPost";
import { Database } from "../Database";
import { findUserById } from "./User";

export async function findPostById(_id: string) {
    try {
        const res = await Database.getModel("Post").findOne("_id", _id);
        if (res) return new SuperPost(res);
        return null;
    } catch (err) {
        console.log(`(${_id})`, err.message)
        return null;
    }
}

export async function createPost(data: Omit<Database.Post, "_id">) {
    const _id = await idGeneratorUnique("Post");
    const res = await Database.getModel("Post").createOne({ ...data, _id, createdAt: new Date() });
    if (!res) return false;
    return await Database.getModel("User").updateOne(data.creatorId, { method: "$push", field: "posts", value: _id })
}

export function findUserPosts(userId: string): Promise<Array<SuperPost>>;
export function findUserPosts(postIds: string[]): Promise<Array<SuperPost>>;
export async function findUserPosts(arg1: string | string[]): Promise<Array<SuperPost>> {
    if (!arg1) return [];

    return await Database.getModel("Post").find(typeof arg1 === "string" ? { creatorId: arg1 } : { _id: { $in: arg1 } }, data => new SuperPost(data));
}

export async function likeUnlikePost(postId: string, userId: string, method: "like" | "unlike") {
    const post = await Database.getModel("Post").findOne("_id", postId);
    const user = await findUserById(userId);
    if (!post || !user) return false;
    if (post.likes?.find(like => like._id === userId)) {
        if (method === "like") return true;
        return await Database.getModel("Post").updateOne(postId, { field: "likes", value: post.likes.filter((like) => like._id !== userId) });
    }
    if (method === "unlike") return true;
    return await Database.getModel("Post").updateOne(postId, { method: "$push", field: "likes", value: { _id: userId, date: new Date() } });
}

export async function fetchComments(postId: string) {
    const post = await findPostById(postId);
    if (!post) return null;

    return await Promise.all(post.data(post.accessType).comments.map(async comment => {
        const user = await findUserById(comment.userId);
        return { ...comment, user: keepOnlyThisKeys(user, ["avatarFile", "username"] as const) }
    }))
}

interface MethodType {
    add: Omit<Database.Comment, "_id" | "likes" | "replies" | "date">;
    delete: string;
    change: { _id: string, data: Omit<Database.Comment, "_id"> }
}

export async function changeComment<K extends keyof MethodType>(postId: string, method: K, val: MethodType[K]) {
    if (!postId || !method || !val) return;
    const thisPost = await findPostById(postId);
    switch (method) {
        case "add": {
            await Database.getModel("Post").updateOne(postId, { field: "comments", method: "$push", value: { date: new Date, likes: [], replies: [], ...val as any, _id: idGeneratorUnique(thisPost.comments || []) } })
            break;
        }

        case "change": {
            await Database.getModel("Post").updateOne(postId, { field: "comments", method: "$set", value: thisPost.comments.map(data => data._id === (val as any)._id ? { _id: data._id, ...(val as any).data } : data) })
            break;
        }

        case "delete": {
            await Database.getModel("Post").updateOne(postId, { field: "comments", method: "$set", value: thisPost.comments.filter(data => data._id !== val) })
            break;
        }
    }
    return await findPostById(postId);
}