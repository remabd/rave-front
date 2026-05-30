import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

/**
 * Cross-screen server state shared through redux: the actual HTTP work stays in
 * the Connexion singleton, this slice only mirrors what several screens read
 * (connection status, available models and the model currently selected).
 */
interface ServerState {
    connected: boolean;
    models: string[];
    selectedModel: string | null;
}

const initialState: ServerState = {
    connected: false,
    models: [],
    selectedModel: null,
};

const serverSlice = createSlice({
    name: 'server',
    initialState,
    reducers: {
        setConnected: (state, action: PayloadAction<boolean>) => {
            state.connected = action.payload;
        },
        setModels: (state, action: PayloadAction<string[]>) => {
            state.models = action.payload;
        },
        setSelectedModel: (state, action: PayloadAction<string>) => {
            state.selectedModel = action.payload;
        },
    },
});

export const { setConnected, setModels, setSelectedModel } = serverSlice.actions;
export const connectedSelector = (state: RootState) => state.server.connected;
export const modelsSelector = (state: RootState) => state.server.models;
export const selectedModelSelector = (state: RootState) => state.server.selectedModel;
export default serverSlice.reducer;
