import { idGeneratorUnique } from "../../modules/id-generator";
import SuperUser from "../classes/SuperUser";
import { Database } from "../Database";
import bcrypt from "bcrypt";
import { token_add, token_findOrCreate } from "./Token";

export async function createUserWithEmailAndPassword(data: {
  email: string;
  password: string;
  username: string;
}) {
  return await Database.getModel("User").createOne({
    ...data,
    _id: await idGeneratorUnique("User"),
    createdAt: new Date(),
  });
}

export async function loginWithUsernameAndPassword(
  username: string,
  password: string
) {
  try {
    if (!username || !password) return null;
    const users = Database.getModel("User");

    const thisUser = await users.findOne("username", username);
    if (!thisUser) return null;

    const isValidPassword = await bcrypt.compare(password, thisUser.password);
    if (!isValidPassword) return null;
    const token = await token_add(thisUser._id);
    return { _token: token, _id: thisUser._id };
  } catch {
    return null;
  }
}

export async function findUserByUsername(username: string) {
  const found = await Database.getModel("User").findOne("username", username);
  if (!found) return null;
  return new SuperUser(found);
}

export async function findUserById(_id: string): Promise<SuperUser> {
  const found = await Database.getModel("User").findOne("_id", _id);
  if (!found) return null;
  return new SuperUser(found);
}

export async function changeUsername(userId: string, username: string) {
  return await Database.getModel("User").updateOne(userId, {
    field: "username",
    value: username,
  });
}

export async function changeAvatarFilePath(
  userId: string,
  avatarFilePath: string
) {
  return await Database.getModel("User").updateOne(userId, {
    field: "avatarFile",
    value: avatarFilePath,
  });
}

export async function changeBio(userId: string, bio: string) {
  return await Database.getModel("User").updateOne(userId, {
    field: "bio",
    value: bio,
  });
}

export async function changeCharacteristics(
  userId: string,
  characteristics: Database.User["characteristics"]
) {
  return await Database.getModel("User").updateOne(userId, {
    field: "characteristics",
    value: characteristics,
  });
}

export async function changeFollower(
  followerId: string,
  targetId: string,
  type: "add" | "remove"
) {
  try {
    const followerData = await Database.getModel("User").findOne(
      "_id",
      followerId
    );
    const targetData = await Database.getModel("User").findOne("_id", targetId);

    const sendObj = {
      followerFollowing: [...followerData.following] as Database.Follower[],
      targetFollowers: [...targetData.followers] as Database.Follower[],
    };

    if (type === "add") {
      if (followerData.following.find((follower) => follower._id === targetId))
        return sendObj;
      sendObj.followerFollowing = [
        ...followerData.following,
        { _id: targetId, date: new Date() },
      ];
      sendObj.targetFollowers = [
        ...targetData.followers,
        { _id: followerId, date: new Date() },
      ];
    } else if (type === "remove") {
      if (!followerData.following.find((follower) => follower._id === targetId))
        return sendObj;
      sendObj.followerFollowing = followerData.following.filter(
        (following) => following._id !== targetId
      );
      sendObj.targetFollowers = targetData.followers.filter(
        (follower) => follower._id !== followerId
      );
    } else {
      return sendObj;
    }

    if (sendObj.followerFollowing.length !== followerData.following.length) {
      await Promise.all([
        Database.getModel("User").updateOne(followerId, {
          field: "following",
          value: sendObj.followerFollowing,
        }),
        Database.getModel("User").updateOne(targetId, {
          field: "followers",
          value: sendObj.targetFollowers,
        }),
      ]);
    }
    return sendObj;
  } catch {
    console.log(`Can't changeFollower (${followerId}, ${targetId})`);
    return null;
  }
}

export async function fetchFollowers(
  targetId: string,
  requestId: string,
  type: "followers" | "following"
) {
  const user = await findUserById(targetId);
  if (!user || !["followers", "following"].includes(type)) return null;
  let list = user.field(type) as any[];
  if (
    targetId !== requestId &&
    user.field("private") &&
    !user.field("followers").find((follower) => follower._id === requestId)
  )
    list = [];

  return await Promise.all(
    list.map(async (follower) => {
      return { ...follower, user: (await findUserById(follower._id)).data() };
    })
  );
}
