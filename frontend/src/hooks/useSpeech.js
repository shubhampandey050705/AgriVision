// src/hooks/useSpeech.js
import { useEffect, useRef, useState } from "react";

export default function useSpeech(locale = "hi-IN") {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = locale;
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (e) => {
      let text = "";
      for (const res of e.results) text += res[0].transcript;
      setTranscript(text);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
  }, [locale]);

  const start = () => {
    if (recRef.current && !listening) {
      setTranscript("");
      recRef.current.start();
      setListening(true);
    }
  };

  const stop = () => {
    if (recRef.current && listening) {
      recRef.current.stop();
    }
  };

  return { listening, transcript, start, stop };
}
