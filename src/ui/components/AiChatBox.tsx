import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../store/auth";
import { MessageCircle, SendHorizonal, Minus, Popcorn, Ticket } from "lucide-react";

type MovieCard = {
  id?: string;
  title?: string;
  poster?: string;
  genre?: string;
  rating?: number | string;
};

type ComboCard = {
  id?: string;
  name?: string;
  price?: number | string;
  items?: any[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  movies?: MovieCard[];
  combos?: ComboCard[];
  quickOptions?: string[];
};

// ✅ FIX CHẮC ĂN: bracket-matching, không dùng regex
function extractTaggedJsonArray(reply: string, tag: string) {
  const idx = reply.indexOf(tag);
  if (idx === -1) return { cleaned: reply, data: null };

  const after = reply.slice(idx + tag.length);

  const start = after.indexOf("[");
  if (start === -1) return { cleaned: reply, data: null };

  let i = start;
  let depth = 0;
  let end = -1;

  while (i < after.length) {
    const ch = after[i];
    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
    i++;
  }

  if (end === -1) return { cleaned: reply, data: null };

  const jsonText = after.slice(start, end + 1);

  // remove: tag + (any text before '[') + json array
  const fullSegment = tag + after.slice(0, end + 1);
  const cleaned = reply.replace(fullSegment, "").trim();

  try {
    const data = JSON.parse(jsonText);
    return { cleaned, data };
  } catch {
    return { cleaned: reply, data: null };
  }
}

export default function AiChatBox() {
  const { user } = useAuth();
  const userId = user?._id;

  // ✅ mặc định mở sẵn; user có thể thu nhỏ
  const [minimized, setMinimized] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);

  const defaultQuick = useMemo(
    () => [
      "Phim đang chiếu",
      "Gợi ý phim hài",
      "Có combo bắp nước không?",
      "Tư vấn phim cho tôi",
    ],
    []
  );

  // Load history
  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const res = await api.aiHistory(userId);
        setMessages((res || []).map((x: any) => ({ role: x.role, content: x.content })));
      } catch {
        setMessages([]);
      }
    };
    load();
  }, [userId]);

  // Auto scroll
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (msg?: string) => {
    const text = (msg ?? input).trim();
    if (!text) return;

    setInput("");

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const data = await api.aiChat(userId, text);
      const reply = String(data?.reply ?? "").trim();

      let content = reply;

      // Parse MOVIES first
      const m1 = extractTaggedJsonArray(content, "<<MOVIES>>");
      content = m1.cleaned;
      const movies = Array.isArray(m1.data) ? (m1.data as MovieCard[]) : undefined;

      // Parse COMBOS
      const c1 = extractTaggedJsonArray(content, "<<COMBOS>>");
      content = c1.cleaned;
      const combos = Array.isArray(c1.data) ? (c1.data as ComboCard[]) : undefined;

      // Parse OPTIONS (nếu m dùng)
      const o1 = extractTaggedJsonArray(content, "<<OPTIONS>>");
      content = o1.cleaned;
      const quickOptions = Array.isArray(o1.data) ? (o1.data as string[]) : undefined;

      if (!content && (movies?.length || combos?.length)) {
        content = movies?.length ? "Đây là vài phim phù hợp với bạn:" : "Đây là các combo hiện có:";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: content || "Mình chưa hiểu ý bạn, bạn nói rõ hơn được không?",
          movies,
          combos,
          quickOptions,
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Xin lỗi, hệ thống đang lỗi. Bạn thử lại sau nhé." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault?.();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:opacity-95 active:scale-95 z-50"
          aria-label="Open AI Chat"
        >
          <MessageCircle size={26} />
        </button>
      )}

      {!minimized && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-purple-700 to-indigo-600 text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
              <MessageCircle size={20} />
            </div>
            <div className="leading-tight">
              <p className="text-base font-bold">Cinesta AI</p>
              <p className="text-[11px] opacity-90">Support • Assist • Recommend</p>
            </div>

            <button
              className="ml-auto p-2 rounded-lg hover:bg-white/10"
              onClick={() => setMinimized(true)}
              aria-label="Minimize"
              title="Thu gọn"
            >
              <Minus size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={boxRef}
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-3 bg-slate-50"
          >
            {messages.length === 0 && (
              <div className="bg-white border rounded-xl p-3 text-sm">
                <p className="font-semibold text-slate-800">Bạn muốn mình giúp gì?</p>
                <p className="text-xs text-slate-600 mt-1">
                  Mình có thể gợi ý phim, thông tin phim, hoặc combo bắp nước.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {defaultQuick.map((op, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(op)}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs hover:bg-purple-100"
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="space-y-2">
                {/* User */}
                {msg.role === "user" && (
                  <div className="flex justify-end">
                    <div className="max-w-[78%] px-3 py-2 bg-purple-600 text-white rounded-2xl rounded-br-md shadow-sm text-sm break-words whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Assistant */}
                {msg.role === "assistant" && (
                  <div className="flex flex-col gap-2">
                    <div className="max-w-[82%] bg-white border px-3 py-2 rounded-2xl rounded-bl-md shadow-sm text-sm text-slate-800 break-words whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Quick Options */}
                    {msg.quickOptions && msg.quickOptions.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-w-[82%]">
                        {msg.quickOptions.map((op, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(op)}
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs hover:bg-purple-100"
                          >
                            {op}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Movies */}
                    {msg.movies && msg.movies.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="h-[1px] flex-1 bg-slate-200" />
                          <span>Phim gợi ý</span>
                          <span className="h-[1px] flex-1 bg-slate-200" />
                        </div>

                        {msg.movies.map((m, idx) => (
                          <div
                            key={idx}
                            className="bg-white border rounded-2xl p-3 flex gap-3 shadow-sm overflow-hidden"
                          >
                            <div className="w-20 h-28 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              {m.poster ? (
                                <img src={m.poster} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                                  No poster
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-slate-900 truncate">{m.title}</p>
                              <p className="text-slate-600 text-xs mt-0.5">
                                {(m.genre || "Đa thể loại")} • ⭐ {m.rating ?? "N/A"}
                              </p>

                              <div className="mt-2 flex gap-2 flex-wrap">
                                <a
                                  href={m.id ? `/movies/${m.id}` : "#"}
                                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:opacity-95"
                                >
                                  Chi tiết
                                </a>

                                <a
                                  href={m.id ? `/booking/${m.id}` : "#"}
                                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:opacity-95 flex items-center gap-1"
                                >
                                  <Ticket size={14} /> Đặt vé
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Combos */}
                    {msg.combos && msg.combos.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="h-[1px] flex-1 bg-slate-200" />
                          <span>Combo bắp nước</span>
                          <span className="h-[1px] flex-1 bg-slate-200" />
                        </div>

                        {msg.combos.map((c, idx) => {
                          const price =
                            typeof c.price === "number"
                              ? c.price.toLocaleString("vi-VN")
                              : (c.price ?? "Liên hệ");

                          return (
                            <div
                              key={idx}
                              className="bg-white border rounded-2xl p-3 flex gap-3 shadow-sm overflow-hidden"
                            >
                              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                <Popcorn size={18} className="text-indigo-600" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="font-bold text-sm text-slate-900 truncate">
                                    {c.name || "Combo"}
                                  </p>
                                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg whitespace-nowrap">
                                    {price}đ
                                  </span>
                                </div>

                                {Array.isArray(c.items) && c.items.length > 0 && (
                                  <ul className="mt-1 text-xs text-slate-600 list-disc pl-4">
                                    {c.items.slice(0, 3).map((it: any, k: number) => (
                                      <li key={k} className="break-words">
                                        {it?.name || it?.title || String(it)}
                                      </li>
                                    ))}
                                  </ul>
                                )}

                                <div className="mt-2 flex gap-2 flex-wrap">
                                  <a
                                    href="/booking/combos"
                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:opacity-95"
                                  >
                                    Xem combo
                                  </a>
                                  <a
                                    href="/checkout"
                                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs hover:opacity-95"
                                  >
                                    Đi đến thanh toán
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="max-w-[82%] bg-white border px-3 py-2 rounded-2xl rounded-bl-md shadow-sm text-sm text-slate-600 italic">
                Cinesta AI đang trả lời...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Hỏi về phim, lịch chiếu, combo bắp nước..."
                className="flex-1 border px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-200"
              />
              <button
                onClick={() => sendMessage()}
                className="px-3 py-2 bg-purple-600 text-white rounded-xl hover:opacity-95 active:scale-[0.98] flex items-center gap-2"
                aria-label="Send"
              >
                <SendHorizonal size={18} />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Tip: hỏi “phim đang chiếu” hoặc “có combo bắp nước không”.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
