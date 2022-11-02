import { configureStore } from "@reduxjs/toolkit";
import { currentUserSlice } from "../features/current-user/current-user-slice";
import { messagesSlice } from "../features/messages/messages-slice";
import { overlayContentSlice } from "../features/overlay-content/overlay-content-slice";
import { searchQuerySlice } from "../features/search-query/search-query";

export const store = configureStore({
  reducer: {
    [currentUserSlice.name]: currentUserSlice.reducer,
    [searchQuerySlice.name]: searchQuerySlice.reducer,
    [overlayContentSlice.name]: overlayContentSlice.reducer,
    [messagesSlice.name]: messagesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: false,
    });
  },
});

export type MainStore = typeof store;
