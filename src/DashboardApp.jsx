import { useEffect, useState } from "react";
import "./dashboard.css";

const TEAM = [
  { name: "Ilayaraja", role: "BD / Operations", color: "#ff7a59" },
  { name: "Johnson", role: "Developer", color: "#11b3a3" },
  { name: "Vaishnavi", role: "Developer", color: "#f4b740" },
  { name: "Lejoe", role: "Design & Video", color: "#ff5d73" },
  { name: "Harish", role: "Project Delivery", color: "#4b7bec" },
  { name: "Jennifer", role: "Automation Intern", color: "#7ed957" },
];

const CATEGORIES = [
  "Client Work",
  "Internal Project",
  "Meetings",
  "Research",
  "Admin",
  "Learning",
  "Support",
];

const STATUS_OPTIONS = ["In Progress", "Completed", "Blocked", "Pending Review"];

const STATUS_META = {
  Completed: { tone: "status-completed" },
  "In Progress": { tone: "status-progress" },
  Blocked: { tone: "status-blocked" },
  "Pending Review": { tone: "status-review" },
};

const defaultFormState = () => ({
  member: "",
  hour: `${new Date().getHours().toString().padStart(2, "0")}:00`,
  category: "",
  task: "",
  hours_spent: "1",
  status: "Completed",
  blockers: "",
  next_task: "",
});

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

