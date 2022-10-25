import { Response } from "express";

export function Json(res: Response) {
    return (obj: { [k: string]: any, status?: "OK" | "Invalid", message?: string }, status?: "OK" | "Invalid" | number) => {
        if (status) {
            if (typeof status === "number")
                return res.status(status).json(obj);
            else
                return res.status(status === "OK" ? 200 : 400).json(obj)
        } else {
            if (obj.status)
                return res.status(obj.status === "OK" ? 200 : 400).json(obj);
            else
                return res.json(obj);
        }
    }
}