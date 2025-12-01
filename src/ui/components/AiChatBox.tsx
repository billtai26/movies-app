import React, { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { MessageCircle } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  movies?: any[];
  quickOptions?: string[];
};

export default function AiChatBox() {
  const { user } = useAuth();
  const userId = user?._id;

  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);

  // Load history
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      const res = await api.aiHistory(userId);
      setMessages(res || []);
    };
    load();
  }, [userId]);

  // Auto scroll
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Send message
  const sendMessage = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim()) return;

    setInput("");

    const userMsg: ChatMessage = {
      role: "user",
      content: text
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await api.aiChat(userId, text);
      const reply = data.reply;

      let content = reply;
      let movies: any[] | undefined;
      let quickOptions: string[] | undefined;

      // Parse MOVIES
      if (reply.includes("<<MOVIES>>")) {
        const [txt, json] = reply.split("<<MOVIES>>");
        content = txt.trim();
        movies = JSON.parse(json);
      }

      // Parse OPTIONS
      if (reply.includes("<<OPTIONS>>")) {
        const [txt, json] = reply.split("<<OPTIONS>>");
        content = txt.trim();
        quickOptions = JSON.parse(json);
      }

      const botMsg: ChatMessage = {
        role: "assistant",
        content,
        movies,
        quickOptions
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <>
      {/* Button */}
      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {!minimized && (
        <div className="fixed bottom-6 right-6 w-96 h-[540px] bg-white rounded-xl shadow-xl flex flex-col z-50">

          {/* Header */}
          <div className="p-4 bg-purple-600 text-white rounded-t-xl flex items-center">
            <div>
              <p className="text-lg font-bold">Cinesta AI</p>
              <p className="text-xs opacity-80">Support • Assist • Recommend</p>
            </div>
            <button className="ml-auto" onClick={() => setMinimized(true)}>─</button>
          </div>

          {/* Messages */}
          <div ref={boxRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">

            {messages.map((msg, i) => (
              <div key={i}>
                {/* User */}
                {msg.role === "user" && (
                  <div className="flex justify-end">
                    <div className="px-3 py-2 bg-purple-600 text-white rounded-lg max-w-[75%]">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Assistant */}
                {msg.role === "assistant" && (
                  <div className="flex flex-col gap-2">
                    <div className="bg-gray-200 p-3 rounded-lg max-w-[80%]">
                      {msg.content}
                    </div>

                    {/* Quick Options */}
                    {msg.quickOptions && (
                      <div className="flex flex-wrap gap-2">
                        {msg.quickOptions.map((op, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(op)}
                            className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg text-xs hover:bg-purple-300"
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Movies */}
                    {msg.movies && msg.movies.map((m, idx) => (
                      <div key={idx} className="bg-white border rounded-xl p-3 flex gap-3 shadow">
                        {m.poster && (
                          <img src={m.poster} className="w-20 h-28 rounded-lg object-cover" />
                        )}

                        <div className="text-sm">
                          <p className="font-bold">{m.title}</p>
                          <p className="text-gray-600 text-xs">{m.genre} • ⭐ {m.rating}</p>

                          <div className="mt-2 flex gap-2">
                            <a
                              href={`/movies/${m.id}`}
                              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs"
                            >
                              Chi tiết
                            </a>

                            <a
                              href={`/booking/${m.id}`}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs"
                            >
                              Đặt vé
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <p className="text-xs text-gray-500 italic">Cinesta AI đang trả lời...</p>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi về phim, lịch chiếu..."
              className="flex-1 border p-2 rounded-lg text-sm"
            />

            <button
              onClick={() => sendMessage()}
              className="px-4 bg-purple-600 text-white rounded-lg"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
