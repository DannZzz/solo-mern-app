import { Response } from "express";
import { token_check } from "../../Database/methods/Token";
import { Json } from "../../structures/methods-for-routers";

export default async function (_token: string | any, _id: string | any, res: Response) {
    const json = Json(res);

    const exists = await token_check(_token, _id);
    if (!exists) {
        json({
            status: "Invalid",
            message: "Authorization Error"
        });
        return true;
    }
    return false;
}