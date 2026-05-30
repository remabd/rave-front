import { useEffect, useState } from 'react';
import { View, StyleSheet, Button, TextInput } from 'react-native';
import {
    useAudioRecorder,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorderState,
} from 'expo-audio';
import { useAppDispatch } from '../store/hooks';
import { addRecord } from '../store/recordSlice';
import { persistRecording } from '../utils/fileStorage';

/**
 * Recording controls: start/stop the microphone, name the take and save it.
 * Saving copies the cache file into permanent storage and adds it to the
 * persisted redux list of records.
 */
export default function Recorder() {
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);
    const dispatch = useAppDispatch();

    const [pendingUri, setPendingUri] = useState<string | null>(null);
    const [name, setName] = useState('');

    const startRecording = async () => {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
    };

    const stopRecording = async () => {
        await audioRecorder.stop();
        // After stop the take is available on audioRecorder.uri.
        setPendingUri(audioRecorder.uri ?? null);
    };

    const saveRecording = async () => {
        if (!pendingUri) return;
        const id = Date.now().toString();
        const uri = await persistRecording(pendingUri, id);
        dispatch(
            addRecord({
                id,
                name: name.trim() || `Record ${new Date().toLocaleString()}`,
                uri,
                date: Date.now(),
            }),
        );
        setPendingUri(null);
        setName('');
    };

    // Ask for microphone permission and enable recording mode on mount.
    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                alert('Permission to access microphone was denied');
            }
            setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Button
                title={recorderState.isRecording ? 'Stop Recording' : 'Start Recording'}
                onPress={recorderState.isRecording ? stopRecording : startRecording}
            />
            {pendingUri && (
                <View style={styles.saveRow}>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Record name"
                    />
                    <Button title="Save record" onPress={saveRecording} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        gap: 8,
    },
    saveRow: {
        gap: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
});
