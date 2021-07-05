const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();

    for (let i = 0; i < voices.length; i++) {
        const voice = voices[i];

        if (voice.voiceURI === 'Google UK English Male') {
            return voice;
        }
    }

    for (let i = 0; i < voices.length; i++) {
        const voice = voices[i];

        if (voice.lang === 'en-US') {
            return voice;
        }
    }
};

const say = (text, onComplete) => {
    if (window.speechSynthesis.speaking) {
        return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = getVoice();
        utterance.onend = () => onComplete();

        window.speechSynthesis.speak(utterance);
    };
};

export default say;
