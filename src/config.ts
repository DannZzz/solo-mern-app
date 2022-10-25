import tokens from "./tokens.json";

const PORT = +processOr("PORT", tokens.PORT);

function processOr(key: string, dflt: any = null) {
    return process.env[key] || dflt + "";
}

export class Config {
    private static readonly data = {

        MONGO_URI: processOr("MONGO_URI", tokens?.MONGO_URI || "") as string,
        PORT,
        PUBLIC_AVATARS_API: processOr("PUBLIC_AVATARS_API", `http://localhost:${PORT}/api/public/user/avatar/`),
        PUBLI_POST_ATTACHMENT_API: processOr("PUBLIC_AVATARS_API", `http://localhost:${PORT}/api/public/post/attachment/`),
    }

    static get<K extends keyof (typeof Config)['data']>(key: K): (typeof Config)['data'][K] {
        return this.data[key];
    }
}
