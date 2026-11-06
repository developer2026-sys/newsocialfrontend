import { useMemo, useState } from "react";

const MOCK_DATA = [
  { id: "r1", platform: "Reddit", source: "r/jobs", author: "u/tired_analyst", timestamp: "2026-11-04 14:22", organization: "Acme Corp", category: "Layoffs", text: "Heard from three people on my team that Acme is cutting another 15% next quarter. Management keeps saying everything is fine.", likes: 214, replies: 58 },
  { id: "r2", platform: "Reddit", source: "r/antiwork", author: "u/quietquitter88", timestamp: "2026-11-04 11:05", organization: "Globex", category: "Management", text: "Our director changed the review criteria halfway through the cycle. Nobody got a straight answer on why.", likes: 531, replies: 143 },
  { id: "r3", platform: "Reddit", source: "r/cscareerquestions", author: "u/devnotes", timestamp: "2026-11-03 19:40", organization: "Initech", category: "Compensation", text: "Got an offer from Initech but the base is 12% below market. They're pushing equity hard instead.", likes: 97, replies: 36 },
  { id: "x1", platform: "X", source: "@hr_watch", author: "@sarah_in_ops", timestamp: "2026-11-04 09:18", organization: "Umbrella Inc", category: "Workplace Culture", text: "Return-to-office mandate at Umbrella just dropped. Morale in the Slack channels is not great.", likes: 82, replies: 19 },
  { id: "x2", platform: "X", source: "@careertalk", author: "@mike_builds", timestamp: "2026-11-03 16:52", organization: "Hooli", category: "Hiring", text: "Hooli has had the same 40 roles open for six months. Either they can't hire or they don't want to.", likes: 45, replies: 12 },
  { id: "x3", platform: "X", source: "@workplacepulse", author: "@jlee_pm", timestamp: "2026-11-02 21:07", organization: "Acme Corp", category: "Workplace Culture", text: "Honestly the best part of working at Acme is the team. The worst part is everything above the team.", likes: 303, replies: 41 },
  { id: "r4", platform: "Reddit", source: "r/humanresources", author: "u/hr_in_the_trenches", timestamp: "2026-11-02 13:30", organization: "Globex", category: "Hiring", text: "We've had 4 resignations in two weeks, all citing the same manager. Leadership still hasn't acted.", likes: 176, replies: 67 },
  { id: "r5", platform: "Reddit", source: "r/jobs", author: "u/newgrad2026", timestamp: "2026-11-01 08:12", organization: "Initech", category: "Workplace Culture", text: "Six months in at Initech. Great mentorship, flexible hours, but the on-call rotation is brutal.", likes: 64, replies: 22 },
];

const CATEGORY_STYLES = {
  Layoffs: "bg-red-100 text-red-700",
  Management: "bg-amber-100 text-amber-700",
  Compensation: "bg-emerald-100 text-emerald-700",
  "Workplace Culture": "bg-indigo-100 text-indigo-700",
  Hiring: "bg-sky-100 text-sky-700",
};

const PLATFORM_STYLES = {
  Reddit: "bg-orange-100 text-orange-700",
  "Hacker News": "bg-amber-100 text-amber-800",
  LinkedIn: "bg-blue-100 text-blue-700",
  X: "bg-slate-200 text-slate-800",
};


const CATEGORY_STYLES_EXTRA = "bg-slate-100 text-slate-600";
const API_URL = "http://localhost:3001";


export default function App() {
  const [status, setStatus] = useState("idle"); // idle | running | done
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState([]);
  const [platform, setPlatform] = useState("All");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const [terms, setTerms] = useState("Amazon layoffs");
  const [errors, setErrors] = useState([]);

  const runCollection = async () => {
    setStatus("running");
    setProgress(30);
    setRows([]);
    setErrors([]);
    try {
      const res = await fetch(`${API_URL}/api/collect?terms=${encodeURIComponent(terms)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setProgress(100);
      setRows(json.data);
      setErrors(json.errors || []);
    } catch (err) {
      setErrors([{ source: "Backend", term: "-", message: err.message }]);
    }
    setStatus("done");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (platform !== "All" && r.platform !== platform) return false;
      if (category !== "All" && r.category !== category) return false;
      if (q && !`${r.text} ${r.organization} ${r.author}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, platform, category, query]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    rows.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const totalEngagement = rows.reduce((sum, r) => sum + r.likes + r.replies, 0);
  const platformCount = new Set(rows.map((r) => r.platform)).size;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold">Social Listening Dashboard</h1>
            <p className="text-sm text-slate-500">Public conversation data across platforms</p>
          </div>
          <input
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Companies, comma separated"
            className="mr-3 w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={runCollection}
            disabled={status === "running"}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "running" ? "Collecting..." : status === "done" ? "Run Again" : "Run Collection"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        {status === "running" && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex justify-between text-sm text-slate-600">
            <span>Pulling conversations from LinkedIn...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full bg-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        {errors.length > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            {errors.map((e, i) => (
              <p key={i}>{e.source} ({e.term}): {e.message}</p>
            ))}
          </div>
        )}
        {status === "idle" && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg font-medium">No data yet</p>
            <p className="mt-1 text-sm text-slate-500">Click "Run Collection" to pull the latest conversations.</p>
          </div>
        )}

        {status === "done" && (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                ["Conversations", rows.length],
                ["Platforms", platformCount],
                ["Total engagement", totalEngagement.toLocaleString()],
                ["Top category", categoryCounts[0]?.[0] ?? "-"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                  <p className="mt-1 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-slate-700">Conversations by category</h2>
              <div className="space-y-3">
                {categoryCounts.map(([name, count]) => (
                  <div key={name} className="flex items-center gap-3 text-sm">
                    <span className="w-40 shrink-0 text-slate-600">{name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-indigo-500" style={{ width: `${(count / rows.length) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right text-slate-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search text, organization, author..."
                className="min-w-64 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                                      {["All", "LinkedIn", "Hacker News"].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                                {["All", ...Object.keys(CATEGORY_STYLES), "General"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 && (
                <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  No conversations match your filters.
                </p>
              )}
              {filtered.map((r) => (
                <article key={r.id} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-2.5 py-1 font-medium ${PLATFORM_STYLES[r.platform]}`}>{r.platform}</span>
                    <span className={`rounded-full px-2.5 py-1 font-medium ${CATEGORY_STYLES[r.category] || CATEGORY_STYLES_EXTRA}`}>{r.category}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">{r.organization}</span>
                    <span className="ml-auto text-slate-400">{r.timestamp}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-800">{r.text}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span>{r.author}</span>
                    <span>in {r.source}</span>
                    <span className="ml-auto">{r.likes} likes</span>
                    <span>{r.replies} replies</span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}