import { configureStore } from "@reduxjs/toolkit";
import { alertSlice } from "../features/alerts/alertSlice";
import { currentUserSlice } from "../features/current-user/current-user-slice";
import { overlayContentSlice } from "../features/overlay-content/overlay-content-slice";
import { searchQuerySlice } from "../features/search-query/search-query";

export const store = configureStore({
    reducer: {
        [alertSlice.name]: alertSlice.reducer,
        [currentUserSlice.name]: currentUserSlice.reducer,
        [searchQuerySlice.name]: searchQuerySlice.reducer,
        [overlayContentSlice.name]: overlayContentSlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
            serializableCheck: false
        })
    },
})

export type MainStore = typeof store;