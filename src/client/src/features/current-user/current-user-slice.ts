import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useFetch } from "../../modules/useFetch";

export interface Follower {
    _id: string;
    date: Date;
}

export interface UserDetails {
    username: string;
    _id: string;
    avatarFile: string;
    ownRegister: boolean;
    characteristics: Array<{ text: string }>
    bio: string;
    name: string;
    followers?: Array<Follower>;
    following?: Array<Follower>;
    posts?: Array<Follower>;
    followingCount: number;
    followerCount: number;
    postCount: number;
    [k: string]: any;
}

export interface CurrentUser {
    _token: string;
    _id: string;
    details?: UserDetails
}

const initialState: CurrentUser = {
    _token: null,
    details: null,
    _id: null,
}

export const fetchUser = createAsyncThunk<CurrentUser & { fn?: CallableFunction }, { _token: string, _id: string, fn?: CallableFunction }>(
    "currentUser/fetchUser",
    async ({ _id, _token, fn }) => {
        if (!_token || !_id) return { details: null, _token: null, _id: null };
        const { request } = useFetch();
        const res = await request("/api/auth/token/user", {
            method: "POST",
            body: JSON.stringify({ _token, _id, _public: true })
        });
        // console.log(res)
        return { details: res?.data as any || null, _token, _id, fn };
    }
)
export const currentUserSlice = createSlice({
    name: "currentUser",
    initialState,
    reducers: {
        takeCurrentUser(state) {
            state = getCurrentUserLocalStorage()
        },
        changeCurrentUserDetail: <K extends keyof UserDetails>(state: CurrentUser, action: PayloadAction<{ key: K, value: UserDetails[K] }>) => {
            state.details[action.payload.key] = action.payload.value;
            updateCurrentUserLocalStorage(state);
        },
        setUser: (state, action: PayloadAction<CurrentUser>) => {
            state._token = action.payload._token;
            state._id = action.payload._id;
            if (action.payload.details) state.details = action.payload.details;
            updateCurrentUserLocalStorage(state);
        },

        removeUser: (state) => {
            state._token = null;
            state._id = null;
            state.details = null;
            updateCurrentUserLocalStorage(state);
        }
    },
    extraReducers(builder) {
        builder.addCase(fetchUser.fulfilled, (state, action) => {
            // if (!action.payload._token || !action.payload.data) return;
            state.details = action.payload?.details;
            if (state.details) {
                state._token = action.payload?._token;
                state._id = action.payload?._id
            } else {
                state._token = null;
                state._id = null;
            }
            updateCurrentUserLocalStorage(state);

            action.payload?.fn?.()
        })
    },
})

export const { takeCurrentUser, changeCurrentUserDetail, setUser, removeUser } = currentUserSlice.actions;

export const selectCurrentUser = (state: any): CurrentUser => state.currentUser;

export function updateCurrentUserLocalStorage(data: CurrentUser) {
    localStorage.setItem(currentUserSlice.name, JSON.stringify(data));
}

export function getCurrentUserLocalStorage(): CurrentUser {
    const data = localStorage.getItem(currentUserSlice.name);
    if (!data) return null;
    return JSON.parse(data);
}

export function clearCurrentUserLocalStorage() {
    localStorage.removeItem(currentUserSlice.name)
}

export function isCurrentUser(checkDetails: boolean = false) {
    return Boolean(getCurrentUserLocalStorage()?.[checkDetails ? "details" : "_token"]);
}