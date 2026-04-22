import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const MARKETING_API = `${API_BASE_URL}/api/v1/marketing`;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const TAG_META = {
  container: { label: "Container", color: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  roro:      { label: "RoRo",      color: "bg-violet-500/15 text-violet-300 border-violet-500/40" },
  air:       { label: "Air",       color: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  general:   { label: "General",   color: "bg-slate-500/15 text-slate-300 border-slate-500/40" },
};

function TagChip({ tag }) {
  const m = TAG_META[tag] || TAG_META.general;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${m.color}`}>
      {m.label}
    </span>
  );
}

function StatusDot({ active }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? "bg-emerald-400" : "bg-red-400/70"}`} />
  );
}

const TABS = [
  { id: "subscribers", label: "Subscribers" },
  { id: "campaign",    label: "Send Campaign" },
  { id: "add",         label: "+ Add Subscriber" },
];

const Marketing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState("subscribers");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
  }, [navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white p-3 sm:p-6 lg:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-[#FFA500]/10 border border-[#FFA500]/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#FFA500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Marketing</h1>
        </div>
        <p className="text-sm text-gray-400 ml-11">
          Manage your subscriber list and send targeted campaigns via Postmark.
        </p>
      </div>

      <div className="flex gap-1 mb-6 bg-[#020617] border border-[#1f2937] rounded-xl p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.14em] transition-all ${
              tab === t.id
                ? "bg-[#FFA500] text-black shadow"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "subscribers" && <SubscribersTab />}
      {tab === "campaign"    && <CampaignTab />}
      {tab === "add"         && <AddSubscriberTab onSuccess={() => setTab("subscribers")} />}
    </div>
  );
};

