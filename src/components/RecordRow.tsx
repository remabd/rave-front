import { View, Text, Button, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Record } from '../models/record';

interface Props {
    record: Record;
    onDelete: (record: Record) => void;
}

/**
 * One row of the records list: shows the name and offers play/pause and delete.
 * Each row owns its own audio player bound to the record uri.
 */
export default function RecordRow({ record, onDelete }: Props) {
    const player = useAudioPlayer(record.uri);
    const status = useAudioPlayerStatus(player);

    const togglePlay = () => {
        if (status.playing) {
            player.pause();
        } else {
            // Restart from the beginning if the previous play finished.
            if (status.didJustFinish || status.currentTime >= status.duration) {
                player.seekTo(0);
            }
            player.play();
        }
    };

    return (
        <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
                {record.name}
            </Text>
            <Button title={status.playing ? 'Pause' : 'Play'} onPress={togglePlay} />
            <Button title="Delete" color="#c0392b" onPress={() => onDelete(record)} />
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    name: {
        flex: 1,
    },
});
