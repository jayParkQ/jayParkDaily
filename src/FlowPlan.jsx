import { useState, useEffect, useRef, useCallback } from "react";

const COLORS = {
  bg: "#0a0b0f",
  surface: "#12141a",
  card: "#1a1d26",
  cardHover: "#1f2230",
  border: "#252836",
  accent: "#6c63ff",
  accentLight: "#8b83ff",
  accentGlow: "rgba(108,99,255,0.15)",
  green: "#22d3a0",
  amber: "#f5a623",
  red: "#ff5f7e",
  blue: "#38bdf8",
  textPrimary: "#f0f2f8",
  textSecondary: "#8b90a8",
  textMuted: "#555b72",
};

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');`;

const GlobalStyle = () => (
  <style>{`
    ${GOOGLE_FONTS}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${COLORS.bg}; color: ${COLORS.textPrimary}; font-family: 'DM Sans', sans-serif; min-height: 100vh; }
    ::-webkit-scrollbar { width: 6px; } 
    ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
    ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${COLORS.accent}; }
    input, textarea, select { outline: none; font-family: 'DM Sans', sans-serif; }
    button { cursor: pointer; font-family: 'DM Sans', sans-serif; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes glow { 0%,100% { box-shadow: 0 0 20px rgba(108,99,255,0.3); } 50% { box-shadow: 0 0 40px rgba(108,99,255,0.6); } }
    @keyframes timerPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.02); } }
    @keyframes slideIn { from { opacity:0; transform: translateX(-20px); } to { opacity:1; transform: translateX(0); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

    .fade-in { animation: fadeIn 0.4s ease forwards; }
    .slide-in { animation: slideIn 0.3s ease forwards; }
    .animate-delay-1 { animation-delay: 0.1s; opacity: 0; }
    .animate-delay-2 { animation-delay: 0.2s; opacity: 0; }
    .animate-delay-3 { animation-delay: 0.3s; opacity: 0; }

    .loading-shimmer {
      background: linear-gradient(90deg, ${COLORS.card} 25%, ${COLORS.cardHover} 50%, ${COLORS.card} 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }
  `}</style>
);

// ── Shared UI Components ──────────────────────────────────────────────────────

const Btn = ({ children, onClick, variant = "primary", size = "md", disabled, style = {} }) => {
  const base = {
    border: "none", borderRadius: 10, fontFamily: "'DM Sans'", fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", display: "inline-flex",
    alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1,
    ...(size === "sm" ? { padding: "6px 14px", fontSize: 13 } : size === "lg" ? { padding: "14px 28px", fontSize: 16 } : { padding: "10px 20px", fontSize: 14 }),
  };
  const variants = {
    primary: { background: COLORS.accent, color: "#fff" },
    ghost: { background: "transparent", color: COLORS.textSecondary, border: `1px solid ${COLORS.border}` },
    danger: { background: "rgba(255,95,126,0.15)", color: COLORS.red, border: `1px solid rgba(255,95,126,0.3)` },
    success: { background: "rgba(34,211,160,0.15)", color: COLORS.green, border: `1px solid rgba(34,211,160,0.3)` },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = "1"; }}>
      {children}
    </button>
  );
};

const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{
    background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16,
    padding: 20, ...style
  }}>{children}</div>
);

const Badge = ({ children, color = COLORS.accent }) => (
  <span style={{
    background: `${color}22`, color, border: `1px solid ${color}44`,
    borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600, letterSpacing: 0.3
  }}>{children}</span>
);

const Input = ({ value, onChange, placeholder, style = {}, multiline, rows = 3 }) => {
  const base = {
    background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10,
    color: COLORS.textPrimary, padding: "10px 14px", fontSize: 14, width: "100%",
    transition: "border 0.2s", ...style
  };
  return multiline
    ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
        style={{ ...base, resize: "vertical" }}
        onFocus={e => e.target.style.borderColor = COLORS.accent}
        onBlur={e => e.target.style.borderColor = COLORS.border} />
    : <input value={value} onChange={onChange} placeholder={placeholder} style={base}
        onFocus={e => e.target.style.borderColor = COLORS.accent}
        onBlur={e => e.target.style.borderColor = COLORS.border} />;
};

const ProgressBar = ({ value, max = 100, color = COLORS.accent, height = 6 }) => (
  <div style={{ background: COLORS.surface, borderRadius: 100, height, overflow: "hidden", width: "100%" }}>
    <div style={{
      width: `${Math.min((value / max) * 100, 100)}%`, height: "100%",
      background: color, borderRadius: 100, transition: "width 0.5s ease"
    }} />
  </div>
);

const Spinner = () => (
  <div style={{
    width: 18, height: 18, border: `2px solid ${COLORS.border}`,
    borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.7s linear infinite"
  }} />
);

// ── Navigation ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "planner", icon: "📅", label: "Daily Planner" },
  { id: "goals", icon: "🎯", label: "Goals" },
  { id: "focus", icon: "🎯", label: "Focus Mode" },
  { id: "habits", icon: "✅", label: "Habits" },
  { id: "analytics", icon: "📊", label: "Analytics" },
  { id: "assistant", icon: "🤖", label: "AI Assistant" },
];

