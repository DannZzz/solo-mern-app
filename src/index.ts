import express from "express";
import mongoose from "mongoose";
import { Config } from "./config";
import AuthRouter from "./routers/auth-router";
import _cors from "cors";
import PublicApiRouter from "./routers/public-api-router";
import UploadRouter from "./routers/upload-router";
import UserUpdateRouter from "./routers/user-update-router";
import PrivateContentApiRouter from "./routers/private-content-api-router";
import http from "http";
import { Server } from "socket.io";
import { io } from "./websocket/io-handler";
import { Database } from "./Database/Database";

const app = express();
const server = http.createServer(app);

io(new Server(server, { cors: cors() }));

app.use(_cors(cors()));

app.use(
  express.json({
    type: ["application/json", "text/plain"],
  })
);

app.use("/api/upload", UploadRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/public", _cors(), PublicApiRouter);
app.use("/api/update/user", UserUpdateRouter);
app.use("/api/private/content", PrivateContentApiRouter);

process.on("unhandledRejection", (err) => console.log(err));

server.listen(Config.get("PORT"), async () => {
  console.log("APP PORT - " + Config.get("PORT"));
  await connectMongo();
});

async function connectMongo() {
  try {
    await mongoose.connect(Config.get("MONGO_URI"));
    // await Database.UserMessage.deleteMany();
    // console.log(await Database.getModel("User").find())
    // console.log(await Database.getModel("Post").find())
  } catch (e) {
    console.log("Error occured at connecting to database", e?.message);
  }
}

function projectType<T extends any, K extends any>(dev: T, prod: K): K | T {
  if (process.env.NODE_ENV === "production") {
    return prod;
  } else {
    return dev;
  }
}

function cors() {
  return {
    origin(requestOrigin, callback) {
      const whitelist = projectType(["http://localhost:3000"], []);

      if (whitelist.indexOf(requestOrigin) !== -1) {
        callback(null, true);
      } else {
        // callback(new Error('Not allowed by CORS'))
        callback(null, false);
      }
    },
  };
}
