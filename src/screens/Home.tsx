import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { Connexion } from '../api/connexion';

export default function Home() {
    const [url, setUrl] = useState<string>('');
    const [port, setPort] = useState<string>('');
    const [connected, setConnected] = useState<boolean>(false);

    async function testConnexion() {
        const connexion = Connexion.getInstance();
        const is = await connexion.isConnected();
        if (is) {
            setConnected(true);
        } else {
            setConnected(false);
        }
    }

    return (
        <View>
            <Text>{connected ? 'Connecté' : 'Déconnecté'}</Text>
            <TextInput value={url} onChangeText={setUrl} placeholder="URL" />
            <TextInput value={port} onChangeText={setPort} placeholder="PORT" />
            <Button
                title="Tester la connexion"
                onPress={testConnexion}
                disabled={port === '' || url === ''}
            />
        </View>
    );
}