function SubscribersTab() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [tagFilter, setTagFilter]     = useState("all");
  const [search, setSearch]           = useState("");
  const [removing, setRemoving]       = useState(null);

  const fetchSubscribers = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${MARKETING_API}/subscribers`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load subscribers");
      setSubscribers(data.subscribers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubscribers(); }, []);

  const handleUnsubscribe = async (id) => {
    if (!window.confirm("Mark this subscriber as unsubscribed?")) return;
    setRemoving(id);
    try {
      const res = await fetch(`${MARKETING_API}/subscribers/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setSubscribers((prev) =>
        prev.map((s) => s._id === id ? { ...s, unsubscribed: true } : s)
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setRemoving(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (tagFilter !== "all" && !s.tags?.includes(tagFilter)) return false;
      if (term && !(s.email + " " + s.name).toLowerCase().includes(term)) return false;
      return true;
    });
  }, [subscribers, tagFilter, search]);

  const active   = subscribers.filter((s) => !s.unsubscribed).length;
  const inactive = subscribers.filter((s) =>  s.unsubscribed).length;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total",        value: subscribers.length, color: "text-white" },
          { label: "Active",       value: active,             color: "text-emerald-300" },
          { label: "Unsubscribed", value: inactive,           color: "text-red-300" },
        ].map((s) => (
          <div key={s.label} className="bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-3">
            <span className="block text-[11px] uppercase tracking-widest text-gray-400">{s.label}</span>
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-sm outline-none placeholder:text-gray-500"
        />
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">All tags</option>
          {Object.entries(TAG_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>
      )}

      <div className="hidden lg:block bg-[#020617] border border-[#1f2937] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2937] text-[11px] uppercase tracking-[0.16em] text-gray-400">
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-left px-5 py-3">Name</th>
              <th className="text-left px-5 py-3">Email</th>
              <th className="text-left px-5 py-3">Tags</th>
              <th className="text-left px-5 py-3">Source</th>
              <th className="text-left px-5 py-3">Joined</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500 text-sm">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-500 text-sm">No subscribers found.</td></tr>
            ) : filtered.map((s) => (
              <tr key={s._id} className="border-b border-[#1f2937]/60 hover:bg-white/[0.02] transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <StatusDot active={!s.unsubscribed} />
                    <span className={`text-xs ${s.unsubscribed ? "text-gray-500" : "text-emerald-300"}`}>
                      {s.unsubscribed ? "Unsub" : "Active"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-gray-100">{s.name || "—"}</td>
                <td className="px-5 py-3 text-gray-300">{s.email}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(s.tags || []).map((t) => <TagChip key={t} tag={t} />)}
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-400 capitalize">{(s.source || "").replace("_", " ")}</td>
                <td className="px-5 py-3 text-gray-400">
                  {s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  {!s.unsubscribed && (
                    <button
                      onClick={() => handleUnsubscribe(s._id)}
                      disabled={removing === s._id}
                      className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1 hover:bg-red-500/10 transition disabled:opacity-40"
                    >
                      {removing === s._id ? "…" : "Unsub"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {loading ? (
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 text-sm text-gray-400">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4 text-sm text-gray-400">No subscribers found.</div>
        ) : filtered.map((s) => (
          <div key={s._id} className="bg-[#020617] border border-[#1f2937] rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-100">{s.name || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.email}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <StatusDot active={!s.unsubscribed} />
                <span className={`text-xs ${s.unsubscribed ? "text-gray-500" : "text-emerald-300"}`}>
                  {s.unsubscribed ? "Unsubscribed" : "Active"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {(s.tags || []).map((t) => <TagChip key={t} tag={t} />)}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500 capitalize">{(s.source || "").replace("_", " ")} · {s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "—"}</span>
              {!s.unsubscribed && (
                <button
                  onClick={() => handleUnsubscribe(s._id)}
                  disabled={removing === s._id}
                  className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1 hover:bg-red-500/10 transition disabled:opacity-40"
                >
                  {removing === s._id ? "…" : "Unsubscribe"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TEMPLATES = {
  blank: { subject: "", body: "" },
  promo: {
    subject: "🚢 Exclusive Shipping Offer — Ellcworth Express",
    body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f14;color:#e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a2930 0%,#0f1a20 100%);padding:40px 36px;text-align:center;border-bottom:2px solid #FFA500;">
    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;margin:0 0 8px;">Ellcworth Express</p>
    <h1 style="font-size:28px;font-weight:700;color:#ffffff;margin:0 0 8px;">Shipping Made Simple</h1>
    <p style="font-size:15px;color:#FFA500;margin:0;">Container · RoRo · Air Freight</p>
  </div>
  <div style="padding:36px;">
    <p style="font-size:16px;color:#e5e7eb;margin:0 0 16px;">Hi {{name}},</p>
    <p style="font-size:15px;color:#9ca3af;line-height:1.7;margin:0 0 24px;">We have exciting new rates on selected routes this month. Whether you're moving vehicles, containers, or air freight — we're here to get your cargo there safely and on time.</p>
    <div style="background:#111827;border:1px solid #1f2937;border-radius:10px;padding:20px;margin:0 0 24px;">
      <p style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#FFA500;margin:0 0 12px;">This Month's Highlights</p>
      <ul style="color:#d1d5db;font-size:14px;line-height:2;margin:0;padding-left:20px;">
        <li>UK to West Africa — Competitive FCL rates</li>
        <li>RoRo vehicle shipping — Tilbury to Tema from £XXX</li>
        <li>Air freight — Next-day document service</li>
      </ul>
    </div>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://ellcworth.com/#quote" style="display:inline-block;background:#FFA500;color:#000;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.14em;padding:14px 32px;border-radius:50px;text-decoration:none;">Get a Quote</a>
    </div>
    <p style="font-size:13px;color:#6b7280;line-height:1.6;border-top:1px solid #1f2937;padding-top:20px;margin:0;">
      You're receiving this because you opted in at ellcworth.com.<br/>
      <a href="https://ellcworth.com" style="color:#FFA500;">ellcworth.com</a> · cs@ellcworth.com
    </p>
  </div>
</div>`,
  },
  newsletter: {
    subject: "📦 Ellcworth Express — Shipping News & Updates",
    body: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0a0f14;color:#e5e7eb;border-radius:12px;overflow:hidden;">
  <div style="background:#1a2930;padding:32px 36px;border-bottom:2px solid #FFA500;">
    <p style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;margin:0 0 4px;">Newsletter</p>
    <h1 style="font-size:24px;font-weight:700;color:#ffffff;margin:0;">Ellcworth Express</h1>
  </div>
  <div style="padding:36px;">
    <p style="font-size:16px;color:#e5e7eb;margin:0 0 16px;">Hi {{name}},</p>
    <p style="font-size:15px;color:#9ca3af;line-height:1.7;margin:0 0 24px;">Here's the latest from Ellcworth Express — industry updates, route news, and tips to make your next shipment smoother.</p>
    <h2 style="font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;color:#FFA500;margin:0 0 12px;">In This Issue</h2>
    <p style="color:#9ca3af;font-size:14px;line-height:1.8;margin:0 0 24px;">
      ✦ Port congestion update — Tema &amp; Lagos<br/>
      ✦ New RoRo vessel schedule — Q3 departures<br/>
      ✦ Customs documentation checklist<br/>
      ✦ Customer spotlight
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://ellcworth.com/#quote" style="display:inline-block;background:#FFA500;color:#000;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.14em;padding:14px 32px;border-radius:50px;text-decoration:none;">Get a Quote Today</a>
    </div>
    <p style="font-size:13px;color:#6b7280;line-height:1.6;border-top:1px solid #1f2937;padding-top:20px;margin:0;">
      You're receiving this because you opted in at ellcworth.com.<br/>
      <a href="https://ellcworth.com" style="color:#FFA500;">ellcworth.com</a> · cs@ellcworth.com
    </p>
  </div>
</div>`,
  },
};

function CampaignTab() {
  const [subject, setSubject]   = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [tags, setTags]         = useState([]);
  const [template, setTemplate] = useState("blank");
  const [preview, setPreview]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState("");

  const applyTemplate = (key) => {
    setTemplate(key);
    setSubject(TEMPLATES[key].subject);
    setHtmlBody(TEMPLATES[key].body);
    setResult(null); setError("");
  };

  const toggleTag = (t) =>
    setTags((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const handleSend = async () => {
    if (!subject.trim() || !htmlBody.trim()) { setError("Subject and email body are required."); return; }
    if (!window.confirm(`Send this campaign to all active subscribers${tags.length ? ` tagged: ${tags.join(", ")}` : ""}?\n\nThis cannot be undone.`)) return;
    setSending(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${MARKETING_API}/campaigns/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ subject, htmlBody, tags: tags.length ? tags : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Send failed");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">Start from a template</p>
        <div className="flex flex-wrap gap-2">
          {Object.keys(TEMPLATES).map((k) => (
            <button key={k} onClick={() => applyTemplate(k)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.12em] border transition ${
                template === k
                  ? "bg-[#FFA500]/10 border-[#FFA500]/50 text-[#FFA500]"
                  : "bg-[#020617] border-[#1f2937] text-gray-400 hover:text-white hover:border-gray-500"
              }`}>
              {k === "blank" ? "Blank" : k === "promo" ? "🎯 Promo Offer" : "📰 Newsletter"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">Subject line</label>
        <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Exclusive rates this month — Ellcworth Express"
          className="w-full bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FFA500]/50 transition placeholder:text-gray-600" />
      </div>

      <div className="mb-4">
        <label className="block text-xs uppercase tracking-widest text-gray-400 mb-1.5">
          Target audience <span className="normal-case text-gray-500">(leave blank = everyone)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TAG_META).map(([k, v]) => (
            <button key={k} onClick={() => toggleTag(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                tags.includes(k) ? v.color : "bg-transparent border-[#1f2937] text-gray-500 hover:text-gray-300"
              }`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs uppercase tracking-widest text-gray-400">Email body (HTML)</label>
          <button onClick={() => setPreview((p) => !p)} className="text-xs text-[#FFA500] hover:underline">
            {preview ? "← Edit" : "Preview →"}
          </button>
        </div>
        {preview ? (
          <div className="bg-white rounded-xl overflow-hidden border border-[#1f2937] min-h-[360px]">
            <iframe srcDoc={htmlBody} title="Email preview" className="w-full min-h-[360px] border-0" sandbox="allow-same-origin" />
          </div>
        ) : (
          <textarea value={htmlBody} onChange={(e) => setHtmlBody(e.target.value)} rows={16}
            placeholder="Paste or write your HTML email body here. Use {{name}} for personalisation."
            className="w-full bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#FFA500]/50 transition placeholder:text-gray-600 resize-y" />
        )}
        <p className="text-xs text-gray-500 mt-1.5">Use <code className="text-[#FFA500]">{"{{name}}"}</code> to personalise the greeting for each subscriber.</p>
      </div>

      {error  && <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>}
      {result && <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-sm">✅ {result.message}</div>}

      <button onClick={handleSend} disabled={sending || !subject.trim() || !htmlBody.trim()}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFA500] text-black font-semibold text-sm uppercase tracking-[0.14em] shadow-lg shadow-[#FFA500]/20 hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed">
        {sending ? "Sending…" : "Send Campaign"}
      </button>
    </div>
  );
}

function AddSubscriberTab({ onSuccess }) {
  const [form, setForm]     = useState({ email: "", name: "", phone: "", source: "manual", tags: ["general"] });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState("");

  const toggleTag = (t) =>
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(t) ? prev.tags.filter((x) => x !== t) : [...prev.tags, t],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) { setError("Email is required."); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${MARKETING_API}/subscribers`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to add subscriber");
      setSuccess(data.message || "Subscriber added!");
      setForm({ email: "", name: "", phone: "", source: "manual", tags: ["general"] });
      setTimeout(onSuccess, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FFA500]/50 transition placeholder:text-gray-600";
  const label = "block text-xs uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Email *</label>
          <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="subscriber@email.com" className={field} />
        </div>
        <div>
          <label className={label}>Full name</label>
          <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Jane Smith" className={field} />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="e.g. +44 7700…" className={field} />
        </div>
        <div>
          <label className={label}>Source</label>
          <select value={form.source} onChange={(e) => setForm((p) => ({ ...p, source: e.target.value }))} className={field}>
            <option value="manual">Manual</option>
            <option value="quote_form">Quote form</option>
            <option value="import">Import</option>
          </select>
        </div>
        <div>
          <label className={label}>Tags</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TAG_META).map(([k, v]) => (
              <button type="button" key={k} onClick={() => toggleTag(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  form.tags.includes(k) ? v.color : "bg-transparent border-[#1f2937] text-gray-500 hover:text-gray-300"
                }`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {error   && <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>}
        {success && <div className="px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-sm">✅ {success}</div>}

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-full bg-[#FFA500] text-black font-semibold text-sm uppercase tracking-[0.14em] shadow-lg shadow-[#FFA500]/20 hover:brightness-110 transition disabled:opacity-40">
          {saving ? "Adding…" : "Add Subscriber"}
        </button>
      </form>
    </div>
  );
}

export default Marketing;
