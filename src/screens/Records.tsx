import { FlatList, StyleSheet, Text, View } from 'react-native';
import Recorder from '../components/Recorder';
import RecordRow from '../components/RecordRow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { recordSelector, removeRecord } from '../store/recordSlice';
import { deleteFile } from '../utils/fileStorage';
import { Record } from '../models/record';

/**
 * Records screen: record new takes and manage the persisted list of records
 * (play/pause and delete each one).
 */
export default function Records() {
    const records = useAppSelector(recordSelector);
    const dispatch = useAppDispatch();

    const handleDelete = async (record: Record) => {
        await deleteFile(record.uri);
        dispatch(removeRecord(record.id));
    };

    return (
        <View style={styles.container}>
            <Recorder />
            <FlatList
                data={records}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <RecordRow record={item} onDelete={handleDelete} />}
                ListEmptyComponent={<Text style={styles.empty}>No records yet</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 12,
    },
    empty: {
        textAlign: 'center',
        marginTop: 24,
        color: '#888',
    },
});
