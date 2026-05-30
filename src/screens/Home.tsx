import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { Connexion } from '../api/connexion';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { connectedSelector, setConnected, setModels } from '../store/serverSlice';

/**
 * Home screen: enter the server ip/port and test the connection.
 * On success the connection status and available models are stored in redux.
 */
export default function Home() {
    const [ip, setIp] = useState<string>('');
    const [port, setPort] = useState<string>('8000');
    const connected = useAppSelector(connectedSelector);
    const dispatch = useAppDispatch();

    async function testConnexion() {
        const connexion = Connexion.getInstance();
        connexion.setUrl(`http://${ip}:${port}`);
        const ok = await connexion.isConnected();
        dispatch(setConnected(ok));
        if (ok) {
            const models = await connexion.getModels();
            if (models.success) dispatch(setModels(models.data));
        }
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.status, connected ? styles.connected : styles.disconnected]}>
                {connected ? 'Connecté' : 'Déconnecté'}
            </Text>
            <TextInput
                style={styles.input}
                value={ip}
                onChangeText={setIp}
                placeholder="IP (e.g. 192.168.1.10)"
                autoCapitalize="none"
                keyboardType="default"
            />
            <TextInput
                style={styles.input}
                value={port}
                onChangeText={setPort}
                placeholder="PORT"
                keyboardType="number-pad"
            />
            <Button
                title="Tester la connexion"
                onPress={testConnexion}
                disabled={ip === '' || port === ''}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        gap: 12,
    },
    status: {
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '600',
    },
    connected: {
        color: '#27ae60',
    },
    disconnected: {
        color: '#c0392b',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
});
