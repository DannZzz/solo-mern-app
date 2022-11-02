import { Config } from "../../config";
import keepOnlyThisKeys from "../../modules/keep-only-this-keys";
import { Database } from "../Database";
import { findUserById } from "../methods/User";

export type SuperPostJson = Database.Post & {
  likeCount?: number;
  commentCount?: number;
};

export type PostAccessType = Database.Post["accessType"];

const fields: Array<keyof Database.Post> = [
  "_id",
  "accessType",
  "attachments",
  "comments",
  "createdAt",
  "creatorId",
  "edits",
  "likes",
  "text",
];

export default class SuperPost {
  private _data: SuperPostJson;

  constructor(data: Database.Post) {
    const _data = {} as any;
    Object.assign(_data, keepOnlyThisKeys(data, fields));
    _data.likeCount = data?.likes?.length || 0;
    _data.commentCount = data?.comments?.length || 0;

    _data.attachments = (_data.attachments || []).map(
      (file) => Config.get("PUBLI_POST_ATTACHMENT_API") + file
    );

    Object.defineProperty(this, "_data", {
      value: _data,
    });
  }

  get comments() {
    return this._data.comments;
  }

  get likes() {
    return this._data.likes;
  }

  get _id() {
    return this._data._id;
  }
  get createdAt() {
    return this._data.createdAt;
  }
  get text() {
    return this._data.text;
  }

  get creatorId() {
    return this._data.creatorId;
  }
  get attachments() {
    return this._data.attachments;
  }

  data(accessType: PostAccessType): Partial<SuperPostJson> {
    if (!accessType) accessType = "all";
    if (accessType === this._data.accessType) return { ...this._data };

    const notDangerFields: Array<keyof SuperPostJson> = [
      "creatorId",
      "createdAt",
      "likeCount",
      "commentCount",
      "accessType",
    ];
    const data = {};
    notDangerFields.forEach((el) => {
      if (el in this._data) data[el] = this._data[el];
    });
    return data;
  }

  get accessType() {
    return this._data.accessType;
  }

  async fetchCreator() {
    return await findUserById(this._data.creatorId);
  }
}
