import { FilterQuery, model, Schema } from "mongoose";

export namespace Database {
    export interface Follower {
        _id: string;
        date: Date;
    }

    export interface Comment {
        _id: string;
        userId: string
        text: string;
        date: Date;
        likes: Array<{ userId: string, date: Date }>;
        replies: Array<Omit<Comment, "replies">>;
    }

    export interface User {
        _id: string;
        email?: string;
        password?: string;
        createdAt?: Date;
        username: string;
        ownRegister?: boolean;
        logins?: Array<{ date: Date, _token: string }>;
        avatarFile?: string;
        bio?: string;
        name?: string;
        characteristics?: Array<{ text: string }>;
        followers?: Array<Follower>;
        following?: Array<Follower>;
        posts?: Array<string>;
        private?: boolean;
    }

    export const User = model("user", new Schema<User>({
        _id: String,
        name: { type: String, default: null },
        email: { type: String, unique: true },
        password: String,
        createdAt: { type: Date, default: Date.now },
        username: { type: String, unique: true, required: true },
        ownRegister: { type: Boolean, default: true },
        logins: { type: Array as any, default: [] },
        avatarFile: { type: String, default: null },
        bio: { type: String, default: null },
        characteristics: { type: Array as any, default: [] },
        followers: { type: Array as any, default: [] },
        following: { type: Array as any, default: [] },
        posts: { type: Array as any, default: [] },
        private: { type: Boolean, default: false },
    }));


    export interface Post {
        _id: string;
        creatorId: string;
        createdAt?: Date;
        text: string;
        attachments?: Array<string>;
        edits?: Array<{ date: Date, text?: string, images?: string[] }>;
        likes?: Array<{ _id: string, date: Date }>;
        comments?: Array<Comment>
        accessType?: "all" | "followers" | "following"
    }

    export const Post = model("post", new Schema<Post>({
        _id: String,
        creatorId: { type: String, required: true },
        text: { type: String, required: true },
        accessType: { type: String, default: "all" },
        createdAt: { type: Date, default: Date.now },
        attachments: { type: Array as any, default: [] },
        edits: { type: Array as any, default: [] },
        likes: { type: Array as any, default: [] },
        comments: { type: Array as any, default: [] },
    }));

    export interface models {
        User: User;
        Post: Post;
    }

    export const models = {
        User: Database.User,
        Post: Database.Post,
    }

    export function getModel<T extends keyof Database.models>(modelName: T) {
        return new Model(modelName);
    }


    class Model<T extends keyof Database.models, I extends Database.models[T]> {
        data: (typeof Database.models)[T] | any;
        constructor(dataName: T) {
            this.data = Database.models[dataName];
        }

        async findOne<K extends keyof I>(key: K, value: I[K]): Promise<I> {
            try {
                const res = await this.data.findOne({ [key]: value });
                if (res) {
                    return res as any;
                } else return null;
            } catch (error) {
                return null;
            }
        }

        find(): Promise<I[]>;
        find<T extends any>(converter: (data: I | any) => T): Promise<T[]>;
        find(filter: FilterQuery<I>): Promise<I[]>;
        find<T extends any>(filter: FilterQuery<I>, converter: (data: I | any) => T): Promise<T[]>;
        async find<T extends any>(convOrFilter?: FilterQuery<I> | ((data: I | any) => T), converter?: (data: I | any) => T): Promise<T[] | I[]> {
            try {
                const res = await this.data.find(typeof convOrFilter !== "function" ? convOrFilter : {});
                if (res) {
                    if (typeof convOrFilter === "function") {
                        return res.map(r => convOrFilter(r)) as any;
                    } else if (converter) {
                        return res.map(r => converter(r)) as any;
                    } else {
                        return res;
                    }
                } else return null;
            } catch (error) {
                return null;
            }
        }

        updateOne<E extends keyof I, M extends "$set" | "$inc" | "$push">(filter: string, update: { field: E, value: M extends "$push" ? (I[E] extends any[] ? I[E][number] : I[E]) : I[E], method?: M }): Promise<boolean>;
        updateOne<K extends keyof I, E extends keyof I, M extends "$set" | "$inc" | "$push">(filter: { field: K, value: M extends "$push" ? (I[E] extends any[] ? I[E][number] : I[E]) : I[E] }, update: { field: E, value: I[E], method?: M }): Promise<boolean>;
        async updateOne<K extends keyof I, E extends keyof I>(filter: string | { field: K, value: I[K] }, update: { field: E, value: I[E], method?: "$set" | "$inc" | "$push" }): Promise<boolean> {
            try {
                await this.data.updateOne({ [typeof filter === "string" ? "_id" : filter.field]: typeof filter === "string" ? filter : filter.value }, { [update.method || "$set"]: { [update.field]: update.value } })
                return true;
            } catch {
                return false;
            }
        }

        async createOne(data: I) {
            try {
                const d = new this.data(data);
                await d.save();
                return true;
            } catch (err) {
                console.log(err);
                return false;
            }
        }
    }
}
