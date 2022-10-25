import { Response } from "express";
import { Json } from "../../structures/methods-for-routers";

export default function fieldsRequired(res: Response, ...fields: string[]) {
    const json = Json(res);
    return json({
        status: "Invalid",
        message: `Fields are required: ${fields}`
    })
}