import { Chest } from "anytool";
import { Server, Socket } from "socket.io";
import { token_check } from "../Database/methods/Token";
import { fetchOneMessage } from "../Database/methods/UserMessage";
import { EventChest } from "../structures/Event";

export const OnlineTokens = new Chest<string, string>();

export type AuthPayload<T = {}> = T & { _token: string; _id: string };

export function io(server: Server) {
  EventChest.on("message:add", async ({ user1, user2 }) => {
    const member1 = OnlineTokens.get(user1);
    const member2 = OnlineTokens.get(user2);
    if (member1)
      server
        .to(member1)
        .emit("update-message:list", await fetchOneMessage(user1, user2));
    if (member2)
      server
        .to(member2)
        .emit("update-message:list", await fetchOneMessage(user2, user1));
  });

  server.on("connection", (socket) => {
    socket.on("connect-message:add", async (data: AuthPayload) => {
      const rightUser = await token_check(data._token, data._id);
      if (!rightUser) return;
      OnlineTokens.set(data._id, socket.id);
    });
  });
}
