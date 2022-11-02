import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useFetch } from "../../modules/useFetch";
import { getCurrentUserLocalStorage } from "../current-user/current-user-slice";

export interface Messages {
  status: "on" | "off";
  list: Message[];
  current?: string;
}

const initialState: Messages = {
  status: "off",
  list: [],
  current: null,
};

export const setUserThunk = createAsyncThunk<
  { message: Message; show: boolean },
  { userId: string; show?: boolean }
>("messages/setuser", async ({ userId, show }) => {
  const { request } = useFetch();
  const res = await request("api/private/content/messages/with/" + userId, {
    query: {
      _token: getCurrentUserLocalStorage()?._token,
      _id: getCurrentUserLocalStorage()?._id,
    },
  });

  if (res?.status === "OK") return { message: res.data, show };
  return { message: null, show };
});

export const getAllMessages = createAsyncThunk<Message[]>(
  "messages/getAll",
  async () => {
    const { request } = useFetch();
    const res = await request("api/private/content/messages/dm", {
      query: {
        _token: getCurrentUserLocalStorage()?._token,
        _id: getCurrentUserLocalStorage()?._id,
      },
    });

    if (res?.status === "OK") return res.data;
    return null;
  }
);

export const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    updateUserChat: (state, action: PayloadAction<Message>) => {
      if (action.payload) {
        const payload = {
          ...action.payload,
          changedAt: new Date(action.payload.changedAt),
        };
        const list = [...state.list];
        state.list = list.map((msg) =>
          msg.with._id === payload.with._id ? payload : msg
        );
      }
    },
    setCurrentMessageMemberId: (state, action: PayloadAction<string>) => {
      state.current = action.payload;
    },
    toggleMessagesStatus: (
      state,
      action?: PayloadAction<Messages["status"]>
    ) => {
      state.status = action.payload || (state.status === "on" ? "off" : "on");
    },
    setMessagesList: (state, action: PayloadAction<Message[]>) => {
      state.list = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(setUserThunk.fulfilled, (state, action) => {
      if (action.payload.message) {
        const payload = {
          ...action.payload.message,
          changedAt: new Date(action.payload.message.changedAt),
        };
        state.list = state.list.map((msg) =>
          msg.with._id === payload.with._id ? payload : msg
        );
        if (action.payload.show) state.current = payload.with._id;
      }
      state.status =
        action.payload.show !== undefined
          ? action.payload.show
            ? "on"
            : "off"
          : state.status;
    });

    builder.addCase(getAllMessages.fulfilled, (state, action) => {
      if (action.payload) {
        const payload = action.payload.map((msg) => {
          return { ...msg, changedAt: new Date(msg.changedAt) };
        });
        state.list = payload || [];
        const c =
          payload.sort(
            (a, b) => b?.changedAt?.getTime() - a?.changedAt?.getTime()
          )?.[0] || null;
        state.current = c.with._id;
      }
      state.status = "on";
    });
  },
});

export const {
  setCurrentMessageMemberId,
  toggleMessagesStatus,
  setMessagesList,
  updateUserChat,
} = messagesSlice.actions;

export const selectMessages = (state: any): Messages => state.messages;
