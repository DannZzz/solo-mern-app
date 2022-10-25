import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { uuid } from "anytool";
import { useSelector } from "react-redux";

export type AlertType = "danger" | "success" | "info" | "warning";

export interface AlertState {
    type: AlertType
    endsIn: number;
    message: string;
    title?: string
    id: string;
}

export interface AlertBox {
    alerts: Array<AlertState>
}

const initialAlert: AlertBox = {
    alerts: []
}

export const removeAlertTimeout = createAsyncThunk(
    "alerts/removeByTime",
    async ({ id, timeMs }: { id: string, timeMs: number }): Promise<string> => {
        return new Promise((res) => {
            setTimeout(() => {
                return res(id)
            }, timeMs)
        })
    }
)

export const alertSlice = createSlice({
    name: "alerts",
    initialState: initialAlert,
    reducers: {
        addAlert: (state, action: PayloadAction<Omit<AlertState, "id">>) => {
            state.alerts.push({ ...action.payload, id: uuid(20) });
        },
        removeAlert: (state, action: PayloadAction<string>) => {
            state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
        },
        clearAlerts: (state) => {
            state.alerts = []
        }
    },
    extraReducers(builder) {
        builder.addCase(removeAlertTimeout.fulfilled, (state, action) => {
            state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
        })
    },
})



export const { addAlert, removeAlert, clearAlerts } = alertSlice.actions;



export const selectAlerts = (state: any): AlertBox['alerts'] => state.alerts.alerts;
