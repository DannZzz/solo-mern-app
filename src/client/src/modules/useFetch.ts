import { useCallback, useState } from "react"
import { Web } from "../config";

export const useFetch = () => {

    const request = async function (url: string, options: { query?: { [k: string]: string | any }, method?: "POST" | "GET", headers?: { [k: string]: any }, body?: any } = {} as any): Promise<{ [k: string]: any, status: "OK" | "Invalid", message: string }> {
        const { method = "GET", headers = {}, body = null, query = null } = options

        let _url = url.startsWith("/") ? `${Web}${url.slice(1)}` : `${Web}${url}`;
        if (query) {
            _url += "?" + new URLSearchParams(query);
        }
        try {
            const res = await fetch(_url, { method, body, headers });
            const data = await res.json();
            return data;
        } catch (e) {
            console.log(e)
            return null;
        }
    };

    return { request };
}