const Sidebar = ({ active, setActive }) => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside style={{
      width: collapsed ? 72 : 220, background: COLORS.surface,
      borderRight: `1px solid ${COLORS.border}`, display: "flex", flexDirection: "column",
      transition: "width 0.3s ease", flexShrink: 0, minHeight: "100vh", position: "sticky", top: 0
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 16px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: COLORS.accent, borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, flexShrink: 0, animation: "glow 3s ease-in-out infinite"
          }}>⚡</div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 17, color: COLORS.textPrimary }}>FlowPlan</div>
              <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: -2 }}>AI Productivity OS</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px" }}>
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            width: "100%", padding: collapsed ? "12px" : "11px 14px",
            background: active === item.id ? COLORS.accentGlow : "transparent",
            border: active === item.id ? `1px solid ${COLORS.accent}44` : "1px solid transparent",
            borderRadius: 10, color: active === item.id ? COLORS.accentLight : COLORS.textSecondary,
            display: "flex", alignItems: "center", gap: 10, marginBottom: 4,
            fontSize: 14, fontWeight: active === item.id ? 600 : 400, cursor: "pointer",
            transition: "all 0.2s", justifyContent: collapsed ? "center" : "flex-start"
          }}
            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = COLORS.card; }}
            onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: 17 }}>{item.icon}</span>
            {!collapsed && item.label}
          </button>
        ))}
      </nav>

      {/* Collapse btn */}
      <button onClick={() => setCollapsed(!collapsed)} style={{
        margin: "8px", padding: "10px", background: COLORS.card, border: `1px solid ${COLORS.border}`,
        borderRadius: 10, color: COLORS.textMuted, cursor: "pointer", fontSize: 13, transition: "all 0.2s"
      }}>
        {collapsed ? "→" : "← Collapse"}
      </button>
    </aside>
  );
};

// ── AI Helper ─────────────────────────────────────────────────────────────────

