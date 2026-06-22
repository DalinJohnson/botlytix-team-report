import { useState, useEffect } from "react";

const TEAM = [
  { name: "Ilayaraja", role: "BD / Operations", color: "#6366f1" },
  { name: "Johnson", role: "Developer", color: "#10b981" },
  { name: "Vaishnavi", role: "Developer", color: "#f59e0b" },
  { name: "Lejoe", role: "Design & Video", color: "#8b5cf6" },
  { name: "Harish", role: "Project Delivery", color: "#14b8a6" },
  { name: "Jennifer", role: "Automation Intern", color: "#f97316" },
];

const CATEGORIES = [
  "Client Work", "Internal Project", "Meetings", "Research", "Admin", "Learning", "Support"
];

const STATUS_OPTIONS = ["In Progress", "Completed", "Blocked", "Pending Review"];

const STATUS_COLORS = {
  "Completed": "bg-emerald-900/50 text-emerald-300",
  "In Progress": "bg-blue-900/50 text-blue-300",
  "Blocked": "bg-red-900/50 text-red-300",
  "Pending Review": "bg-yellow-900/50 text-yellow-300",
};

const getHour = () => {
  const h = new Date().getHours();
  return `${h.toString().padStart(2, "0")}:00`;
};

const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};

export default function App() {
  const [view, setView] = useState("form");
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("botlytix_reports") || "[]");
    } catch { return []; }
  });

  const [form, setForm] = useState({
    member: "",
    hour: getHour(),
    category: "",
    task: "",
    hours_spent: "1",
    status: "Completed",
    blockers: "",
    next_task: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [filterMember, setFilterMember] = useState("All");

  useEffect(() => {
    localStorage.setItem("botlytix_reports", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = () => {
    if (!form.member || !form.task || !form.category) return;
    const entry = { ...form, id: Date.now(), submitted_at: new Date().toISOString() };
    setEntries(prev => [entry, ...prev]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm(f => ({ ...f, task: "", blockers: "", next_task: "", hour: getHour() }));
    }, 2000);
  };

  const filtered = filterMember === "All" ? entries : entries.filter(e => e.member === filterMember);

  // Stats
  const todayStr = new Date().toDateString();
  const todayEntries = entries.filter(e => new Date(e.submitted_at).toDateString() === todayStr);
  const totalHours = todayEntries.reduce((s, e) => s + parseFloat(e.hours_spent || 0), 0);
  const completedCount = todayEntries.filter(e => e.status === "Completed").length;
  const blockedCount = todayEntries.filter(e => e.status === "Blocked").length;

  const memberStats = TEAM.map(t => {
    const mine = todayEntries.filter(e => e.member === t.name);
    return {
      ...t,
      count: mine.length,
      hours: mine.reduce((s, e) => s + parseFloat(e.hours_spent || 0), 0),
    };
  });

  const maxHours = Math.max(...memberStats.map(m => m.hours), 1);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold">B</div>
            <div>
              <div className="font-bold text-sm text-white">Botlytix Team Pulse</div>
              <div className="text-xs text-gray-500">Hourly Work Report System</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView("form")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "form" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              📝 Submit
            </button>
            <button
              onClick={() => setView("report")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${view === "report" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              📊 Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* FORM VIEW */}
        {view === "form" && (
          <div className="max-w-lg mx-auto">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-white">Hourly Work Update</h2>
              <p className="text-gray-400 text-sm mt-1">Log what you worked on this hour</p>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 space-y-4">
              {/* Member Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Team Member</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEAM.map(t => (
                    <button
                      key={t.name}
                      onClick={() => setForm(f => ({ ...f, member: t.name }))}
                      className={`p-2.5 rounded-xl border text-left transition-all ${form.member === t.name ? "border-indigo-500 bg-indigo-950" : "border-gray-700 bg-gray-800 hover:border-gray-600"}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></div>
                        <span className="text-sm font-medium text-white">{t.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 pl-4">{t.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hour + Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hour Slot</label>
                  <input
                    type="time"
                    value={form.hour}
                    onChange={e => setForm(f => ({ ...f, hour: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Hours Spent</label>
                  <select
                    value={form.hours_spent}
                    onChange={e => setForm(f => ({ ...f, hours_spent: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    {["0.5","1","1.5","2","2.5","3"].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm(f => ({ ...f, category: c }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.category === c ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Task Description *</label>
                <textarea
                  value={form.task}
                  onChange={e => setForm(f => ({ ...f, task: e.target.value }))}
                  placeholder="What did you work on this hour?"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, status: s }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${form.status === s ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Blockers */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Blockers / Issues <span className="text-gray-600 font-normal">(optional)</span></label>
                <input
                  value={form.blockers}
                  onChange={e => setForm(f => ({ ...f, blockers: e.target.value }))}
                  placeholder="Any blockers or dependencies?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Next Task */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Next Hour Plan <span className="text-gray-600 font-normal">(optional)</span></label>
                <input
                  value={form.next_task}
                  onChange={e => setForm(f => ({ ...f, next_task: e.target.value }))}
                  placeholder="What will you work on next?"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!form.member || !form.task || !form.category}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${submitted ? "bg-emerald-600 text-white" : (!form.member || !form.task || !form.category) ? "bg-gray-800 text-gray-600 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
              >
                {submitted ? "✅ Submitted!" : "Submit Report"}
              </button>
            </div>
          </div>
        )}

        {/* REPORT VIEW */}
        {view === "report" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">Team Report</h2>
                <p className="text-gray-400 text-sm">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              <button onClick={() => setEntries([])} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Clear All</button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: "Submissions Today", value: todayEntries.length, icon: "📋" },
                { label: "Total Hours Logged", value: totalHours.toFixed(1) + "h", icon: "⏱️" },
                { label: "Tasks Completed", value: completedCount, icon: "✅" },
                { label: "Blocked", value: blockedCount, icon: "🚫", alert: blockedCount > 0 },
              ].map(s => (
                <div key={s.label} className={`bg-gray-900 rounded-xl border p-3 ${s.alert && s.value > 0 ? "border-red-800" : "border-gray-800"}`}>
                  <div className="text-lg">{s.icon}</div>
                  <div className={`text-2xl font-bold mt-1 ${s.alert && s.value > 0 ? "text-red-400" : "text-white"}`}>{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Team Productivity Bar Chart */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Team Hours Today</h3>
              <div className="space-y-3">
                {memberStats.map(m => (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-400 text-right">{m.name}</div>
                    <div className="flex-1 bg-gray-800 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${(m.hours / maxHours) * 100}%`, backgroundColor: m.color + "90", minWidth: m.hours > 0 ? "30px" : "0" }}
                      >
                        {m.hours > 0 && <span className="text-xs font-medium text-white">{m.hours}h</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 w-14">{m.count} log{m.count !== 1 ? "s" : ""}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {["All", ...TEAM.map(t => t.name)].map(m => (
                <button
                  key={m}
                  onClick={() => setFilterMember(m)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterMember === m ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Entries */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-3">📭</div>
                <div className="text-sm">No reports submitted yet</div>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(e => {
                  const member = TEAM.find(t => t.name === e.member);
                  return (
                    <div key={e.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full mt-0.5" style={{ backgroundColor: member?.color || "#6366f1" }}></div>
                          <div>
                            <span className="text-sm font-semibold text-white">{e.member}</span>
                            <span className="text-gray-500 text-xs ml-2">{member?.role}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status] || "bg-gray-800 text-gray-400"}`}>{e.status}</span>
                          <span className="text-xs text-gray-500">{formatTime(e.submitted_at)}</span>
                        </div>
                      </div>
                      <div className="mt-2 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{e.category}</span>
                          <span className="text-xs text-gray-500">⏱ {e.hours_spent}h</span>
                          <span className="text-xs text-gray-500">🕐 {e.hour}</span>
                        </div>
                        <p className="text-sm text-gray-200">{e.task}</p>
                        {e.blockers && <p className="text-xs text-red-400 mt-1">🚫 {e.blockers}</p>}
                        {e.next_task && <p className="text-xs text-blue-400 mt-1">→ Next: {e.next_task}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
