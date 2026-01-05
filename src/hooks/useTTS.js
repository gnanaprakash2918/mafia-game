import { useCallback } from 'react';

export const useTTS = () => {
    const speak = useCallback((text, onEnd) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Browser does not support TTS');
            if (onEnd) onEnd();
            return;
        }

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for dramatic effect
        utterance.pitch = 1;

        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const cancel = useCallback(() => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { speak, cancel };
};
