import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useFetch } from "../../modules/useFetch";

export interface OverlayContent {
    status: "on" | "off",
    content: JSX.Element
}

const initialState: OverlayContent = {
    status: "off",
    content: null
}


export const overlayContentSlice = createSlice({
    name: "overlayContent",
    initialState,
    reducers: {
        setOverlayContent(state, action: PayloadAction<OverlayContent['content']>) {
            state.content = action.payload;
            state.status = "on"
        },
        removeOverlayContent(state) {
            state.content = null
            state.status = "off"
        }
    }
})

export const { setOverlayContent, removeOverlayContent } = overlayContentSlice.actions;

export const selectOverlayContent = (state: any): OverlayContent => state.overlayContent;
