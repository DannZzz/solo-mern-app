declare module '*.module.scss';

declare interface PostComment {
    _id: string;
    userId: string;
    text: string;
    date: Date;
    likes: Array<{ userId: string, date: Date }>;
    replies: Array<Omit<PostComment, "replies">>;
    user?: {
        avatarFile: string;
        username: string;
    }
}

declare interface PostJson {
    _id: string;
    creatorId: string;
    createdAt?: Date;
    text: string;
    attachments?: Array<string>;
    edits?: Array<{ date: Date, text?: string, images?: string[] }>;
    likes?: Array<{ _id: string, date: Date }>;
    comments?: Array<PostComment>
    accessType?: "all" | "followers" | "following";
    likeCount?: number;
    commentCount?: number
}