async function callAI(prompt, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt || "You are FlowPlan AI, a productivity assistant. Always respond in Vietnamese. Be concise and practical.",
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

async function callAIJSON(prompt, systemPrompt) {
  const text = await callAI(prompt, systemPrompt + "\n\nRespond ONLY with valid JSON, no markdown, no backticks, no explanation.");
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch { return null; }
}

// ── Daily Planner ─────────────────────────────────────────────────────────────

const MOODS = [
  { id: "energized", label: "Nhiều năng lượng", emoji: "⚡", color: COLORS.green },
  { id: "focused", label: "Tập trung", emoji: "🎯", color: COLORS.accent },
  { id: "tired", label: "Mệt mỏi", emoji: "😴", color: COLORS.amber },
  { id: "stressed", label: "Căng thẳng", emoji: "😤", color: COLORS.red },
];

const DailyPlanner = () => {
  const [tasks, setTasks] = useState([
    { id: 1, name: "Học React Hooks", duration: 90, priority: "high", done: false, note: "" },
    { id: 2, name: "Review code Pull Request", duration: 45, priority: "medium", done: false, note: "" },
    { id: 3, name: "Viết báo cáo tuần", duration: 60, priority: "low", done: true, note: "Đã gửi email" },
  ]);
  const [newTask, setNewTask] = useState({ name: "", duration: 30, priority: "medium" });
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("focused");
  const [startTime, setStartTime] = useState("08:00");

  const totalDone = tasks.filter(t => t.done).length;
  const progress = tasks.length ? Math.round((totalDone / tasks.length) * 100) : 0;

  const addTask = () => {
    if (!newTask.name.trim()) return;
    setTasks(t => [...t, { ...newTask, id: Date.now(), done: false, note: "" }]);
    setNewTask({ name: "", duration: 30, priority: "medium" });
  };

  const removeTask = (id) => setTasks(t => t.filter(x => x.id !== id));
  const toggleDone = (id) => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));

  const generateSchedule = async () => {
    setLoading(true);
    const moodLabel = MOODS.find(m => m.id === mood)?.label;
    const result = await callAIJSON(
      `Tạo lịch làm việc từ ${startTime} cho các task sau (trạng thái người dùng: ${moodLabel}):
${tasks.map(t => `- "${t.name}" (${t.duration} phút, ưu tiên: ${t.priority}${t.done ? ", đã hoàn thành" : ""})`).join("\n")}

Trả về JSON: { "schedule": [{ "time": "HH:MM", "endTime": "HH:MM", "task": "tên task hoặc Nghỉ ngơi", "type": "work|break", "tip": "mẹo ngắn" }], "summary": "tóm tắt ngắn", "totalFocusTime": số_phút }`,
      "You are a productivity planner AI. Respond only in Vietnamese. Include breaks every 90 minutes. Prioritize high-priority tasks first if user is energized."
    );
    setSchedule(result);
    setLoading(false);
  };

  const priorityColor = { high: COLORS.red, medium: COLORS.amber, low: COLORS.green };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Left */}
      <div>
        {/* Mood */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10, fontWeight: 600, letterSpacing: 1 }}>TRẠNG THÁI HÔM NAY</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {MOODS.map(m => (
              <button key={m.id} onClick={() => setMood(m.id)} style={{
                padding: "8px 14px", borderRadius: 10, border: `1px solid ${mood === m.id ? m.color : COLORS.border}`,
                background: mood === m.id ? `${m.color}22` : "transparent",
                color: mood === m.id ? m.color : COLORS.textSecondary, cursor: "pointer",
                fontSize: 13, display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s"
              }}>
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Add Task */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>THÊM CÔNG VIỆC</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input value={newTask.name} onChange={e => setNewTask(x => ({ ...x, name: e.target.value }))} placeholder="Tên công việc..." />
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Thời gian (phút)</div>
                <input type="number" value={newTask.duration} min={5} max={480}
                  onChange={e => setNewTask(x => ({ ...x, duration: +e.target.value }))}
                  style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textPrimary, padding: "10px 14px", fontSize: 14, width: "100%" }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Ưu tiên</div>
                <select value={newTask.priority} onChange={e => setNewTask(x => ({ ...x, priority: e.target.value }))}
                  style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textPrimary, padding: "10px 14px", fontSize: 14, width: "100%" }}>
                  <option value="high">🔴 Cao</option>
                  <option value="medium">🟡 Trung bình</option>
                  <option value="low">🟢 Thấp</option>
                </select>
              </div>
            </div>
            <Btn onClick={addTask} style={{ alignSelf: "flex-end" }}>+ Thêm Task</Btn>
          </div>
        </Card>

        {/* Task List */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, letterSpacing: 1 }}>DANH SÁCH ({tasks.length})</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{totalDone}/{tasks.length} hoàn thành</div>
          </div>
          <ProgressBar value={progress} color={COLORS.green} height={4} />
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {tasks.map((task, i) => (
              <div key={task.id} className="slide-in" style={{
                animationDelay: `${i * 0.05}s`, opacity: 0,
                background: COLORS.surface, borderRadius: 12, padding: "12px 14px",
                border: `1px solid ${task.done ? COLORS.green + "44" : COLORS.border}`,
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s"
              }}>
                <button onClick={() => toggleDone(task.id)} style={{
                  width: 22, height: 22, borderRadius: 6, border: `2px solid ${task.done ? COLORS.green : COLORS.border}`,
                  background: task.done ? COLORS.green : "transparent", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>{task.done && <span style={{ color: "#000", fontSize: 12, fontWeight: 700 }}>✓</span>}</button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, textDecoration: task.done ? "line-through" : "none", color: task.done ? COLORS.textMuted : COLORS.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>⏱ {task.duration} phút</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: priorityColor[task.priority], flexShrink: 0 }} />
                <button onClick={() => removeTask(task.id)} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", fontSize: 16, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right - Schedule */}
      <div>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4, fontWeight: 600, letterSpacing: 1 }}>GIỜ BẮT ĐẦU</div>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textPrimary, padding: "10px 14px", fontSize: 14, width: "100%" }} />
            </div>
            <Btn onClick={generateSchedule} disabled={loading || tasks.length === 0} size="lg">
              {loading ? <><Spinner /> Đang tạo...</> : "🤖 AI Lập Lịch"}
            </Btn>
          </div>
        </Card>

        {loading && (
          <Card>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="loading-shimmer" style={{ height: 60, borderRadius: 10 }} />
              ))}
              <div style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 13, animation: "pulse 1.5s infinite" }}>AI đang phân tích và tối ưu lịch của bạn...</div>
            </div>
          </Card>
        )}

        {schedule && !loading && (
          <Card className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 16 }}>📋 Lịch làm việc</div>
                <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{schedule.summary}</div>
              </div>
              <Badge color={COLORS.green}>{schedule.totalFocusTime} phút focus</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {schedule.schedule?.map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 12, padding: "12px 14px", borderRadius: 12,
                  background: item.type === "break" ? `${COLORS.green}11` : COLORS.surface,
                  border: `1px solid ${item.type === "break" ? COLORS.green + "33" : COLORS.border}`,
                  animation: `fadeIn 0.3s ease ${i * 0.08}s both`
                }}>
                  <div style={{ width: 80, flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: item.type === "break" ? COLORS.green : COLORS.accent }}>{item.time}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>→ {item.endTime}</div>
                  </div>
                  <div style={{ width: 2, background: item.type === "break" ? COLORS.green : COLORS.accent, borderRadius: 2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: COLORS.textPrimary }}>{item.task}</div>
                    {item.tip && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 3 }}>💡 {item.tip}</div>}
                  </div>
                  {item.type === "break" ? <span style={{ fontSize: 16 }}>☕</span> : <span style={{ fontSize: 16 }}>💼</span>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {!schedule && !loading && (
          <Card style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>AI sẵn sàng lên kế hoạch</div>
            <div style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1.6 }}>Thêm công việc của bạn và nhấn "AI Lập Lịch"<br />để nhận lịch trình được tối ưu hóa</div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ── Goals & Milestones ────────────────────────────────────────────────────────

const Goals = () => {
  const [goals, setGoals] = useState([
    { id: 1, title: "Trở thành Frontend Developer", deadline: "6 tháng", progress: 35, milestones: ["HTML/CSS ✅", "JavaScript ✅", "React 🔄", "Portfolio", "Dự án thực tế", "Apply công việc"] },
    { id: 2, title: "Học IELTS đạt 7.0", deadline: "4 tháng", progress: 20, milestones: ["Vocabulary", "Listening 🔄", "Reading", "Writing", "Speaking", "Mock Test"] },
  ]);
  const [newGoal, setNewGoal] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [roadmap, setRoadmap] = useState(null);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals(g => [...g, { id: Date.now(), title: newGoal, deadline: newDeadline || "3 tháng", progress: 0, milestones: [] }]);
    setNewGoal(""); setNewDeadline("");
  };

  const generateRoadmap = async (goal) => {
    setSelectedGoal(goal);
    setLoading(true);
    const result = await callAIJSON(
      `Tạo roadmap chi tiết cho mục tiêu: "${goal.title}" trong ${goal.deadline}.
Trả về JSON: { "phases": [{ "name": "Giai đoạn N", "duration": "X tuần", "tasks": ["task1","task2"], "milestone": "milestone chính", "color": "#hex" }], "dailyCommitment": "X giờ/ngày", "tips": ["tip1","tip2","tip3"] }`,
      "Bạn là productivity coach. Tạo roadmap thực tế, chi tiết bằng tiếng Việt."
    );
    setRoadmap(result);
    setLoading(false);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      <div>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>MỤC TIÊU MỚI</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Input value={newGoal} onChange={e => setNewGoal(e.target.value)} placeholder='VD: "Học machine learning trong 3 tháng"' />
            <Input value={newDeadline} onChange={e => setNewDeadline(e.target.value)} placeholder='Thời hạn (VD: "3 tháng", "1 năm")' />
            <Btn onClick={addGoal} style={{ alignSelf: "flex-end" }}>+ Thêm Mục Tiêu</Btn>
          </div>
        </Card>

        {goals.map((goal, i) => (
          <Card key={goal.id} className="fade-in" style={{ marginBottom: 12, animationDelay: `${i * 0.1}s`, cursor: "pointer", border: selectedGoal?.id === goal.id ? `1px solid ${COLORS.accent}` : `1px solid ${COLORS.border}` }}
            onClick={() => generateRoadmap(goal)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 15 }}>{goal.title}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>⏰ {goal.deadline}</div>
              </div>
              <Badge color={COLORS.accent}>{goal.progress}%</Badge>
            </div>
            <ProgressBar value={goal.progress} color={COLORS.accent} height={6} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {goal.milestones.slice(0, 4).map((m, j) => (
                <span key={j} style={{
                  fontSize: 11, padding: "3px 8px", background: COLORS.surface,
                  borderRadius: 6, color: m.includes("✅") ? COLORS.green : m.includes("🔄") ? COLORS.amber : COLORS.textMuted
                }}>{m}</span>
              ))}
              {goal.milestones.length > 4 && <span style={{ fontSize: 11, color: COLORS.textMuted }}>+{goal.milestones.length - 4} nữa</span>}
            </div>
            <div style={{ fontSize: 12, color: COLORS.accent, marginTop: 10, textAlign: "right" }}>🤖 Click để xem AI Roadmap →</div>
          </Card>
        ))}
      </div>

      <div>
        {loading && (
          <Card style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ width: 48, height: 48, border: `3px solid ${COLORS.border}`, borderTopColor: COLORS.accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <div style={{ color: COLORS.textMuted, animation: "pulse 1.5s infinite" }}>AI đang xây dựng roadmap...</div>
          </Card>
        )}

        {roadmap && !loading && selectedGoal && (
          <Card className="fade-in">
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 17 }}>🗺️ AI Roadmap</div>
              <div style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: 4 }}>{selectedGoal.title}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <Badge color={COLORS.green}>⏱ {roadmap.dailyCommitment}</Badge>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              {roadmap.phases?.map((phase, i) => (
                <div key={i} style={{ padding: "14px", background: COLORS.surface, borderRadius: 12, borderLeft: `3px solid ${phase.color || COLORS.accent}`, animation: `fadeIn 0.3s ease ${i * 0.1}s both` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: phase.color || COLORS.accent }}>{phase.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{phase.duration}</div>
                  </div>
                  <div style={{ fontSize: 13, color: COLORS.green, marginBottom: 6, fontWeight: 600 }}>🏆 {phase.milestone}</div>
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {phase.tasks?.map((task, j) => (
                      <li key={j} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 2 }}>{task}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {roadmap.tips && (
              <div style={{ padding: "12px 14px", background: `${COLORS.accent}11`, borderRadius: 10, border: `1px solid ${COLORS.accent}33` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, marginBottom: 8 }}>💡 MẸO TỪ AI</div>
                {roadmap.tips.map((tip, i) => <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 }}>• {tip}</div>)}
              </div>
            )}
          </Card>
        )}

        {!roadmap && !loading && (
          <Card style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Chọn một mục tiêu</div>
            <div style={{ color: COLORS.textMuted, fontSize: 14 }}>AI sẽ tạo roadmap chi tiết với các giai đoạn và milestone cụ thể</div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ── Focus Mode (Pomodoro) ─────────────────────────────────────────────────────

const FocusMode = () => {
  const [mode, setMode] = useState("work"); // work | break
  const [duration, setDuration] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [session, setSession] = useState(0);
  const [task, setTask] = useState("Làm việc tập trung");
  const [quote, setQuote] = useState("Hãy bắt đầu Pomodoro session của bạn 🚀");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "work") {
              setSession(s => s + 1);
              setMode("break");
              setTimeLeft(breakTime * 60);
            } else {
              setMode("work");
              setTimeLeft(duration * 60);
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, duration, breakTime]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const totalSecs = mode === "work" ? duration * 60 : breakTime * 60;
  const progressPct = ((totalSecs - timeLeft) / totalSecs) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progressPct / 100);

  const reset = () => { setRunning(false); setTimeLeft(duration * 60); setMode("work"); };

  const getMotivation = async () => {
    const q = await callAI(`Tạo một câu động viên ngắn (1-2 dòng) cho người đang làm task: "${task}". Ngắn gọn, truyền động lực.`, "Bạn là coach tích cực. Câu trả lời bằng tiếng Việt, dưới 30 từ.");
    setQuote(q);
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Timer Circle */}
      <Card style={{ textAlign: "center", padding: "40px 32px", marginBottom: 20, background: mode === "break" ? `${COLORS.green}11` : COLORS.card, border: `1px solid ${mode === "break" ? COLORS.green + "44" : COLORS.border}` }}>
        <div style={{ marginBottom: 16 }}>
          <Badge color={mode === "work" ? COLORS.accent : COLORS.green}>{mode === "work" ? "🎯 Focus Session" : "☕ Break Time"}</Badge>
          <span style={{ marginLeft: 12 }}><Badge color={COLORS.amber}>Session #{session + 1}</Badge></span>
        </div>

        <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
          <svg width={220} height={220} style={{ transform: "rotate(-90deg)", animation: running ? "timerPulse 2s ease-in-out infinite" : "none" }}>
            <circle cx={110} cy={110} r={radius} fill="none" stroke={COLORS.surface} strokeWidth={10} />
            <circle cx={110} cy={110} r={radius} fill="none"
              stroke={mode === "work" ? COLORS.accent : COLORS.green} strokeWidth={10}
              strokeDasharray={circumference} strokeDashoffset={dashOffset}
              strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 44, letterSpacing: -2, color: mode === "work" ? COLORS.accent : COLORS.green }}>{fmt(timeLeft)}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>{mode === "work" ? "Focus" : "Rest"}</div>
          </div>
        </div>

        <Input value={task} onChange={e => setTask(e.target.value)} placeholder="Task đang làm..." style={{ marginBottom: 16, textAlign: "center" }} />

        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
          <Btn onClick={() => setRunning(!running)} size="lg" variant={running ? "ghost" : "primary"}>
            {running ? "⏸ Dừng" : "▶ Bắt đầu"}
          </Btn>
          <Btn onClick={reset} variant="ghost" size="lg">↺ Reset</Btn>
          <Btn onClick={getMotivation} variant="ghost" size="lg">💬 Động lực</Btn>
        </div>

        <div style={{ background: `${COLORS.accent}11`, border: `1px solid ${COLORS.accent}22`, borderRadius: 10, padding: "12px 16px", color: COLORS.textSecondary, fontSize: 14, fontStyle: "italic", lineHeight: 1.6 }}>
          {quote}
        </div>
      </Card>

      {/* Settings */}
      <Card>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 14, fontWeight: 600, letterSpacing: 1 }}>⚙️ CÀI ĐẶT POMODORO</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 }}>Focus ({duration} phút)</div>
            <input type="range" min={10} max={60} step={5} value={duration}
              onChange={e => { if (!running) { setDuration(+e.target.value); setTimeLeft(+e.target.value * 60); } }}
              style={{ width: "100%", accentColor: COLORS.accent }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
              <span>10</span><span>60</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 }}>Break ({breakTime} phút)</div>
            <input type="range" min={3} max={20} step={1} value={breakTime}
              onChange={e => setBreakTime(+e.target.value)}
              style={{ width: "100%", accentColor: COLORS.green }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
              <span>3</span><span>20</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          {[
            { label: "Sessions", value: session, color: COLORS.accent },
            { label: "Focus time", value: `${session * duration}m`, color: COLORS.green },
            { label: "Break time", value: `${session * breakTime}m`, color: COLORS.amber },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: "12px", background: COLORS.surface, borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Habit Tracker ─────────────────────────────────────────────────────────────

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const Habits = () => {
  const [habits, setHabits] = useState([
    { id: 1, name: "Đọc sách", emoji: "📚", target: 30, unit: "phút", completedDays: [0, 1, 1, 1, 0, 1, 0], streak: 3, color: COLORS.accent },
    { id: 2, name: "Tập gym", emoji: "💪", target: 1, unit: "buổi", completedDays: [1, 0, 1, 0, 1, 1, 0], streak: 2, color: COLORS.green },
    { id: 3, name: "Uống nước", emoji: "💧", target: 8, unit: "ly", completedDays: [1, 1, 1, 1, 1, 0, 1], streak: 5, color: COLORS.blue },
    { id: 4, name: "Thiền", emoji: "🧘", target: 10, unit: "phút", completedDays: [0, 0, 1, 1, 0, 0, 1], streak: 1, color: COLORS.amber },
  ]);
  const [newHabit, setNewHabit] = useState({ name: "", emoji: "⭐", target: 1, unit: "lần" });

  const toggleDay = (habitId, dayIdx) => {
    setHabits(h => h.map(habit => {
      if (habit.id !== habitId) return habit;
      const days = [...habit.completedDays];
      days[dayIdx] = days[dayIdx] ? 0 : 1;
      const streak = days.slice().reverse().findIndex(d => !d);
      return { ...habit, completedDays: days, streak: streak === -1 ? 7 : streak };
    }));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) return;
    const colors = [COLORS.accent, COLORS.green, COLORS.amber, COLORS.red, COLORS.blue];
    setHabits(h => [...h, { ...newHabit, id: Date.now(), completedDays: [0, 0, 0, 0, 0, 0, 0], streak: 0, color: colors[h.length % colors.length] }]);
    setNewHabit({ name: "", emoji: "⭐", target: 1, unit: "lần" });
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12, fontWeight: 600, letterSpacing: 1 }}>THÊM HABIT MỚI</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Input value={newHabit.emoji} onChange={e => setNewHabit(x => ({ ...x, emoji: e.target.value }))} style={{ width: 60 }} />
          <Input value={newHabit.name} onChange={e => setNewHabit(x => ({ ...x, name: e.target.value }))} placeholder="Tên habit..." style={{ flex: 1, minWidth: 140 }} />
          <input type="number" value={newHabit.target} min={1} onChange={e => setNewHabit(x => ({ ...x, target: +e.target.value }))}
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 10, color: COLORS.textPrimary, padding: "10px 14px", width: 70, fontSize: 14 }} />
          <Input value={newHabit.unit} onChange={e => setNewHabit(x => ({ ...x, unit: e.target.value }))} placeholder="đơn vị" style={{ width: 80 }} />
          <Btn onClick={addHabit}>+ Thêm</Btn>
        </div>
      </Card>

      {/* Week grid */}
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "200px repeat(7, 1fr)", gap: 8, marginBottom: 12, alignItems: "center" }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, letterSpacing: 1 }}>HABIT</div>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>{d}</div>
          ))}
        </div>
        {habits.map((habit, i) => (
          <div key={habit.id} className="fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px repeat(7, 1fr)", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{habit.emoji}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary }}>{habit.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>🔥 {habit.streak} ngày</div>
                </div>
              </div>
              {habit.completedDays.map((done, j) => (
                <button key={j} onClick={() => toggleDay(habit.id, j)} style={{
                  aspectRatio: "1", width: "100%", maxWidth: 40, margin: "0 auto",
                  background: done ? habit.color : COLORS.surface,
                  border: `2px solid ${done ? habit.color : COLORS.border}`,
                  borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, transition: "all 0.2s", transform: done ? "scale(1.05)" : "scale(1)"
                }}>
                  {done ? "✓" : ""}
                </button>
              ))}
            </div>
            <div style={{ paddingLeft: 208, marginBottom: 16 }}>
              <ProgressBar value={habit.completedDays.filter(Boolean).length} max={7} color={habit.color} height={3} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>{habit.completedDays.filter(Boolean).length}/7 ngày tuần này</span>
                <span style={{ fontSize: 11, color: habit.color }}>{Math.round((habit.completedDays.filter(Boolean).length / 7) * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>
        {[
          { label: "Tổng habit", value: habits.length, icon: "📋", color: COLORS.accent },
          { label: "Streak dài nhất", value: `${Math.max(...habits.map(h => h.streak))} ngày`, icon: "🔥", color: COLORS.amber },
          { label: "Hoàn thành hôm nay", value: habits.filter(h => h.completedDays[6]).length, icon: "✅", color: COLORS.green },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 24, color: s.color, margin: "6px 0 2px" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ── Analytics ─────────────────────────────────────────────────────────────────

const Analytics = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const weekData = [
    { day: "T2", tasks: 8, done: 7, focus: 240 },
    { day: "T3", tasks: 6, done: 4, focus: 180 },
    { day: "T4", tasks: 9, done: 9, focus: 300 },
    { day: "T5", tasks: 5, done: 3, focus: 120 },
    { day: "T6", tasks: 7, done: 6, focus: 210 },
    { day: "T6", tasks: 3, done: 3, focus: 90 },
    { day: "CN", tasks: 2, done: 1, focus: 60 },
  ];
  const maxFocus = Math.max(...weekData.map(d => d.focus));

  const generateReport = async () => {
    setLoading(true);
    const result = await callAIJSON(
      `Phân tích dữ liệu năng suất tuần này: ${JSON.stringify(weekData)}
Tổng task: ${weekData.reduce((s, d) => s + d.tasks, 0)}, Hoàn thành: ${weekData.reduce((s, d) => s + d.done, 0)}, Tổng focus: ${weekData.reduce((s, d) => s + d.focus, 0)} phút.
Trả về JSON: { "score": số_0_100, "grade": "A/B/C/D", "strengths": ["điểm mạnh"], "improvements": ["điểm cần cải thiện"], "tips": ["mẹo cải thiện"], "prediction": "dự đoán tuần tới" }`,
      "Bạn là productivity analyst. Phân tích thực tế bằng tiếng Việt."
    );
    setReport(result);
    setLoading(false);
  };

  const gradeColor = { A: COLORS.green, B: COLORS.accent, C: COLORS.amber, D: COLORS.red };

  return (
    <div>
      {/* Stats Overview */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Task hoàn thành", value: "33/40", sub: "82.5% tỉ lệ", color: COLORS.green, icon: "✅" },
          { label: "Tổng focus time", value: "20.2h", sub: "Tuần này", color: COLORS.accent, icon: "⏱" },
          { label: "Streak hiện tại", value: "12 ngày", sub: "Kỷ lục: 21 ngày", color: COLORS.amber, icon: "🔥" },
          { label: "Ngày productive nhất", value: "Thứ 4", sub: "300 phút focus", color: COLORS.blue, icon: "⚡" },
        ].map(s => (
          <Card key={s.label} className="fade-in" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 22, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Bar Chart */}
        <Card>
          <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📊 Focus Time Tuần Này</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160 }}>
            {weekData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 10, color: COLORS.textMuted }}>{d.focus}m</div>
                <div style={{
                  width: "100%", background: COLORS.accent, borderRadius: "4px 4px 0 0",
                  height: `${(d.focus / maxFocus) * 120}px`, opacity: 0.7 + (d.focus / maxFocus) * 0.3,
                  transition: "height 0.5s ease", animationDelay: `${i * 0.1}s`
                }} />
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{d.day}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Completion Rate */}
        <Card>
          <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>📈 Tỉ Lệ Hoàn Thành</div>
          {weekData.map((d, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: COLORS.textSecondary }}>{d.day}</span>
                <span style={{ fontSize: 13, color: d.done === d.tasks ? COLORS.green : COLORS.amber }}>{d.done}/{d.tasks}</span>
              </div>
              <ProgressBar value={d.done} max={d.tasks} color={d.done === d.tasks ? COLORS.green : COLORS.accent} height={6} />
            </div>
          ))}
        </Card>
      </div>

      {/* AI Report */}
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 16 }}>🤖 AI Weekly Report</div>
          <Btn onClick={generateReport} disabled={loading}>{loading ? <><Spinner /> Đang phân tích...</> : "Tạo báo cáo tuần"}</Btn>
        </div>

        {report && (
          <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
            <div style={{ textAlign: "center", padding: "20px 30px", background: COLORS.surface, borderRadius: 16 }}>
              <div style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 60, color: gradeColor[report.grade] || COLORS.accent }}>{report.grade}</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted }}>Điểm hiệu suất</div>
              <div style={{ fontFamily: "'Syne'", fontWeight: 700, fontSize: 28, color: COLORS.textPrimary, marginTop: 8 }}>{report.score}/100</div>
            </div>
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>✅ ĐIỂM MẠNH</div>
                  {report.strengths?.map((s, i) => <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 }}>• {s}</div>)}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.amber, marginBottom: 6 }}>⚠️ CẦN CẢI THIỆN</div>
                  {report.improvements?.map((s, i) => <div key={i} style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 }}>• {s}</div>)}
                </div>
              </div>
              <div style={{ padding: "10px 14px", background: `${COLORS.accent}11`, borderRadius: 10, border: `1px solid ${COLORS.accent}22` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent, marginBottom: 4 }}>🔮 DỰ ĐOÁN TUẦN TỚI</div>
                <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{report.prediction}</div>
              </div>
            </div>
          </div>
        )}

        {!report && !loading && (
          <div style={{ textAlign: "center", padding: "24px", color: COLORS.textMuted, fontSize: 14 }}>
            Nhấn "Tạo báo cáo tuần" để AI phân tích hiệu suất của bạn
          </div>
        )}
      </Card>
    </div>
  );
};

