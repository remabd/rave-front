import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useAssets } from 'expo-asset';
import * as DocumentPicker from 'expo-document-picker';
import { documentDirectory } from 'expo-file-system/legacy';
import { Connexion } from '../api/connexion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { recordSelector } from '../store/recordSlice';
import {
    connectedSelector,
    modelsSelector,
    selectedModelSelector,
    setModels,
    setSelectedModel,
} from '../store/serverSlice';
import PlayPauseButton from '../components/PlayPauseButton';

type Source = 'default' | 'record' | 'file';

/**
 * Rave screen: pick a sound (bundled default / a saved record / a file from the
 * phone), select a model, send it to the server and listen to the original and
 * the transformed results.
 */
export default function Rave() {
    const connexion = Connexion.getInstance();
    const connected = useAppSelector(connectedSelector);
    const records = useAppSelector(recordSelector);
    const models = useAppSelector(modelsSelector);
    const selectedModel = useAppSelector(selectedModelSelector);
    const dispatch = useAppDispatch();

    const [assets] = useAssets([require('../../assets/audio.wav')]);
    const [source, setSource] = useState<Source>('default');
    const [originalUri, setOriginalUri] = useState<string | null>(null);
    const [transformedUri, setTransformedUri] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    // The default tab simply uses the bundled asset as the selected sound.
    useEffect(() => {
        if (source === 'default' && assets && assets[0]?.localUri) {
            setOriginalUri(assets[0].localUri);
            setTransformedUri(null);
        }
    }, [source, assets]);

    // Refresh the models list when reaching this screen while connected.
    useEffect(() => {
        if (connected && models.length === 0) {
            connexion.getModels().then((res) => {
                if (res.success) dispatch(setModels(res.data));
            });
        }
    }, [connected]);

    const pickFromFile = async () => {
        const res = await DocumentPicker.getDocumentAsync({
            type: 'audio/*',
            copyToCacheDirectory: true,
        });
        if (!res.canceled && res.assets[0]) {
            setOriginalUri(res.assets[0].uri);
            setTransformedUri(null);
        }
    };

    const selectModel = async (model: string) => {
        const res = await connexion.selectModel(model);
        if (res.success) dispatch(setSelectedModel(model));
        else Alert.alert('Erreur', res.error.message);
    };

    const sendToServer = async () => {
        if (!originalUri) return;
        setSending(true);
        try {
            const upload = await connexion.uploadFile(originalUri);
            if (!upload.success) {
                Alert.alert('Upload échoué', upload.error.message);
                return;
            }
            // Unique destination so the player reloads the new transformed file.
            const dest = `${documentDirectory}transformed_${Date.now()}.wav`;
            const dl = await connexion.download(dest);
            if (!dl.success) {
                Alert.alert('Download échoué', dl.error.message);
                return;
            }
            setTransformedUri(dl.data);
        } finally {
            setSending(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Source picker tabs */}
            <View style={styles.tabs}>
                {(['default', 'record', 'file'] as Source[]).map((s) => (
                    <Pressable
                        key={s}
                        style={[styles.tab, source === s && styles.tabActive]}
                        onPress={() => {
                            setSource(s);
                            if (s === 'file') pickFromFile();
                        }}
                    >
                        <Text style={source === s ? styles.tabTextActive : styles.tabText}>
                            {s === 'default' ? 'Default' : s === 'record' ? 'Records' : 'File'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Source-specific content */}
            {source === 'record' ? (
                <FlatList
                    style={styles.recordList}
                    data={records}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text style={styles.muted}>No records yet</Text>}
                    renderItem={({ item }) => (
                        <Pressable
                            style={[
                                styles.recordItem,
                                originalUri === item.uri && styles.recordItemActive,
                            ]}
                            onPress={() => {
                                setOriginalUri(item.uri);
                                setTransformedUri(null);
                            }}
                        >
                            <Text numberOfLines={1}>{item.name}</Text>
                        </Pressable>
                    )}
                />
            ) : (
                <Text style={styles.selected} numberOfLines={1}>
                    {originalUri
                        ? `Selected: ${originalUri.split('/').pop()}`
                        : 'No sound selected'}
                </Text>
            )}

            {/* Models */}
            <Text style={styles.section}>Models</Text>
            <View style={styles.models}>
                {models.length === 0 && <Text style={styles.muted}>Connect to load models</Text>}
                {models.map((m) => (
                    <Pressable
                        key={m}
                        style={[styles.model, selectedModel === m && styles.modelActive]}
                        onPress={() => selectModel(m)}
                    >
                        <Text style={selectedModel === m ? styles.tabTextActive : styles.tabText}>
                            {m}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* Send + playback */}
            <Text style={styles.modelLabel}>Model: {selectedModel ?? 'none'}</Text>
            {sending ? (
                <ActivityIndicator />
            ) : (
                <Button
                    title="Send to server"
                    onPress={sendToServer}
                    disabled={!connected || !originalUri}
                />
            )}
            <View style={styles.playRow}>
                <PlayPauseButton uri={originalUri} label="original" />
                <PlayPauseButton uri={transformedUri} label="transformed" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 12 },
    tabs: { flexDirection: 'row', gap: 8 },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 6,
        backgroundColor: '#eee',
        alignItems: 'center',
    },
    tabActive: { backgroundColor: '#3498db' },
    tabText: { color: '#333' },
    tabTextActive: { color: '#fff', fontWeight: '600' },
    recordList: { maxHeight: 160 },
    recordItem: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    recordItemActive: { backgroundColor: '#eaf4fb' },
    selected: { color: '#333' },
    section: { fontWeight: '600', marginTop: 4 },
    models: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    model: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#eee' },
    modelActive: { backgroundColor: '#3498db' },
    modelLabel: { fontStyle: 'italic', color: '#555' },
    playRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
    muted: { color: '#888' },
});
