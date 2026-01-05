import { useCallback, useState } from 'react';

export const useTTS = () => {
    const [isMuted, setIsMuted] = useState(false);

    const speak = useCallback((text, onEnd) => {
        if (isMuted) {
            // Skip TTS but still call callback after short delay
            setTimeout(() => { if (onEnd) onEnd(); }, 300);
            return;
        }

        if (!('speechSynthesis' in window)) {
            console.warn('Browser does not support TTS');
            if (onEnd) onEnd();
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => { if (onEnd) onEnd(); };
        utterance.onerror = () => { if (onEnd) onEnd(); };

        window.speechSynthesis.speak(utterance);
    }, [isMuted]);

    const cancel = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    return { speak, cancel, isMuted, toggleMute };
};
