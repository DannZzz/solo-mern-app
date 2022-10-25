import keepOnlyThisKeys from "../../modules/keep-only-this-keys";
import { Database } from "../Database";
import { token_find } from "../methods/Token";
import { changeUsername } from "../methods/User";
import * as path from "path";
import { Config } from "../../config";
import { PostAccessType } from "./SuperPost";

export type DangerFields = 'password' | 'email' | "logins";
export type NoDangerFields = keyof Omit<Database.User, DangerFields>;

export type SuperUserJson = Omit<Database.User, DangerFields> & { followerCount?: number, followingCount?: number, postCount?: number };

export default class SuperUser {
    private _keys: NoDangerFields[];

    private readonly _data: SuperUserJson
    constructor(data: Database.User);
    constructor(data: Database.User, allowScopes: DangerFields[]);
    constructor(data: Database.User, allowScopes: DangerFields[] = []) {
        Object.defineProperty(this, "_keys", { value: ['followers', 'following', 'posts', '_id', 'username', 'ownRegister', 'avatarFile', "characteristics", "bio", "name"] });

        let _data = keepOnlyThisKeys(data, [...this._keys, ...allowScopes]) as any;
        _data.followerCount = data?.followers?.length || 0;
        _data.followingCount = data?.following?.length || 0;
        _data.postCount = data?.posts?.length || 0;

        let filename = "default-avatar.jpg";
        if (_data.avatarFile) filename = _data.avatarFile;
        _data.avatarFile = Config.get("PUBLIC_AVATARS_API") + filename;


        Object.defineProperty(this, '_data', { value: _data });
    }

    get _id() {
        return this._data._id;
    }

    get avatarFile() {
        return this._data.avatarFile;
    }

    get ownRegister() {
        return this._data.ownRegister;
    }

    get name() {
        return this._data.name;
    }

    get username() {
        return this._data.username;
    }

    get posts() {
        return this._data.posts;
    }

    get bio() {
        return this._data.bio;
    }

    get characteristics() {
        return this._data.characteristics;
    }

    async fetchField(key: string): Promise<any> {
        const d = await Database.getModel("User").findOne("_id", this._id);
        if (!d) return null;
        return d[key];
    }

    getAccessType(userId: string, accessType: PostAccessType): PostAccessType {
        if (userId === this._id) return accessType;
        switch (accessType) {
            case "all":
                return accessType;

            case "followers":
                return Boolean((this?._data?.followers || []).find(data => data._id === userId)) ? accessType : "all";

            case "following":
                return Boolean((this?._data?.following || []).find(data => data._id === userId)) ? accessType : "all";

            default:
                return "all";
        }
    }

    data(): SuperUserJson;
    data(isPublic: boolean): SuperUserJson;
    data(isPublic: boolean = false) {
        const obj = { ...this._data };
        if (!isPublic) {
            delete obj.followers;
            delete obj.following;
            delete obj.posts;
        }
        return obj;
    }

    async _token() {
        return await token_find(this._id);
    }

    field<K extends keyof SuperUserJson>(field: K & string): SuperUserJson[K] | any {
        return this._data[field as any];
    }



    fetchEmail(): Promise<string>;
    fetchEmail(cache: true): Promise<string>;
    async fetchEmail(cache?: true) {
        if ("email" in this._data) {
            return this._data['email'];
        }

        const email = (await Database.getModel("User").findOne("_id", this._id)).email;
        if (cache) this._data['email'] = email;
        return email;
    }

    async changeUsername(username: string) {
        await changeUsername(this._id, username);
    }
}
