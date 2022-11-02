import { EventChest } from "../../structures/Event";
import { idGenerator, idGeneratorUnique } from "../../modules/id-generator";
import { Database } from "../Database";
import { findUserById } from "./User";

export async function createUserMessage(user1: string, user2: string) {
  if (!user1 || !user2 || user1 === user2) return null;
  const model = Database.getModel("UserMessage");

  return await model.createOne({
    _id: await idGeneratorUnique("UserMessage"),
    open: [user1],
    changedAt: new Date(),
    members: [user1, user2],
  });
}

export async function findUserMessage(user1: string, user2: string) {
  return await Database.getModel("UserMessage").findOne({
    members: { $all: [user1, user2] },
  });
}

export async function fetchOneMessage(user1: string, user2: string) {
  const data = await Database.getModel("UserMessage").findOne({
    members: { $all: [user1, user2] },
  });
  if (!data) return null;
  const me = (await findUserById(user1))?.data();
  const _ = (await findUserById(user2))?.data();

  return {
    with: _,
    open: data.open,
    changedAt: data.changedAt,
    messages: data.messages.map((msg) => {
      return { ...msg, sender: msg.senderId === user1 ? me : _ };
    }),
  };
}

export async function fetchMessages(user1: string) {
  const data = await Database.getModel("UserMessage").find({
    members: user1,
  });
  if (!data) return [];
  const me = (await findUserById(user1))?.data();
  const objected: { [k: string]: Database.Message[] | any } = {};
  const messages = data.filter((message) => message?.open.includes(user1));

  await Promise.all(
    messages.map(async (msg) => {
      const frId = msg.members.find((id) => id !== user1);
      const fr = (await findUserById(frId))?.data();

      const messages = msg.messages.map((mes) =>
        mes.senderId === user1
          ? {
              ...mes,
              sender: { avatarFile: me.avatarFile, username: me.username },
            }
          : {
              ...mes,
              sender: { avatarFile: fr.avatarFile, username: fr.username },
            }
      );

      objected[frId] = {
        open: msg.open,
        messages,
        changedAt: msg.changedAt,
        with: fr,
      };
      return;
    })
  );

  return Object.values(objected);
}

export async function addMessage(
  user1: string,
  user2: string,
  data: Database.Message
) {
  const _ = await findUserMessage(user1, user2);
  await Database.getModel("UserMessage").data.updateOne(
    { members: { $all: [user1, user2] } },
    {
      $push: { messages: { ...data, id: idGeneratorUnique(_.messages) } },
      $set: { changedAt: new Date(), open: [user1, user2] },
    }
  );

  EventChest.emit("message:add", { user1, user2 });
}

export function isMessage(data: Database.Message): data is Database.Message {
  if (typeof data.text !== "string" || !data.text) return false;
  if (!data.date) return false;
  if (!data.senderId) return false;
  if (!["dm"].includes(data.channelType)) return false;

  return true;
}
