declare module "*.module.scss";

declare type UserDetails = Partial<{
  username: string;
  _id: string;
  avatarFile: string;
  ownRegister: boolean;
  characteristics: Array<{ text: string }>;
  bio: string;
  name: string;
  followers?: Array<Follower>;
  following?: Array<Follower>;
  posts?: Array<Follower>;
  followingCount: number;
  followerCount: number;
  postCount: number;
  [k: string]: any;
}>;

declare interface PostComment {
  _id: string;
  userId: string;
  text: string;
  date: Date;
  likes: Array<{ userId: string; date: Date }>;
  replies: Array<Omit<PostComment, "replies">>;
  user?: UserDetails;
}

declare interface PostJson {
  _id: string;
  creatorId: string;
  createdAt?: Date;
  text: string;
  attachments?: Array<string>;
  edits?: Array<{ date: Date; text?: string; images?: string[] }>;
  likes?: Array<{ _id: string; date: Date }>;
  comments?: Array<PostComment>;
  accessType?: "all" | "followers" | "following";
  likeCount?: number;
  commentCount?: number;
  user?: UserDetails;
}

declare interface MessageObj {
  _id: string;
  senderId: string;
  channelType: "dm";
  text: string;
  date: Date;
  attachments?: string[];
  deleted?: boolean;
  reactions?: any[];
  sender?: UserDetails;
}

declare interface Message {
  with: UserDetails;
  open: string[];
  changedAt: Date;
  messages: MessageObj[];
}
