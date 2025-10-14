import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
    name: 'user',
    initialState: {
        data: null,
        isAuthLoading: true,
    },
    reducers: {
        setUser: (state, action) => {
            state.data = action.payload;
            state.isAuthLoading = false;
        },
        setAuthLoading: (state, action) => {
            state.isAuthLoading = action.payload;
        },
        logout: (state) => {
            state.data = null;
            state.isAuthLoading = false;
        },
    },
});

export const { setUser, setAuthLoading, logout } = userSlice.actions;

export default userSlice.reducer;