import express from "express"
import mongoose from "mongoose";
import { Config } from "./config";
import AuthRouter from "./routers/auth-router";
import cors from "cors";
import { Database } from "./Database/Database";
import PublicApiRouter from "./routers/public-api-router";
import UploadRouter from "./routers/upload-router";
import UserUpdateRouter from "./routers/user-update-router";
import PrivateContentApiRouter from "./routers/private-content-api-router";
import SuperUser from "./Database/classes/SuperUser";

const app = express();

app.use(cors({
    origin(requestOrigin, callback) {
        const whitelist = projectType(["http://localhost:3000"], []);

        if (whitelist.indexOf(requestOrigin) !== -1) {
            callback(null, true)
        } else {
            // callback(new Error('Not allowed by CORS'))
            callback(null, false)
        }
    },
}))

app.use(express.json({
    type: ['application/json', 'text/plain']
}));

app.use("/api/upload", UploadRouter)
app.use("/api/auth", AuthRouter);
app.use("/api/public", cors(), PublicApiRouter);
app.use("/api/update/user", UserUpdateRouter);
app.use("/api/private/content", PrivateContentApiRouter);

process.on("unhandledRejection", err => console.log(err))

app.listen(Config.get("PORT"), async () => {
    console.log("APP PORT - " + Config.get("PORT"))
    await connectMongo();
})


async function connectMongo() {
    try {
        await mongoose.connect(Config.get("MONGO_URI"));
        // await Database.Post.deleteMany();
        // console.log(await Database.getModel("User").find())
        // console.log(await Database.getModel("Post").find())
    } catch (e) {
        console.log("Error occured at connecting to database", e?.message)
    }
}

function projectType<T extends any, K extends any>(dev: T, prod: K): K | T {
    if (process.env.NODE_ENV === "production") {
        return prod;
    } else {
        return dev;
    }
}
