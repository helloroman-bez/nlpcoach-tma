import { useState, useEffect, useRef } from "react";

const BACKEND = "https://nlpcoach-production.up.railway.app";

const EXERCISES = [
  {
    id: "reframe", title: "Рефрейминг", emoji: "🔄", color: "#6366f1",
    steps: [
      "Опиши ситуацию, которая тебя беспокоит или кажется проблемой.",
      "Как ты сейчас воспринимаешь эту ситуацию? Какой смысл ты ей придаёшь?",
      "В каком другом контексте это же поведение/ситуация было бы полезным?",
      "Какое позитивное намерение стоит за этой ситуацией?",
      "Как изменится твоё отношение, если смотреть на это через линзу возможности?",
      "Запиши новую рамку восприятия этой ситуации."
    ]
  },
  {
    id: "beliefs", title: "Работа с убеждениями", emoji: "💡", color: "#f59e0b",
    steps: [
      "Какое убеждение тебя ограничивает? Начни с «Я не могу...», «Это невозможно...»",
      "Откуда взялось это убеждение? Когда ты принял его как истину?",
      "Какие доказательства есть, что это убеждение — НЕ абсолютная истина?",
      "Как бы ты действовал, если бы этого убеждения не было?",
      "Какое новое убеждение поддержит тебя лучше? Сформулируй позитивно.",
      "Запиши 3 действия, которые подтвердят новое убеждение уже сегодня."
    ]
  },
  {
    id: "timeline", title: "Линия времени", emoji: "⏳", color: "#10b981",
    steps: [
      "Представь свою линию времени. Где прошлое, где будущее?",
      "Выбери событие из прошлого, которое влияет на тебя сейчас. Опиши его.",
      "Поднимись над этим событием. Что видишь с высоты? Какой урок оно несёт?",
      "Какой ресурс или мудрость хочешь забрать из прошлого в настоящее?",
      "Перенесись в желаемое будущее через 1 год. Что видишь, слышишь, чувствуешь?",
      "Что нужно сделать сегодня, чтобы двигаться туда?"
    ]
  },
  {
    id: "submodalities", title: "Субмодальности", emoji: "🎨", color: "#ec4899",
    steps: [
      "Подумай о состоянии, которое хочешь изменить. Как оно выглядит внутри?",
      "Образ цветной или ч/б? Яркий или тусклый? Близко или далеко?",
      "Есть ли звуки или голоса? Громкие или тихие? Откуда исходят?",
      "Какие ощущения в теле? Где они? Какого размера и формы?",
      "Измени одну субмодальность: сделай образ меньше, дальше, темнее. Что изменилось?",
      "Создай образ желаемого состояния — яркий, большой, близкий. Шагни в него."
    ]
  }
];

function buildSystemPrompt(user) {
  return `Ты — профессиональный NLP-коуч с глубокой экспертизой в работе с мышлением.
Ты работаешь с пользователем по имени ${user.first_name}${user.last_name ? " " + user.last_name : ""}.
Техники: рефрейминг, работа с убеждениями, линия времени, субмодальности.
Стиль: коротко, ясно, один вопрос за раз, НЛП-паттерны языка, веди к инсайту через вопросы.
Отвечай на русском языке.
Начни с тёплого приветствия по имени и спроси с чем хочет поработать сегодня.`;
}

function ChatMessage({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 12 }}>
      {!isUser && <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 8, flexShrink: 0 }}>🧠</div>}
      <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: isUser ? "linear-gradient(135deg,#6366f1,#818cf8)" : "rgba(255,255,255,0.07)", color: "#f1f5f9", fontSize: 14, lineHeight: 1.6, border: isUser ? "none" : "1px solid rgba(255,255,255,0.1)" }}>
        {msg.content}
      </div>
    </div>
  );
}

