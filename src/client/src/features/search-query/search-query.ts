import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SearchQuery {
    query: string
}

const initialState: SearchQuery = {
    query: null
}

export const searchQuerySlice = createSlice({
    name: "searchQuery",
    initialState,
    reducers: {
        setSearchQuery: (state, action: PayloadAction<SearchQuery>) => {
            state.query = action.payload.query;
        },
        removeSearchQuery: (state) => {
            state = initialState;
        }
    },
})

export const { setSearchQuery, removeSearchQuery } = searchQuerySlice.actions;

export const selectSearchQuery = (state: any): SearchQuery => state.searchQuery;
