import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MessageType } from "../../modules/message";

export interface OverlayContent {
  status?: "on" | "off";
  content: JSX.Element;
  onOk?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    close: () => void
  ) => void;
  onCancel?: (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  title?: string;
  type?: MessageType;
  width?: number;
  footer?: any;
  centered?: boolean;
}

const initialState: OverlayContent = {
  status: "off",
  content: null,
  onOk: () => {},
  onCancel: () => {},
  title: "",
  type: null,
  width: 520,
  footer: undefined,
  centered: false,
};

export const overlayContentSlice = createSlice({
  name: "overlayContent",
  initialState,
  reducers: {
    setOverlayContent(
      state,
      action: PayloadAction<Omit<OverlayContent, "status">>
    ) {
      state.content = action.payload.content;
      state.status = "on";
      state.onCancel = action.payload.onCancel;
      state.onOk = action.payload.onOk;
      state.title = action.payload.title;
      state.type = action.payload.type || null;
      state.width = action.payload.width || initialState.width;
      state.centered = !!action.payload.centered;
      if ("footer" in action.payload) state.footer = action.payload.footer;
    },
    removeOverlayContent(state) {
      state.content = initialState.content;
      state.status = "off";
      state.onCancel = initialState.onCancel;
      state.onOk = initialState.onOk;
      state.title = initialState.title;
      state.type = initialState.type;
      state.width = initialState.width;
      state.footer = initialState.footer;
      state.centered = initialState.centered;
    },
  },
});

export const { setOverlayContent, removeOverlayContent } =
  overlayContentSlice.actions;

export const selectOverlayContent = (state: any): OverlayContent =>
  state.overlayContent;
