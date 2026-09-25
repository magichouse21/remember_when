"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onTranscript: (text: string) => void;
};

// Minimal shape of the Web Speech API we need, since TypeScript's
// lib.dom.d.ts does not ship types for it.
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}
interface SpeechRecognitionLike extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
}

export default function VoiceRecorder({ onTranscript }: Props) {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Tracks whether the PERSON wants to keep listening (as opposed to the
  // browser engine pausing itself after a moment of silence, which it does
  // often even with continuous = true). onend/onerror check this ref
  // rather than the listening state to avoid stale closures, and restart
  // the engine automatically whenever the person hasn't tapped stop.
  const wantListeningRef = useRef(false);
  // Always holds the latest onTranscript function, without the recognition
  // engine's setup effect (below) needing to depend on it. onTranscript is
  // an inline callback from the parent that gets a new identity on every
  // render, and the parent re-renders on every transcribed word (since it
  // updates the textarea) — depending on it directly would tear down and
  // silently rebuild the recognizer after every single utterance.
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRecognitionCtor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let newText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          newText += result[0].transcript + " ";
        }
      }
      if (newText.trim()) {
        onTranscriptRef.current(newText.trim());
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" fires often — the browser just means "nothing heard
      // yet," not that anything went wrong. Keep going if the person still
      // wants to be listened to; onend will restart it a moment later.
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setNotice("Microphone access was blocked. Please allow microphone access and try again.");
        wantListeningRef.current = false;
        setListening(false);
      }
    };

    recognition.onend = () => {
      // The recognition engine stops itself periodically (after a pause,
      // or a browser-imposed time limit) even in continuous mode. If the
      // person hasn't tapped "stop," just start it right back up.
      if (wantListeningRef.current) {
        try {
          recognition.start();
        } catch {
          // Already starting/running — ignore.
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      wantListeningRef.current = false;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.abort();
    };
    // Intentionally empty: this sets up ONE recognizer for the component's
    // whole lifetime. See onTranscriptRef above for why.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!supported) {
    return (
      <p className="text-base text-warmbrown/70 italic">
        Voice typing isn&apos;t available in this browser. Please type your entry below.
      </p>
    );
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    setNotice(null);
    if (listening) {
      wantListeningRef.current = false;
      recognitionRef.current.stop();
      setListening(false);
    } else {
      wantListeningRef.current = true;
      try {
        recognitionRef.current.start();
      } catch {
        // Sometimes fires if start() is called while already starting;
        // it's already on its way, so there's nothing more to do.
      }
      setListening(true);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-lg font-semibold shadow transition ${
          listening
            ? "bg-blush text-white animate-pulse"
            : "bg-softblue text-white hover:opacity-90"
        }`}
        aria-pressed={listening}
      >
        <span aria-hidden>{listening ? "⏹" : "🎙️"}</span>
        {listening ? "Listening… tap to stop" : "Tap to talk instead of typing"}
      </button>
      {notice && <p className="text-base text-blush">{notice}</p>}
    </div>
  );
}
