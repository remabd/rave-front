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
        addRecord: (state, action: PayloadAction<Record>) => {
            state.value.push(action.payload);
        },
    },
});

export const { addRecord: addPicture } = recordSlice.actions;
export const recordSelector = (state: RootState) => state.record.value;
export default recordSlice.reducer;