function StatCard({ label, value, hint, tone }) {
  return (
    <div className={`stat-card ${tone || ""}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </div>
  );
}

export default function DashboardApp() {
  const [view, setView] = useState("form");
  const [entries, setEntries] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("botlytix_reports") || "[]");
    } catch {
      return [];
    }
  });
  const [form, setForm] = useState(defaultFormState);
  const [submitted, setSubmitted] = useState(false);
  const [filterMember, setFilterMember] = useState("All");

  useEffect(() => {
    localStorage.setItem("botlytix_reports", JSON.stringify(entries));
  }, [entries]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.member || !form.task || !form.category) return;

    const entry = {
      ...form,
      id: Date.now(),
      submitted_at: new Date().toISOString(),
    };

    setEntries((current) => [entry, ...current]);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setForm((current) => ({
        ...defaultFormState(),
        member: current.member,
      }));
    }, 1800);
  };

  const todayStr = new Date().toDateString();
  const todayEntries = entries.filter(
    (entry) => new Date(entry.submitted_at).toDateString() === todayStr,
  );
  const filteredEntries =
    filterMember === "All"
      ? entries
      : entries.filter((entry) => entry.member === filterMember);

  const totalHours = todayEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.hours_spent || 0),
    0,
  );
  const completedCount = todayEntries.filter(
    (entry) => entry.status === "Completed",
  ).length;
  const blockedCount = todayEntries.filter(
    (entry) => entry.status === "Blocked",
  ).length;
  const activeMembers = new Set(todayEntries.map((entry) => entry.member)).size;

  const memberStats = TEAM.map((member) => {
    const logs = todayEntries.filter((entry) => entry.member === member.name);
    return {
      ...member,
      count: logs.length,
      hours: logs.reduce(
        (sum, entry) => sum + parseFloat(entry.hours_spent || 0),
        0,
      ),
    };
  });

  const maxHours = Math.max(...memberStats.map((member) => member.hours), 1);

  return (
    <div className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="topbar">
        <div>
          <span className="eyebrow">Botlytix internal tracker</span>
          <h1>Team Pulse Board</h1>
          <p className="hero-copy">
            Clean hourly reporting for the whole team with a live progress view.
          </p>
        </div>

        <div className="view-toggle">
          <button
            type="button"
            className={view === "form" ? "active" : ""}
            onClick={() => setView("form")}
          >
            Submit update
          </button>
          <button
            type="button"
            className={view === "report" ? "active" : ""}
            onClick={() => setView("report")}
          >
            View report
          </button>
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-panel hero-panel-primary">
          <p className="panel-label">Today's snapshot</p>
          <div className="hero-metric">
            <strong>{todayEntries.length}</strong>
            <span>updates logged today</span>
          </div>
          <div className="mini-stats">
            <div>
              <strong>{totalHours.toFixed(1)}h</strong>
              <span>Total hours</span>
            </div>
            <div>
              <strong>{activeMembers}</strong>
              <span>Members active</span>
            </div>
            <div>
              <strong>{completedCount}</strong>
              <span>Completed tasks</span>
            </div>
          </div>
        </div>

        <div className="hero-panel">
          <p className="panel-label">Coverage</p>
          <div className="coverage-list">
            {memberStats.map((member) => (
              <div className="coverage-item" key={member.name}>
                <div className="coverage-meta">
                  <span
                    className="member-dot"
                    style={{ backgroundColor: member.color }}
                  />
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </div>
                </div>
                <span className="coverage-hours">{member.hours || 0}h</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {view === "form" ? (
        <main className="workspace form-layout">
          <section className="card">
            <div className="section-head">
              <div>
                <p className="panel-label">Submit hourly update</p>
                <h2>What did the team member finish this hour?</h2>
              </div>
              <span className="pill neutral-pill">Stored in browser</span>
            </div>

            <div className="member-grid">
              {TEAM.map((member) => (
                <button
                  type="button"
                  key={member.name}
                  className={`member-tile ${
                    form.member === member.name ? "selected" : ""
                  }`}
                  onClick={() => updateForm("member", member.name)}
                >
                  <span
                    className="member-dot"
                    style={{ backgroundColor: member.color }}
                  />
                  <strong>{member.name}</strong>
                  <span>{member.role}</span>
                </button>
              ))}
            </div>

            <div className="field-row two-up">
              <label className="field">
                <span>Hour slot</span>
                <input
                  type="time"
                  value={form.hour}
                  onChange={(event) => updateForm("hour", event.target.value)}
                />
              </label>
              <label className="field">
                <span>Hours spent</span>
                <select
                  value={form.hours_spent}
                  onChange={(event) =>
                    updateForm("hours_spent", event.target.value)
                  }
                >
                  {["0.5", "1", "1.5", "2", "2.5", "3"].map((value) => (
                    <option key={value} value={value}>
                      {value} hour{value === "1" ? "" : "s"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field">
              <span>Category</span>
              <div className="chip-row">
                {CATEGORIES.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={`chip ${
                      form.category === category ? "chip-active" : ""
                    }`}
                    onClick={() => updateForm("category", category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <label className="field">
              <span>Task description</span>
              <textarea
                rows="4"
                value={form.task}
                onChange={(event) => updateForm("task", event.target.value)}
                placeholder="Example: Fixed lead capture bug, updated landing page copy, reviewed client deliverables..."
              />
            </label>

            <div className="field">
              <span>Status</span>
              <div className="chip-row">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={`chip ${
                      form.status === status ? "chip-active" : ""
                    }`}
                    onClick={() => updateForm("status", status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="field-row two-up">
              <label className="field">
                <span>Blockers or issues</span>
                <input
                  type="text"
                  value={form.blockers}
                  onChange={(event) => updateForm("blockers", event.target.value)}
                  placeholder="Waiting for access, approval, client reply..."
                />
              </label>
              <label className="field">
                <span>Next hour plan</span>
                <input
                  type="text"
                  value={form.next_task}
                  onChange={(event) => updateForm("next_task", event.target.value)}
                  placeholder="What comes next?"
                />
              </label>
            </div>

            <div className="form-footer">
              <p>Required fields: member, category, and task description.</p>
              <button
                type="button"
                className={`submit-button ${submitted ? "submit-success" : ""}`}
                onClick={handleSubmit}
                disabled={!form.member || !form.task || !form.category}
              >
                {submitted ? "Update saved" : "Submit report"}
              </button>
            </div>
          </section>

          <aside className="card sidebar-card">
            <div className="section-head">
              <div>
                <p className="panel-label">Quick guidance</p>
                <h2>Make each update sharp</h2>
              </div>
            </div>

            <div className="tip-list">
              <div className="tip-card">
                <strong>Be specific</strong>
                <p>Mention the exact task, deliverable, or blocker.</p>
              </div>
              <div className="tip-card">
                <strong>Keep status honest</strong>
                <p>Use "Blocked" only when the next step truly depends on someone else.</p>
              </div>
              <div className="tip-card">
                <strong>Leave a trail</strong>
                <p>Use the next-hour plan so handoffs stay smooth.</p>
              </div>
            </div>

            <div className="status-legend">
              {STATUS_OPTIONS.map((status) => (
                <div className="legend-row" key={status}>
                  <span className={`legend-dot ${STATUS_META[status].tone}`} />
                  <span>{status}</span>
                </div>
              ))}
            </div>
          </aside>
        </main>
      ) : (
        <main className="workspace report-layout">
          <section className="stats-grid">
            <StatCard
              label="Submissions today"
              value={todayEntries.length}
              hint="Live count of saved updates"
            />
            <StatCard
              label="Hours logged"
              value={`${totalHours.toFixed(1)}h`}
              hint="Sum of today's reported effort"
              tone="warm-card"
            />
            <StatCard
              label="Completed"
              value={completedCount}
              hint="Tasks marked done"
              tone="cool-card"
            />
            <StatCard
              label="Blocked"
              value={blockedCount}
              hint="Items needing support"
              tone={blockedCount > 0 ? "alert-card" : ""}
            />
          </section>

          <section className="card">
            <div className="section-head">
              <div>
                <p className="panel-label">Team hours today</p>
                <h2>Productivity overview</h2>
              </div>
              <span className="pill neutral-pill">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="bar-list">
              {memberStats.map((member) => (
                <div className="bar-row" key={member.name}>
                  <div className="bar-member">
                    <span
                      className="member-dot"
                      style={{ backgroundColor: member.color }}
                    />
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.count} log(s)</span>
                    </div>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(member.hours / maxHours) * 100}%`,
                        background: `linear-gradient(90deg, ${member.color}, #ffffff22)`,
                      }}
                    />
                  </div>
                  <strong className="bar-value">{member.hours}h</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="section-head filter-head">
              <div>
                <p className="panel-label">Activity feed</p>
                <h2>Submitted reports</h2>
              </div>

              <div className="filter-actions">
                <div className="chip-row">
                  {["All", ...TEAM.map((member) => member.name)].map((member) => (
                    <button
                      type="button"
                      key={member}
                      className={`chip ${
                        filterMember === member ? "chip-active" : ""
                      }`}
                      onClick={() => setFilterMember(member)}
                    >
                      {member}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setEntries([])}
                >
                  Clear all
                </button>
              </div>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="empty-state">
                <strong>No reports yet</strong>
                <p>Switch to "Submit update" and add the first hourly entry.</p>
              </div>
            ) : (
              <div className="entry-list">
                {filteredEntries.map((entry) => {
                  const member = TEAM.find((item) => item.name === entry.member);
                  const statusMeta = STATUS_META[entry.status] || STATUS_META.Completed;

                  return (
                    <article className="entry-card" key={entry.id}>
                      <div className="entry-head">
                        <div className="entry-member">
                          <span
                            className="member-dot"
                            style={{ backgroundColor: member?.color || "#ff7a59" }}
                          />
                          <div>
                            <strong>{entry.member}</strong>
                            <span>{member?.role}</span>
                          </div>
                        </div>

                        <div className="entry-meta">
                          <span className={`pill ${statusMeta.tone}`}>
                            {entry.status}
                          </span>
                          <span className="time-stamp">
                            {formatTime(entry.submitted_at)}
                          </span>
                        </div>
                      </div>

                      <div className="entry-tags">
                        <span className="soft-tag">{entry.category}</span>
                        <span className="soft-tag">{entry.hours_spent}h</span>
                        <span className="soft-tag">{entry.hour}</span>
                      </div>

                      <p className="entry-task">{entry.task}</p>

                      {entry.blockers ? (
                        <p className="entry-note entry-blocker">
                          Blocker: {entry.blockers}
                        </p>
                      ) : null}

                      {entry.next_task ? (
                        <p className="entry-note entry-next">
                          Next: {entry.next_task}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}
