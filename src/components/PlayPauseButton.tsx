import { Button } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

interface Props {
    uri: string | null;
    label: string;
}

/**
 * A self-contained play/pause button bound to a single audio uri.
 * Disabled while no uri is available.
 */
export default function PlayPauseButton({ uri, label }: Props) {
    const player = useAudioPlayer(uri ?? undefined);
    const status = useAudioPlayerStatus(player);

    const toggle = () => {
        if (status.playing) {
            player.pause();
        } else {
            if (status.didJustFinish || status.currentTime >= status.duration) {
                player.seekTo(0);
            }
            player.play();
        }
    };

    return (
        <Button
            title={status.playing ? `Pause ${label}` : `Play ${label}`}
            onPress={toggle}
            disabled={!uri}
        />
    );
}
