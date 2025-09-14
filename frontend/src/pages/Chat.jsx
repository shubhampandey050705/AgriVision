import { useState } from "react";
import { useTranslation } from "react-i18next";
import ChatBubble from "../components/ChatBubble";
import useSpeech from "../hooks/useSpeech";
import { chatWithBot } from "../utils/api";

// 👇 you're in /pages, so go UP one level to /components/ui
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Mic, Square, SendHorizontal } from "lucide-react";

export default function Chat() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { listening, transcript, start, stop } = useSpeech(
    i18n.language === "hi" ? "hi-IN" : "en-US"
  );

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg) return;
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    try {
      const res = await chatWithBot(msg, i18n.language);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res?.reply || "…" },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "API not reachable (plug in your backend)." },
      ]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="h-[60vh] overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3 bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
        {messages.map((m, i) => (
          <ChatBubble key={i} role={m.role}>
            {m.content}
          </ChatBubble>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          placeholder={t("labels.askAnything")}
          value={listening ? transcript : input}
          onChange={(e) => setInput(e.target.value)}
        />

        {/* 🎤 Speak button */}
        {!listening ? (
          <Button
            onClick={start}
            className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition flex items-center"
          >
            <Mic className="w-4 h-4 mr-1.5" /> {t("actions.speak")}
          </Button>
        ) : (
          /* ⏹ Stop button */
          <Button
            onClick={() => {
              stop();
              setInput(transcript);
            }}
            className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition flex items-center"
          >
            <Square className="w-4 h-4 mr-1.5" /> {t("actions.stop")}
          </Button>
        )}

        {/* 📤 Send button */}
        <Button
          onClick={() => send(listening ? transcript : input)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition flex items-center"
        >
          <SendHorizontal className="w-4 h-4 mr-1.5" /> Send
        </Button>
      </div>
    </div>
  );
}
