import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Record } from '../models/record';
import { RootState } from './store';

interface RecordState {
    value: Record[];
}

const initialState: RecordState = {
    value: [],
};

const recordSlice = createSlice({
    name: 'record',
    initialState,
    reducers: {
        // Append a freshly saved recording to the persisted list.
        addRecord: (state, action: PayloadAction<Record>) => {
            state.value.push(action.payload);
        },
        // Remove a recording from the list by its id.
        removeRecord: (state, action: PayloadAction<string>) => {
            state.value = state.value.filter((r) => r.id !== action.payload);
        },
    },
});

export const { addRecord, removeRecord } = recordSlice.actions;
export const recordSelector = (state: RootState) => state.record.value;
export default recordSlice.reducer;
