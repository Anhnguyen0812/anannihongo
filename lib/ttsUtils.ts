export const speakJapanese = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('Speech synthesis not supported');
        return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.7; // Slower for learning
    utterance.pitch = 0.9; // Slightly lower pitch for male-like voice

    // Try to find a male Japanese voice
    const voices = window.speechSynthesis.getVoices();
    const maleJapaneseVoice = voices.find(voice =>
        voice.lang.startsWith('ja') &&
        (voice.name.toLowerCase().includes('male') ||
            voice.name.toLowerCase().includes('otoko') ||
            voice.name.includes('Ichiro') ||
            voice.name.includes('Takumi'))
    );

    if (maleJapaneseVoice) {
        utterance.voice = maleJapaneseVoice;
    } else {
        // Fallback: just use any Japanese voice
        const anyJapaneseVoice = voices.find(voice => voice.lang.startsWith('ja'));
        if (anyJapaneseVoice) {
            utterance.voice = anyJapaneseVoice;
        }
    }

    window.speechSynthesis.speak(utterance);
};

// Ensure voices are loaded (some browsers load async)
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded
    };
}