// ── AI Assistant ──────────────────────────────────────────────────────────────

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào! Tôi là FlowPlan AI 🤖\n\nTôi có thể giúp bạn:\n• Tối ưu lịch làm việc\n• Chia nhỏ task phức tạp\n• Đề xuất cách cải thiện năng suất\n• Trả lời mọi câu hỏi về productivity\n\nBạn cần hỗ trợ gì hôm nay?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const SUGGESTIONS = [
    "Tôi chỉ có 2 tiếng hôm nay, ưu tiên gì?",
    "Giúp tôi chia nhỏ task 'Học lập trình'",
    "Làm sao để không trì hoãn?",
    "Kỹ thuật deep work là gì?",
  ];

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: msg }]);
    setLoading(true);
    const history = [...messages, { role: "user", content: msg }];
    const reply = await callAI(
      history.map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n\n"),
      "Bạn là FlowPlan AI - trợ lý năng suất thông minh. Trả lời bằng tiếng Việt, ngắn gọn, thực tế, có ví dụ cụ thể. Sử dụng emoji phù hợp. Tập trung vào productivity, quản lý thời gian, tập trung, và phát triển bản thân."
    );
    setMessages(m => [...m, { role: "assistant", content: reply }]);
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Messages */}
      <Card style={{ flex: 1, overflowY: "auto", marginBottom: 16, padding: "20px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 16, display: "flex", gap: 10, justifyContent: msg.role === "user" ? "flex-end" : "flex-start", animation: "fadeIn 0.3s ease" }}>
            {msg.role === "assistant" && (
              <div style={{ width: 32, height: 32, background: COLORS.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🤖</div>
            )}
            <div style={{
              maxWidth: "75%", padding: "12px 16px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? COLORS.accent : COLORS.surface,
              color: COLORS.textPrimary, fontSize: 14, lineHeight: 1.6,
              whiteSpace: "pre-wrap"
            }}>{msg.content}</div>
            {msg.role === "user" && (
              <div style={{ width: 32, height: 32, background: COLORS.card, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, border: `1px solid ${COLORS.border}` }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ width: 32, height: 32, background: COLORS.accent, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
            <div style={{ padding: "12px 16px", background: COLORS.surface, borderRadius: "16px 16px 16px 4px" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, background: COLORS.accent, borderRadius: "50%", animation: `pulse 1s ease ${i * 0.2}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </Card>

      {/* Suggestions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => send(s)} style={{
            padding: "7px 12px", background: COLORS.surface, border: `1px solid ${COLORS.border}`,
            borderRadius: 20, color: COLORS.textSecondary, fontSize: 12, cursor: "pointer", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.color = COLORS.accentLight; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.color = COLORS.textSecondary; }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <Card style={{ padding: 12 }}>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Hỏi FlowPlan AI bất cứ điều gì về productivity..." style={{
              flex: 1, background: COLORS.surface, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, color: COLORS.textPrimary, padding: "12px 16px", fontSize: 14
            }}
            onFocus={e => e.target.style.borderColor = COLORS.accent}
            onBlur={e => e.target.style.borderColor = COLORS.border} />
          <Btn onClick={() => send()} disabled={!input.trim() || loading} size="lg">
            {loading ? <Spinner /> : "Gửi →"}
          </Btn>
        </div>
      </Card>
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("planner");

  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const renderTab = () => {
    switch (activeTab) {
      case "planner": return <DailyPlanner />;
      case "goals": return <Goals />;
      case "focus": return <FocusMode />;
      case "habits": return <Habits />;
      case "analytics": return <Analytics />;
      case "assistant": return <AIAssistant />;
      default: return <DailyPlanner />;
    }
  };

  const tabTitles = {
    planner: { title: "Smart Daily Planner", sub: "AI tự động lập lịch tối ưu cho ngày của bạn" },
    goals: { title: "Goals & Milestones", sub: "Xây dựng roadmap chinh phục mục tiêu dài hạn" },
    focus: { title: "Focus Mode", sub: "Pomodoro timer — vào trạng thái deep work" },
    habits: { title: "Habit Tracker", sub: "Theo dõi và xây dựng thói quen tốt mỗi ngày" },
    analytics: { title: "Analytics & Reports", sub: "Phân tích hiệu suất và báo cáo tuần từ AI" },
    assistant: { title: "AI Productivity Assistant", sub: "Trợ lý AI hỗ trợ quản lý thời gian 24/7" },
  };

  return (
    <>
      <GlobalStyle />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar active={activeTab} setActive={setActiveTab} />
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Header */}
          <header style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "20px 28px", background: COLORS.surface, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontFamily: "'Syne'", fontWeight: 800, fontSize: 22, color: COLORS.textPrimary, margin: 0 }}>{tabTitles[activeTab]?.title}</h1>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{tabTitles[activeTab]?.sub}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{today}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                <Badge color={COLORS.green}>🔥 12 ngày streak</Badge>
                <Badge color={COLORS.accent}>⚡ Level 8</Badge>
              </div>
            </div>
          </header>
          {/* Content */}
          <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
            {renderTab()}
          </div>
        </main>
      </div>
    </>
  );
}