function ExerciseModal({ ex, onClose, onSave }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(ex.steps.length).fill(""));
  const done = step === ex.steps.length;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
      <div style={{ background: "#1e1b4b", borderRadius: 20, padding: 24, maxWidth: 480, width: "100%", border: `1px solid ${ex.color}44`, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 28 }}>{ex.emoji}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#f1f5f9" }}>{ex.title}</div>
            {!done && <div style={{ fontSize: 12, color: "#94a3b8" }}>Шаг {step + 1} из {ex.steps.length}</div>}
          </div>
        </div>
        {!done ? (
          <>
            <div style={{ background: `${ex.color}22`, border: `1px solid ${ex.color}44`, borderRadius: 12, padding: 16, marginBottom: 16, color: "#e2e8f0", fontSize: 14, lineHeight: 1.6 }}>{ex.steps[step]}</div>
            <textarea value={answers[step]} onChange={e => { const a = [...answers]; a[step] = e.target.value; setAnswers(a); }} placeholder="Твой ответ..."
              style={{ width: "100%", minHeight: 100, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: 12, color: "#f1f5f9", fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", cursor: "pointer" }}>Закрыть</button>
              {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", cursor: "pointer" }}>←</button>}
              <button onClick={() => setStep(s => s + 1)} style={{ flex: 2, padding: "10px", borderRadius: 10, background: `linear-gradient(135deg,${ex.color},${ex.color}aa)`, border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                {step === ex.steps.length - 1 ? "Завершить ✓" : "Далее →"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 12, padding: 16, marginBottom: 16, color: "#6ee7b7", textAlign: "center" }}>🎉 Упражнение завершено!</div>
            {ex.steps.map((q, i) => answers[i] && (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>Шаг {i + 1}</div>
                <div style={{ fontSize: 13, color: "#e2e8f0", background: "rgba(255,255,255,0.04)", padding: "8px 12px", borderRadius: 8 }}>{answers[i]}</div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", cursor: "pointer" }}>Закрыть</button>
              <button onClick={() => onSave({ exercise: ex.title, emoji: ex.emoji, answers, steps: ex.steps, date: new Date().toISOString() })}
                style={{ flex: 2, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,#10b981,#059669)", border: "none", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                Сохранить в дневник
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PaywallScreen({ user, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const tg = window.Telegram?.WebApp;

  function handleSubscribe() {
    // Закрываем Mini App и отправляем пользователя к боту для оплаты
    tg?.close();
    // Бот при /subscribe отправит invoice
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f0c29,#302b63,#24243e)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "'Inter',sans-serif" }}>
      <div style={{ maxWidth: 380, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🧠</div>
        <div style={{ fontWeight: 800, fontSize: 24, background: "linear-gradient(135deg,#a5b4fc,#f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8 }}>NLP Коуч</div>
        <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 32, lineHeight: 1.6 }}>
          Привет, {user?.first_name}! 👋<br />
          Для доступа к коучу нужна подписка.
        </div>

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Что входит в подписку:</div>
          {["💬 AI-коуч с НЛП техниками", "🧩 4 структурированных упражнения", "📓 Дневник инсайтов", "🔄 Неограниченные сессии"].map(f => (
            <div key={f} style={{ fontSize: 14, color: "#e2e8f0", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textAlign: "left" }}>{f}</div>
          ))}
          <div style={{ marginTop: 20, fontSize: 28, fontWeight: 800, color: "#f1f5f9" }}>100 ⭐️</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>в месяц · Telegram Stars</div>
        </div>

        <button onClick={handleSubscribe} style={{ width: "100%", padding: "16px", borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
          Оформить подписку ✨
        </button>
        <div style={{ fontSize: 12, color: "#475569", marginTop: 12 }}>
          После оплаты напиши боту /start чтобы открыть приложение
        </div>
      </div>
    </div>
  );
}

const TABS = ["Коуч", "Упражнения", "Дневник"];

export default function App() {
  const [subStatus, setSubStatus] = useState(null); // null=loading, false=no sub, true=active
  const [tgUser, setTgUser] = useState(null);
  const [initData, setInitData] = useState("");
  const [tab, setTab] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [journal, setJournal] = useState([]);
  const [activeEx, setActiveEx] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const user = tg.initDataUnsafe?.user;
      const data = tg.initData;
      setTgUser(user);
      setInitData(data);
      checkSubscription(data);
    } else {
      // Dev mode — нет Telegram
      setTgUser({ first_name: "Разработчик", id: 0 });
      setSubStatus(true);
    }

    // Загрузить дневник из localStorage
    try {
      const j = localStorage.getItem("nlp_journal");
      if (j) setJournal(JSON.parse(j));
    } catch {}
  }, []);

  async function checkSubscription(data) {
    try {
      const res = await fetch(`${BACKEND}/api/subscription`, {
        headers: { "x-telegram-init-data": data }
      });
      const json = await res.json();
      setSubStatus(json.active === true);
      if (json.active) startSession();
    } catch {
      setSubStatus(false);
    }
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function startSession() {
    if (!tgUser && subStatus !== true) return;
    setLoading(true);
    try {
      const user = tgUser || { first_name: "друг" };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(user), messages: [{ role: "user", content: "Начни сессию" }] })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || `Привет, ${user.first_name}! С чем поработаем?`;
      setMessages([{ role: "assistant", content: reply }]);
    } catch { setMessages([{ role: "assistant", content: "Привет! С чем поработаем сегодня?" }]); }
    setLoading(false);
  }

  async function send() {
    if (!input.trim() || loading) return;
    const user = tgUser || { first_name: "друг" };
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: buildSystemPrompt(user), messages: newMsgs.map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      const reply = data.content?.find(b => b.type === "text")?.text || "...";
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch { setMessages(m => [...m, { role: "assistant", content: "Ошибка. Попробуй ещё раз." }]); }
    setLoading(false);
  }

  function saveExercise(entry) {
    const updated = [{ ...entry, id: Date.now() }, ...journal];
    setJournal(updated);
    setActiveEx(null);
    try { localStorage.setItem("nlp_journal", JSON.stringify(updated)); } catch {}
  }

  // Loading
  if (subStatus === null) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f0c29,#302b63,#24243e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#6366f1", fontSize: 32 }}>🧠</div>
      </div>
    );
  }

  // Paywall
  if (subStatus === false) {
    return <PaywallScreen user={tgUser} />;
  }

  // Main App
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#0f0c29,#302b63,#24243e)", fontFamily: "'Inter',sans-serif", color: "#f1f5f9" }}>
      <div style={{ padding: "16px 16px 0", textAlign: "center" }}>
        <div style={{ fontWeight: 800, fontSize: 18, background: "linear-gradient(135deg,#a5b4fc,#f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🧠 NLP Коуч</div>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>{tgUser?.first_name}</div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 12, padding: 4, maxWidth: 320, margin: "0 auto" }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "none", background: tab === i ? "rgba(255,255,255,0.15)" : "transparent", color: tab === i ? "#f1f5f9" : "#64748b", fontWeight: tab === i ? 600 : 400, fontSize: 13, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 14px 100px" }}>
        {tab === 0 && (
          <div>
            <div style={{ minHeight: 400, marginBottom: 12 }}>
              {messages.map((m, i) => <ChatMessage key={i} msg={m} />)}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center" }}>🧠</div>
                  <div style={{ padding: "10px 16px", background: "rgba(255,255,255,0.07)", borderRadius: "18px 18px 18px 4px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <span style={{ display: "inline-flex", gap: 4 }}>{[0,1,2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block", animation: `bounce 1s ${d*0.2}s infinite` }} />)}</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Напиши свой ответ..."
                style={{ flex: 1, minHeight: 48, maxHeight: 120, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "12px 14px", color: "#f1f5f9", fontSize: 14, resize: "none", boxSizing: "border-box" }} />
              <button onClick={send} disabled={loading || !input.trim()} style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#6366f1,#ec4899)", border: "none", color: "#fff", fontSize: 20, cursor: "pointer", flexShrink: 0, opacity: loading || !input.trim() ? 0.5 : 1 }}>↑</button>
            </div>
            <button onClick={() => { setMessages([]); startSession(); }} style={{ marginTop: 10, width: "100%", padding: "8px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#475569", fontSize: 12, cursor: "pointer" }}>🔄 Новая сессия</button>
          </div>
        )}

        {tab === 1 && (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 4 }}>Выбери технику для самостоятельной работы</div>
            {EXERCISES.map(ex => (
              <div key={ex.id} onClick={() => setActiveEx(ex)} style={{ background: `${ex.color}11`, border: `1px solid ${ex.color}33`, borderRadius: 16, padding: 20, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{ex.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>{ex.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{ex.steps.length} шагов · ~10 минут</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: ex.color, fontSize: 20 }}>→</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 2 && (
          <div>
            {journal.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📓</div>
                <div style={{ fontSize: 15 }}>Дневник пуст</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>Завершай упражнения и сохраняй инсайты</div>
              </div>
            ) : journal.map(entry => (
              <div key={entry.id} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 18, marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{entry.emoji} {entry.exercise}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{new Date(entry.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</div>
                </div>
                {entry.steps?.map((q, i) => entry.answers[i] && (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#6366f1", marginBottom: 3 }}>Шаг {i + 1}: {q.substring(0, 50)}...</div>
                    <div style={{ fontSize: 13, color: "#cbd5e1", paddingLeft: 8, borderLeft: "2px solid #6366f133" }}>{entry.answers[i]}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeEx && <ExerciseModal ex={activeEx} onClose={() => setActiveEx(null)} onSave={saveExercise} />}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
    </div>
  );
}
