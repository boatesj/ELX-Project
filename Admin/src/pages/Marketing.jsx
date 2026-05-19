import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
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
  test:      { label: "Test",      color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
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
  { id: "prospects",   label: "🎯 Prospects" },
  { id: "campaign",    label: "Send Campaign" },
  { id: "history",     label: "📊 Campaign History" },
  { id: "add",         label: "+ Add Subscriber" },
  { id: "import",      label: "⬆ Import CSV" },
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
      {tab === "prospects"   && <ProspectsTab />}
      {tab === "campaign"    && <CampaignTab />}
      {tab === "add"         && <AddSubscriberTab onSuccess={() => setTab("subscribers")} />}
      {tab === "import"      && <ImportTab onSuccess={() => setTab("subscribers")} />}
      {tab === "history"     && <CampaignHistoryTab />}
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
  const [editingId, setEditingId]     = useState(null);
  const [editForm, setEditForm]       = useState({ name: "", tags: [] });
  const [saving, setSaving]           = useState(false);

  const startEdit = (s) => {
    setEditingId(s._id);
    setEditForm({ name: s.name || "", tags: [...(s.tags || [])] });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({ name: "", tags: [] }); };

  const toggleEditTag = (t) =>
    setEditForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(t) ? prev.tags.filter((x) => x !== t) : [...prev.tags, t],
    }));

  const handleSave = async (id) => {
    setSaving(true);
    try {
      const res = await fetch(`${MARKETING_API}/subscribers/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to update");
      setSubscribers((prev) =>
        prev.map((s) => s._id === id ? { ...s, ...data.subscriber } : s)
      );
      cancelEdit();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

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
              <React.Fragment key={s._id}>
              <tr className="border-b border-[#1f2937]/60 hover:bg-white/[0.02] transition">
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
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => editingId === s._id ? cancelEdit() : startEdit(s)}
                      className="text-xs text-[#FFA500] hover:text-white border border-[#FFA500]/30 rounded-lg px-3 py-1 hover:bg-[#FFA500]/10 transition"
                    >
                      {editingId === s._id ? "Cancel" : "Edit"}
                    </button>
                    {!s.unsubscribed && (
                      <button
                        onClick={() => handleUnsubscribe(s._id)}
                        disabled={removing === s._id}
                        className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1 hover:bg-red-500/10 transition disabled:opacity-40"
                      >
                        {removing === s._id ? "…" : "Unsub"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
              {editingId === s._id && (
                <tr className="border-b border-[#FFA500]/20 bg-[#FFA500]/5">
                  <td colSpan={7} className="px-5 py-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                      <div className="flex-1">
                        <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1">Name</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                          className="w-full bg-[#020617] border border-[#1f2937] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFA500]/50 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1">Tags</label>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(TAG_META).map(([k, v]) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => toggleEditTag(k)}
                              className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                                editForm.tags.includes(k) ? v.color : "bg-transparent border-[#1f2937] text-gray-500 hover:text-gray-300"
                              }`}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSave(s._id)}
                        disabled={saving}
                        className="px-5 py-2 rounded-full bg-[#FFA500] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 transition disabled:opacity-40 shrink-0"
                      >
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              </React.Fragment>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => editingId === s._id ? cancelEdit() : startEdit(s)}
                  className="text-xs text-[#FFA500] hover:text-white border border-[#FFA500]/30 rounded-lg px-3 py-1 hover:bg-[#FFA500]/10 transition"
                >
                  {editingId === s._id ? "Cancel" : "Edit"}
                </button>
                {!s.unsubscribed && (
                  <button
                    onClick={() => handleUnsubscribe(s._id)}
                    disabled={removing === s._id}
                    className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1 hover:bg-red-500/10 transition disabled:opacity-40"
                  >
                    {removing === s._id ? "…" : "Unsub"}
                  </button>
                )}
              </div>
            </div>
            {editingId === s._id && (
              <div className="mt-3 pt-3 border-t border-[#FFA500]/20 flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-[#0a0f14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#FFA500]/50 transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-widest text-gray-400 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TAG_META).map(([k, v]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => toggleEditTag(k)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                          editForm.tags.includes(k) ? v.color : "bg-transparent border-[#1f2937] text-gray-500 hover:text-gray-300"
                        }`}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleSave(s._id)}
                  disabled={saving}
                  className="w-full py-2 rounded-full bg-[#FFA500] text-black text-xs font-semibold uppercase tracking-wider hover:brightness-110 transition disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── RICH EMAIL EDITOR ──────────────────────────────────────────────────────

const TOOLBAR_BTN = "p-1.5 rounded hover:bg-white/10 transition text-gray-300 hover:text-white disabled:opacity-30";
const TOOLBAR_ACTIVE = "bg-white/15 text-white";

function ToolbarBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${TOOLBAR_BTN} ${active ? TOOLBAR_ACTIVE : ""}`}
    >
      {children}
    </button>
  );
}

function RichEditor({ content, onChange, onImageUpload, uploading }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[280px] text-gray-200 text-sm leading-relaxed px-5 py-4",
      },
    },
  });

  // Sync external content changes (e.g. template switch) into editor
  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content || "", false);
    }
  }, [content, editor]);

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:", "https://");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-[#1f2937] rounded-xl overflow-hidden bg-[#020617]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-2 border-b border-[#1f2937] bg-[#0a0f14]">

        {/* History */}
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/></svg>
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Headings */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <span className="text-xs font-bold">H1</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <span className="text-xs font-bold">H2</span>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} title="Paragraph">
          <span className="text-xs">¶</span>
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Formatting */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 010 8H6V4zm0 8h9a4 4 0 010 8H6v-8z"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 10H6v3h8v-3h-2.21l3.42-10H18V4h-8z"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-3.01c0-.31-.05-.59-.15-.85-.29-.86-1.2-1.28-2.25-1.28-1.86 0-2.34.94-2.34 1.70 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.29-.3-.54-.63-.54-1.22zM21 12H3v2h9.62c.18.07.4.14.55.2 1.47.5 2.37 1.18 2.37 2.44 0 1.59-1.31 2.24-2.98 2.24-1.38 0-2.51-.49-3.08-1.47-.29-.47-.44-1.01-.44-1.72H6.04c0 .92.25 2.2 1.3 3.15C8.44 20.37 10.21 21 12.24 21c3.39 0 5.76-1.76 5.76-4.68 0-.55-.1-1.06-.28-1.52H21v-2z"/></svg>
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Lists */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 6h13M7 12h13M7 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Alignment */}
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16"/></svg>
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M4 18h16"/></svg>
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Link */}
        <ToolbarBtn onClick={addLink} active={editor.isActive("link")} title="Add link">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        </ToolbarBtn>

        {/* Image upload */}
        <ToolbarBtn onClick={onImageUpload} disabled={uploading} title="Insert image">
          {uploading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          )}
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Blockquote */}
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        </ToolbarBtn>

        {/* Horizontal rule */}
        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/></svg>
        </ToolbarBtn>

        <div className="w-px h-5 bg-white/10 mx-1" />

        {/* Clear */}
        <ToolbarBtn onClick={() => editor.chain().focus().clearContent().run()} title="Clear content">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </ToolbarBtn>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

// ─── TEMPLATE LIBRARY ────────────────────────────────────────────────────────
// Groups: Broadcast, Institutional, Commercial, Community
const TEMPLATE_GROUPS = [
  {
    group: "Broadcast",
    templates: [
      {
        key: "blank",
        label: "Blank",
        subject: "",
        accent: "#FFA500",
        serviceLabel: "Container · RoRo · Air Freight",
        body: "<p>Hi {{name}},</p><p>Write your message here...</p>",
      },
      {
        key: "newsletter",
        label: "Newsletter",
        subject: "Ellcworth Express — Freight Intelligence & Route Updates",
        accent: "#FFA500",
        serviceLabel: "Freight Intelligence",
        body: `<p>Hi {{name}},</p>
<p>Here is the latest from Ellcworth Express — port updates, route news, and practical guides for UK exporters shipping to West Africa.</p>
<h2>In this issue</h2>
<ul>
  <li>Tema Port congestion update — current clearance times</li>
  <li>RoRo vessel schedule — next sailings from Grimsby and Tilbury</li>
  <li>New route: UK to Mombasa — FCL rates now available</li>
  <li>Customs documentation checklist — avoid the three most common errors</li>
</ul>
<p>Add your content above. Each section should be specific and actionable — if a subscriber can act on it, they will.</p>`,
      },
      {
        key: "promo",
        label: "Rate Offer",
        subject: "Current Rates — UK to West Africa | Ellcworth Express",
        accent: "#FFA500",
        serviceLabel: "Container · RoRo · Air Freight",
        body: `<p>Hi {{name}},</p>
<p>We have competitive rates available this month on key UK to West Africa routes. Whether you are moving cargo by sea, air, or RoRo — the options below may be relevant to your next shipment.</p>
<h2>Current rates</h2>
<table>
  <tr><td>RoRo vehicle shipping</td><td>From £750 per unit</td></tr>
  <tr><td>FCL 20ft container</td><td>From £1,500</td></tr>
  <tr><td>FCL 40ft container</td><td>From £2,500</td></tr>
  <tr><td>Air freight to Accra (ACC)</td><td>Quoted per kg</td></tr>
  <tr><td>LCL consolidation</td><td>Quoted per CBM</td></tr>
</table>
<p>All rates are subject to cargo details, availability, and sailing schedule at time of booking. Reply to this email or use the button below to request a quote — we respond within one business day.</p>`,
      },
    ],
  },
  {
    group: "Institutional",
    templates: [
      {
        key: "institutional_certificates",
        label: "Certificate Freight",
        subject: "Degree Certificate Freight — UK to Ghana | Ellcworth Express",
        accent: "#FFA500",
        serviceLabel: "Institutional Freight — Academic Documents",
        body: `<p>Hi {{name}},</p>
<p>If your institution sources degree certificates or academic documents from UK print partners, the logistics side of that supply chain is something we handle every semester.</p>
<h2>What we do</h2>
<ul>
  <li><strong>Direct collection</strong> from your UK printer — same day, no warehouse stop</li>
  <li><strong>Air freight to Accra International Airport (ACC)</strong> — next available flight</li>
  <li><strong>Pre-cleared customs documentation</strong> — clearance begins before the aircraft lands</li>
  <li><strong>Inland delivery to campus</strong> — Tema, Accra, Kumasi, Tamale and beyond</li>
</ul>
<h2>Proven track record</h2>
<p>We shipped 80,000 certificates for the University of Ghana in March 2026 — two pallets, 840kg, five days from collection to confirmed arrival at Accra International Airport. We also ran an emergency air freight operation for UDS Tamale in January 2026, delivering 10 cartons of certificates ahead of a compressed graduation deadline.</p>
<p>If your institution has an upcoming certificate order from a UK supplier, we can confirm a rate within 24 hours.</p>`,
      },
      {
        key: "institutional_equipment",
        label: "Lab & IT Equipment",
        subject: "Lab & IT Equipment Freight — UK to Ghana | Ellcworth Express",
        accent: "#38bdf8",
        serviceLabel: "Institutional Freight — Equipment",
        body: `<p>Hi {{name}},</p>
<p>Laboratory equipment and IT hardware shipped from UK suppliers to Ghanaian institutions requires specialist handling — standard palletisation is not designed for trans-shipment to West Africa.</p>
<h2>How we handle institutional equipment</h2>
<ul>
  <li><strong>Repackaging at our Grays depot</strong> — reinforced crating and lashing for sea transit</li>
  <li><strong>FCL or LCL container options</strong> — depending on volume and timeline</li>
  <li><strong>ICUMS-compliant documentation</strong> — pre-arrival declaration and customs entry prepared in advance</li>
  <li><strong>Tema Port clearance</strong> — managed by our licensed Ghana agents</li>
  <li><strong>Campus delivery</strong> — from Tema directly to your institution</li>
</ul>
<p>We ship to KNUST, University of Ghana, UDS, and UCC regularly. If you have an equipment procurement scheduled from a UK supplier, reply to this email to discuss the freight side.</p>`,
      },
      {
        key: "institutional_ngo",
        label: "NGO / Donor Freight",
        subject: "Donor-Compliant Freight Documentation — UK to Ghana | Ellcworth Express",
        accent: "#34d399",
        serviceLabel: "NGO & Development Freight",
        body: `<p>Hi {{name}},</p>
<p>Freight documentation for donor-funded shipments needs to satisfy two audiences: customs and your grant reporting team. Most forwarders produce what customs requires. Donor reporting needs more.</p>
<h2>Our NGO documentation package includes</h2>
<ul>
  <li>Booking confirmation with cost breakdown</li>
  <li>Bill of lading or air waybill</li>
  <li>Delivery receipt with timestamp</li>
  <li>Commercial invoice formatted for grant expenditure codes</li>
</ul>
<p>We ship for NGOs and community organisations to Ghana and West Africa on an LCL consolidation basis — no minimum volume, no standing contract. You pay for the cubic metres your goods actually occupy.</p>
<p>If your next UK-to-Ghana shipment needs to be fully documented for donor reporting, reply to this email and we will send you a sample documentation pack.</p>`,
      },
    ],
  },
  {
    group: "Commercial",
    templates: [
      {
        key: "commercial_roro",
        label: "RoRo — Vehicle Exporters",
        subject: "Tema Documentation — Your Clearance Time | Ellcworth Express",
        accent: "#a78bfa",
        serviceLabel: "RoRo Vehicle Shipping — Tema & Apapa",
        body: `<p>Hi {{name}},</p>
<p>Most problems at Tema Port are documentation problems. An error on the Bill of Lading or a missing pre-shipment notification can hold a vehicle for days — and demurrage charges accumulate from day one.</p>
<h2>Our RoRo service</h2>
<ul>
  <li><strong>From £750 per vehicle</strong> — cars, vans, 4x4s, trucks</li>
  <li><strong>Departure ports</strong>: Grimsby, Southampton, Tilbury, Sheerness</li>
  <li><strong>Destinations</strong>: Tema (Ghana), Apapa (Nigeria)</li>
  <li><strong>Documentation turnaround</strong>: same day on receipt of V5C and invoice</li>
  <li><strong>Clearance track record</strong>: under 2% documentation rejection rate at Tema</li>
</ul>
<p>If you are running five or more vehicles a month to Ghana or Nigeria, it is worth a direct rate comparison. Reply with your last shipment details — make, model, current location — and we will respond with a rate and clearance time estimate today.</p>`,
      },
      {
        key: "commercial_container",
        label: "Container — Commercial",
        subject: "Container Shipping UK to Ghana — Current Rates | Ellcworth Express",
        accent: "#38bdf8",
        serviceLabel: "FCL & LCL Container Freight",
        body: `<p>Hi {{name}},</p>
<p>We have current FCL and LCL rates available on our UK to Ghana and West Africa routes.</p>
<h2>Container rates</h2>
<table>
  <tr><td>20ft FCL — London Gateway → Tema</td><td>From £1,500</td></tr>
  <tr><td>40ft FCL — London Gateway → Tema</td><td>From £2,500</td></tr>
  <tr><td>LCL consolidation (per CBM)</td><td>Quoted on cargo details</td></tr>
  <tr><td>Transit time — UK to Tema</td><td>15–21 days</td></tr>
</table>
<h2>What is included</h2>
<ul>
  <li>Export customs entry and documentation</li>
  <li>Port handling and bill of lading</li>
  <li>ICUMS pre-arrival declaration (Ghana)</li>
  <li>Tema customs clearance coordination</li>
</ul>
<p>For cargo dimensions and weight, we can confirm a rate within 24 hours. Reply to this email or use the button below.</p>`,
      },
      {
        key: "commercial_air",
        label: "Air Freight — Urgent",
        subject: "Urgent Air Freight UK to Accra — Same Week | Ellcworth Express",
        accent: "#fcd34d",
        serviceLabel: "Priority Air Freight — UK to Accra",
        body: `<p>Hi {{name}},</p>
<p>When cargo cannot wait for a vessel, we operate air freight from Heathrow to Accra International Airport (ACC) on the next available flight.</p>
<h2>Air freight service</h2>
<ul>
  <li><strong>Collection from anywhere in the UK</strong> — same day on confirmation</li>
  <li><strong>Heathrow (LHR) → Accra International Airport (ACC)</strong></li>
  <li><strong>Transit time</strong>: 3–5 days door to door</li>
  <li><strong>Cargo types</strong>: documents, spare parts, pharmaceuticals, high-value goods</li>
  <li><strong>Chain of custody documentation</strong> included as standard</li>
</ul>
<p>For weight and dimensions, we will confirm a rate and departure slot within two hours. Reply to this email directly.</p>`,
      },
    ],
  },
  {
    group: "Community",
    templates: [
      {
        key: "community_lcl",
        label: "LCL — Community Shippers",
        subject: "Shipping to Ghana — Pay Only for What You Send | Ellcworth Express",
        accent: "#FFA500",
        serviceLabel: "LCL Consolidation — UK to Ghana",
        body: `<p>Hi {{name}},</p>
<p>If you are buying goods in the UK to send to Ghana, you do not need to pay for a full container. LCL consolidation means you pay for the exact space your goods occupy — nothing more.</p>
<h2>How it works</h2>
<ul>
  <li>We collect from your UK supplier or you drop off at our Grays depot</li>
  <li>We repack goods for container transit — retail packaging is not built for sea freight</li>
  <li>Your cargo consolidates into our weekly Tema container</li>
  <li>You receive tracking updates and delivery confirmation</li>
</ul>
<p>No minimum volume. No standing contract. Tell us what you are shipping — weight, type of goods, and destination in Ghana — and we will give you a rate comparison against what you are currently paying.</p>`,
      },
    ],
  },
];

// Flat lookup for backwards compatibility
const TEMPLATES = Object.fromEntries(
  TEMPLATE_GROUPS.flatMap((g) => g.templates.map((t) => [t.key, t]))
);


// ─── CONTENT BLOCKS ──────────────────────────────────────────────────────────
// Pre-styled HTML snippets insertable via the block panel
const CONTENT_BLOCKS = [
  {
    label: "Rate table",
    icon: "table",
    html: `<table>
  <tr><td>Service</td><td>Rate</td></tr>
  <tr><td>FCL 20ft</td><td>From £1,500</td></tr>
  <tr><td>FCL 40ft</td><td>From £2,500</td></tr>
  <tr><td>RoRo vehicle</td><td>From £750</td></tr>
  <tr><td>Air freight</td><td>Quoted per kg</td></tr>
</table>`,
  },
  {
    label: "Route line",
    icon: "route",
    html: `<p><strong>Route:</strong> Heathrow (LHR) → Accra International Airport (ACC) · Transit: 3–5 days</p>`,
  },
  {
    label: "Case study callout",
    icon: "case",
    html: `<blockquote><strong>Case study:</strong> University of Ghana — 80,000 certificates, 2 pallets, 840kg. Collected from UK print partner direct to Heathrow. Confirmed at Accra International Airport in 5 days. <em>March 2026.</em></blockquote>`,
  },
  {
    label: "Client quote",
    icon: "quote",
    html: `<blockquote>"I am pleased to inform you that the templates have finally arrived. I want to thank all stakeholders for ensuring a smooth transaction." — Procurement Director, University for Development Studies, January 2026</blockquote>`,
  },
  {
    label: "Checklist",
    icon: "check",
    html: `<ul>
  <li>✓ Item one</li>
  <li>✓ Item two</li>
  <li>✓ Item three</li>
</ul>`,
  },
  {
    label: "Divider",
    icon: "divider",
    html: `<hr/>`,
  },
  {
    label: "CTA button",
    icon: "cta",
    html: `<p style="text-align:center"><a href="https://ellcworth.com/#quote"><strong>→ Request a Quote</strong></a></p>`,
  },
  {
    label: "Contact line",
    icon: "contact",
    html: `<p>To discuss your shipment, reply to this email or call us on <strong>+44 (0)208 979 6054</strong>. We respond within one business day.</p>`,
  },
];


// ─── EMAIL WRAPPER ───────────────────────────────────────────────────────────
// Wraps editable body content in the full branded Ellcworth email shell.
// Used for Preview and Send — the Visual editor only shows the body.

function wrapInTemplate(bodyHtml, accentColor = "#FFA500", serviceLabel = "Container · RoRo · Air Freight") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="dark"/>
  <style>
    body { margin:0; padding:0; background:#04080a; }
    .body-content p { font-size:15px; color:#c9d1d9; line-height:1.75; margin:0 0 18px; }
    .body-content h1 { font-size:22px; font-weight:700; color:#ffffff; margin:0 0 14px; }
    .body-content h2 { font-size:13px; font-weight:700; color:#FFA500; text-transform:uppercase; letter-spacing:0.14em; margin:28px 0 12px; border-bottom:1px solid #1f2937; padding-bottom:8px; }
    .body-content ul { color:#c9d1d9; font-size:14px; line-height:2.1; margin:0 0 20px; padding-left:20px; }
    .body-content ul li { margin-bottom:2px; }
    .body-content a { color:#FFA500; text-decoration:none; }
    .body-content strong { color:#ffffff; font-weight:600; }
    .body-content img { max-width:100%; height:auto; border-radius:8px; margin:16px 0; display:block; }
    .body-content table { width:100%; border-collapse:collapse; font-size:14px; color:#c9d1d9; margin:0 0 20px; }
    .body-content table td { padding:10px 0; border-bottom:1px solid #1f2937; }
    .body-content table td:last-child { text-align:right; color:#ffffff; font-weight:600; }
    .body-content blockquote { border-left:3px solid #FFA500; margin:20px 0; padding:12px 20px; background:#111827; border-radius:0 8px 8px 0; color:#9ca3af; font-style:italic; font-size:14px; line-height:1.8; }
    .body-content blockquote strong { color:#ffffff; }
    .body-content hr { border:none; border-top:1px solid #1f2937; margin:28px 0; }
  </style>
</head>
<body style="margin:0;padding:24px 12px;background:#04080a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

  <div style="max-width:600px;margin:0 auto;background:#0a0f14;border-radius:16px;overflow:hidden;border:1px solid #1f2937;box-shadow:0 24px 60px rgba(0,0,0,0.6);">

    <!-- Top accent bar -->
    <div style="height:3px;background:linear-gradient(90deg,${accentColor},${accentColor}88,transparent);"></div>

    <!-- Header -->
    <div style="background:linear-gradient(160deg,#1a2930 0%,#0d1b22 100%);padding:40px 40px 32px;text-align:center;">
      <p style="font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#6b7280;margin:0 0 10px;font-weight:600;">Ellcworth Express Ltd</p>
      <div style="width:48px;height:2px;background:${accentColor};margin:0 auto 16px;border-radius:2px;"></div>
      <p style="font-size:13px;color:${accentColor};margin:0;letter-spacing:0.08em;text-transform:uppercase;font-weight:600;">${serviceLabel}</p>
    </div>

    <!-- Body -->
    <div class="body-content" style="padding:36px 40px;">
      ${bodyHtml}
    </div>

    <!-- CTA -->
    <div style="padding:4px 40px 36px;text-align:center;">
      <a href="https://ellcworth.com/#quote"
         style="display:inline-block;background:#FFA500;color:#000000;font-weight:700;
                font-size:12px;text-transform:uppercase;letter-spacing:0.16em;
                padding:14px 36px;border-radius:50px;text-decoration:none;
                box-shadow:0 4px 20px rgba(255,165,0,0.35);">
        Get a Quote
      </a>
    </div>

    <!-- Divider -->
    <div style="margin:0 40px;border-top:1px solid #1f2937;"></div>

    <!-- Footer -->
    <div style="padding:24px 40px;text-align:center;">
      <p style="font-size:11px;color:#4b5563;line-height:1.9;margin:0;">
        <strong style="color:#6b7280;font-weight:600;">Ellcworth Express Ltd</strong><br/>
        <a href="https://ellcworth.com" style="color:#FFA500;text-decoration:none;font-weight:500;">ellcworth.com</a>
        &nbsp;·&nbsp;
        <a href="mailto:cs@ellcworth.com" style="color:#6b7280;text-decoration:none;">cs@ellcworth.com</a><br/><br/>
        You are receiving this email because you opted in to marketing<br/>communications from Ellcworth Express.
      </p>
    </div>

    <!-- Bottom accent bar -->
    <div style="height:2px;background:linear-gradient(90deg,transparent,${accentColor}44,transparent);"></div>

  </div>

</body>
</html>`;
}

function CampaignTab() {
  const [subject, setSubject]   = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [tags, setTags]         = useState([]);
  const [template, setTemplate] = useState("blank");
  const [mode, setMode]         = useState("visual"); // "visual" | "html" | "preview"
  const [sending, setSending]       = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [uploading, setUploading]   = useState(false);
  const [dripEnabled, setDripEnabled] = useState(false);
  const [allSubs, setAllSubs]       = useState([]);

  // Fetch subscriber list once so we can show live audience counts
  useEffect(() => {
    fetch(`${MARKETING_API}/subscribers`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => setAllSubs(d.subscribers || []))
      .catch(() => {});
  }, []);

  // Live audience count based on selected tags
  const audienceCount = useMemo(() => {
    const active = allSubs.filter((s) => !s.unsubscribed && s.optedIn);
    if (!tags.length) return active.length;
    return active.filter((s) => tags.some((t) => s.tags?.includes(t))).length;
  }, [allSubs, tags]);
  const textareaRef               = useRef(null);
  const fileInputRef              = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const token = localStorage.getItem("token");
      const res = await fetch(`${MARKETING_API}/upload-image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Upload failed");
      const tag = `<img src="${data.url}" alt="Campaign image" style="max-width:100%;height:auto;border-radius:8px;margin:16px 0;" />`;
      const ta = textareaRef.current;
      if (ta) {
        const start = ta.selectionStart ?? htmlBody.length;
        const end   = ta.selectionEnd   ?? htmlBody.length;
        const next  = htmlBody.slice(0, start) + tag + htmlBody.slice(end);
        setHtmlBody(next);
      } else {
        setHtmlBody((prev) => prev + tag);
      }
    } catch (err) {
      setError(`Image upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const [templateMeta, setTemplateMeta] = useState({ accent: "#FFA500", serviceLabel: "Container · RoRo · Air Freight" });

  const applyTemplate = (key) => {
    setTemplate(key);
    setSubject(TEMPLATES[key].subject);
    setHtmlBody(TEMPLATES[key].body);
    setTemplateMeta({ accent: TEMPLATES[key].accent || "#FFA500", serviceLabel: TEMPLATES[key].serviceLabel || "" });
    setResult(null); setError("");
  };

  const toggleTag = (t) => {
    setTags((prev) => {
      const next = prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t];
      const serviceTags = ["container", "roro", "air"];
      const selected = next.filter((x) => serviceTags.includes(x));
      if (selected.length === 1 && TEMPLATES[selected[0]]) {
        const tpl = TEMPLATES[selected[0]];
        setTemplate(selected[0]);
        setTemplateMeta({ accent: tpl.accent || "#FFA500", serviceLabel: tpl.serviceLabel || "" });
        // Only auto-fill subject/body if the user hasn't written anything yet
        setSubject((prev) => prev.trim() ? prev : tpl.subject);
        setHtmlBody((prev) => prev.trim() ? prev : tpl.body);
      }
      return next;
    });
  };

  const handleSend = async () => {
    if (!subject.trim() || !htmlBody.trim()) { setError("Subject and email body are required."); return; }
    if (!window.confirm(`Send this campaign to all active subscribers${tags.length ? ` tagged: ${tags.join(", ")}` : ""}?\n\nThis cannot be undone.`)) return;
    setSending(true); setError(""); setResult(null);
    try {
      const fullHtml = wrapInTemplate(htmlBody, templateMeta.accent, templateMeta.serviceLabel);
      const res = await fetch(`${MARKETING_API}/campaigns/send`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ subject, htmlBody: fullHtml, tags: tags.length ? tags : undefined, dripEnabled }),
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
      {/* Template picker — grouped */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Start from a template</p>
        <div className="space-y-3">
          {TEMPLATE_GROUPS.map((group) => (
            <div key={group.group}>
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">{group.group}</p>
              <div className="flex flex-wrap gap-2">
                {group.templates.map((t) => (
                  <button key={t.key} onClick={() => applyTemplate(t.key)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-[0.1em] border transition ${
                      template === t.key
                        ? "bg-[#FFA500]/10 border-[#FFA500]/50 text-[#FFA500]"
                        : "bg-[#020617] border-[#1f2937] text-gray-400 hover:text-white hover:border-gray-500"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content block inserter */}
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Insert content block</p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_BLOCKS.map((block) => (
            <button key={block.label}
              onClick={() => {
                setHtmlBody((prev) => prev + "\n" + block.html);
              }}
              className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#1f2937] bg-[#020617] text-gray-400 hover:text-white hover:border-gray-500 transition">
              + {block.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">Blocks are appended to the email body. Switch to HTML mode to edit them directly.</p>
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
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(TAG_META).map(([k, v]) => {
            const segCount = allSubs.filter(
              (s) => !s.unsubscribed && s.optedIn && s.tags?.includes(k)
            ).length;
            return (
              <button key={k} onClick={() => toggleTag(k)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  tags.includes(k) ? v.color : "bg-transparent border-[#1f2937] text-gray-500 hover:text-gray-300"
                }`}>
                {v.label}
                <span className={`
                  inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
                  ${tags.includes(k) ? "bg-white/20 text-white" : "bg-[#1f2937] text-gray-400"}
                `}>
                  {segCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live audience summary */}
        <div className={`
          flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm transition-all
          ${tags.length
            ? "border-[#FFA500]/30 bg-[#FFA500]/5 text-[#FFA500]"
            : "border-[#1f2937] bg-[#020617] text-gray-400"
          }
        `}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>
            {tags.length ? (
              <>
                <span className="font-semibold">{audienceCount}</span>
                {" "}subscriber{audienceCount !== 1 ? "s" : ""} tagged{" "}
                <span className="font-semibold">{tags.join(", ")}</span>
                {" "}will receive this campaign
              </>
            ) : (
              <>
                <span className="font-semibold">{audienceCount}</span>
                {" "}active subscriber{audienceCount !== 1 ? "s" : ""} will receive this campaign
                <span className="text-gray-500 ml-1">(all segments)</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs uppercase tracking-widest text-gray-400">Email body</label>
          <div className="flex items-center gap-1 bg-[#020617] border border-[#1f2937] rounded-lg p-0.5">
            {[
              { id: "visual",  label: "Visual" },
              { id: "html",    label: "HTML" },
              { id: "preview", label: "Preview" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`px-3 py-1 rounded text-xs font-semibold transition ${
                  mode === m.id
                    ? "bg-[#FFA500] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "visual" && (
          <>
            <RichEditor
              content={htmlBody}
              onChange={setHtmlBody}
              onImageUpload={() => fileInputRef.current?.click()}
              uploading={uploading}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </>
        )}

        {mode === "html" && (
          <textarea
            ref={textareaRef}
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            rows={16}
            placeholder="Edit raw HTML here. Use {{name}} for personalisation."
            className="w-full bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#FFA500]/50 transition placeholder:text-gray-600 resize-y"
          />
        )}

        {mode === "preview" && (
          <div className="bg-white rounded-xl overflow-hidden border border-[#1f2937] min-h-[400px]">
            <iframe
              srcDoc={wrapInTemplate(htmlBody, templateMeta.accent, templateMeta.serviceLabel)}
              title="Email preview"
              className="w-full min-h-[400px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        )}

        <p className="text-xs text-gray-500 mt-1.5">
          Use <code className="text-[#FFA500]">{"{{name}}"}</code> to personalise the greeting.
          Switch to <span className="text-gray-300">HTML</span> for full control or <span className="text-gray-300">Preview</span> to see the final email.
        </p>
      </div>

      {error  && <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>}
      {result && <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-sm">✅ {result.message}</div>}

      {/* Drip sequence toggle */}
      <div className="mb-5 flex items-start gap-3 p-4 rounded-xl border border-[#1f2937] bg-[#020617] cursor-pointer hover:border-gray-600 transition" onClick={() => setDripEnabled(p => !p)}>
        <div className={`mt-0.5 w-10 h-5 rounded-full flex items-center transition-colors shrink-0 ${ dripEnabled ? "bg-[#FFA500]" : "bg-[#1f2937]" }`}>
          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mx-0.5 ${ dripEnabled ? "translate-x-5" : "translate-x-0" }`} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-100">Enable drip sequence</p>
          <p className="text-xs text-gray-500 mt-0.5">Automatically follow up with non-openers at Day 3 and Day 7 after sending.</p>
        </div>
      </div>
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


// ─── IMPORT TAB ─────────────────────────────────────────────────────────────

function ImportTab({ onSuccess }) {
  const [file, setFile]           = useState(null);
  const [preview, setPreview]     = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState("");
  const fileInputRef              = useRef(null);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError("");

    // Parse CSV preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(Boolean);
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      const rows = lines.slice(1, 6).map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] || ""]));
      });
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true); setError(""); setResult(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const lines = ev.target.result.split("\n").filter(Boolean);
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));

        const subscribers = lines.slice(1).map((line) => {
          const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
          const row  = Object.fromEntries(headers.map((h, i) => [h, vals[i] || ""]));
          return {
            email:  row.email  || row["e-mail"] || "",
            name:   row.name   || row.fullname  || row["full name"] || "",
            phone:  row.phone  || row.telephone || row.mobile || "",
            source: "import",
            tags:   row.tags   ? row.tags.split("|").map((t) => t.trim()) : ["general"],
          };
        }).filter((s) => s.email.includes("@"));

        if (!subscribers.length) {
          setError("No valid email addresses found in the CSV.");
          setImporting(false);
          return;
        }

        // Send in batches of 50
        let added = 0; let skipped = 0; let failed = 0;
        const batches = [];
        for (let i = 0; i < subscribers.length; i += 50) {
          batches.push(subscribers.slice(i, i + 50));
        }

        for (const batch of batches) {
          const results = await Promise.allSettled(
            batch.map((sub) =>
              fetch(`${MARKETING_API}/subscribers`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(sub),
              }).then((r) => r.json())
            )
          );
          results.forEach((r) => {
            if (r.status === "fulfilled") {
              if (r.value.message?.includes("Already")) skipped++;
              else added++;
            } else {
              failed++;
            }
          });
        }

        setResult({ added, skipped, failed, total: subscribers.length });
        if (added > 0) setTimeout(onSuccess, 3000);
      } catch (err) {
        setError(err.message || "Import failed.");
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl">
      {/* Instructions */}
      <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5 mb-6">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">CSV Format</p>
        <p className="text-sm text-gray-300 mb-3">
          Upload a <code className="text-[#FFA500]">.csv</code> file with the following columns.
          Only <code className="text-[#FFA500]">email</code> is required.
        </p>
        <div className="bg-[#0a0f14] border border-[#1f2937] rounded-lg px-4 py-3 font-mono text-xs text-gray-400 mb-3">
          email, name, phone, tags<br/>
          john@example.com, John Smith, +44 7700 000000, roro|general<br/>
          jane@example.com, Jane Doe, , container
        </div>
        <p className="text-xs text-gray-500">
          For multiple tags use <code className="text-[#FFA500]">|</code> as separator.
          Valid tags: <code className="text-[#FFA500]">container · roro · air · general</code>
        </p>
      </div>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition mb-4
          ${file ? "border-[#FFA500]/50 bg-[#FFA500]/5" : "border-[#1f2937] hover:border-gray-500 bg-[#020617]"}
        `}
      >
        <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        <svg className={`w-8 h-8 mx-auto mb-3 ${file ? "text-[#FFA500]" : "text-gray-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {file ? (
          <p className="text-sm font-semibold text-[#FFA500]">{file.name}</p>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-300">Click to upload a CSV file</p>
            <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
          </>
        )}
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="mb-4 bg-[#020617] border border-[#1f2937] rounded-2xl overflow-hidden">
          <p className="text-xs uppercase tracking-widest text-gray-400 px-4 py-3 border-b border-[#1f2937]">
            Preview — first {preview.length} rows
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1f2937] text-gray-500">
                {Object.keys(preview[0]).map((h) => (
                  <th key={h} className="text-left px-4 py-2 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className="border-b border-[#1f2937]/50">
                  {Object.values(row).map((v, j) => (
                    <td key={j} className="px-4 py-2 text-gray-300">{v || "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error  && <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>}

      {result && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-sm">
          ✅ Import complete — <span className="font-semibold">{result.added} added</span>,{" "}
          {result.skipped} already existed, {result.failed} failed
          {" "}(of {result.total} total rows)
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!file || importing}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFA500] text-black font-semibold text-sm uppercase tracking-[0.14em] shadow-lg shadow-[#FFA500]/20 hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {importing ? "Importing…" : `Import ${preview.length ? "CSV" : "Subscribers"}`}
      </button>
    </div>
  );
}


// ─── CAMPAIGN HISTORY TAB ────────────────────────────────────────────────────

function CampaignHistoryTab() {
  const [campaigns, setCampaigns]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");
  const [selected, setSelected]     = useState(null); // full campaign detail
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${MARKETING_API}/campaigns`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to load campaigns");
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const res  = await fetch(`${MARKETING_API}/campaigns/${id}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setSelected(data.campaign);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const openRate = (c) =>
    c.sentCount ? Math.round((c.openCount / c.sentCount) * 100) : 0;

  const rateColor = (rate) => {
    if (rate >= 50) return "text-emerald-300";
    if (rate >= 25) return "text-amber-300";
    return "text-red-300";
  };

  // ── Detail drawer ──
  if (selected) {
    const rate = openRate(selected);
    const opened = selected.recipients?.filter((r) => r.opened) || [];
    const unopened = selected.recipients?.filter((r) => !r.opened) || [];

    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-6 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to campaigns
        </button>

        {/* Campaign summary */}
        <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-6 mb-6">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Campaign</p>
          <h2 className="text-lg font-semibold text-white mb-4">{selected.subject}</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Sent",       value: selected.sentCount, color: "text-white" },
              { label: "Opened",     value: selected.openCount, color: "text-emerald-300" },
              { label: "Unopened",   value: selected.sentCount - selected.openCount, color: "text-gray-400" },
              { label: "Open Rate",  value: `${rate}%`, color: rateColor(rate) },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0f14] border border-[#1f2937] rounded-xl px-4 py-3">
                <span className="block text-[11px] uppercase tracking-widest text-gray-500">{s.label}</span>
                <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Open rate bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Open rate</span>
              <span className={rateColor(rate)}>{rate}%</span>
            </div>
            <div className="h-2 bg-[#1f2937] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${rate}%`,
                  background: rate >= 50 ? "#34d399" : rate >= 25 ? "#FFA500" : "#f87171",
                }}
              />
            </div>
          </div>
        </div>

        {/* Opened */}
        {opened.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-emerald-400 mb-2">
              ✅ Opened ({opened.length})
            </p>
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] text-[11px] uppercase tracking-widest text-gray-500">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-left px-5 py-3">First Opened</th>
                    <th className="text-left px-5 py-3">Opens</th>
                  </tr>
                </thead>
                <tbody>
                  {opened.map((r, i) => (
                    <tr key={i} className="border-b border-[#1f2937]/50 hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-gray-100">{r.name || "—"}</td>
                      <td className="px-5 py-3 text-gray-300">{r.email}</td>
                      <td className="px-5 py-3 text-gray-400">
                        {r.openedAt ? new Date(r.openedAt).toISOString().slice(0,16).replace("T"," ") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                          {r.openCount}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Unopened */}
        {unopened.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              ⏳ Not yet opened ({unopened.length})
            </p>
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1f2937] text-[11px] uppercase tracking-widest text-gray-500">
                    <th className="text-left px-5 py-3">Name</th>
                    <th className="text-left px-5 py-3">Email</th>
                    <th className="text-center px-5 py-3">Day 3</th>
                    <th className="text-center px-5 py-3">Day 7</th>
                  </tr>
                </thead>
                <tbody>
                  {unopened.map((r, i) => (
                    <tr key={i} className="border-b border-[#1f2937]/50 hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-gray-400">{r.name || "—"}</td>
                      <td className="px-5 py-3 text-gray-500">{r.email}</td>
                      <td className="px-5 py-3 text-center">{r.touch2Sent ? <span className="text-amber-400 text-xs font-semibold">✓ Sent</span> : <span className="text-gray-600 text-xs">Pending</span>}</td>
                      <td className="px-5 py-3 text-center">{r.touch3Sent ? <span className="text-amber-400 text-xs font-semibold">✓ Sent</span> : <span className="text-gray-600 text-xs">Pending</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Campaign list ──
  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="text-sm text-gray-500">Loading campaigns…</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-8 text-center">
          <p className="text-gray-400 text-sm">No campaigns sent yet.</p>
          <p className="text-gray-600 text-xs mt-1">Send your first campaign from the Send Campaign tab.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c) => {
            const rate = openRate(c);
            return (
              <button
                key={c._id}
                onClick={() => fetchDetail(c._id)}
                className="text-left bg-[#020617] border border-[#1f2937] rounded-2xl p-5 hover:bg-white/[0.02] hover:border-gray-600 transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-semibold text-gray-100 truncate">{c.subject}</p>
                      {c.dripEnabled && (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-500/10 text-amber-400 border-amber-500/30">
                          ⚡ Drip
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {c.createdAt ? new Date(c.createdAt).toISOString().slice(0,10) : "—"}
                      {c.tags?.length ? ` · ${c.tags.join(", ")}` : " · all subscribers"}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Sent",   value: c.sentCount, color: "text-white" },
                    { label: "Opened", value: c.openCount, color: "text-emerald-300" },
                    { label: "Rate",   value: `${rate}%`,  color: rateColor(rate) },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#0a0f14] rounded-lg px-3 py-2">
                      <span className="block text-[10px] uppercase tracking-widest text-gray-500">{s.label}</span>
                      <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                    </div>
                  ))}
                </div>

                {/* Mini progress bar */}
                <div className="mt-3 h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${rate}%`,
                      background: rate >= 50 ? "#34d399" : rate >= 25 ? "#FFA500" : "#f87171",
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}


// ─── PROSPECTS TAB ────────────────────────────────────────────────────────────

const SECTORS = [
  { value: "secure_print",               label: "S1 — Secure Print" },
  { value: "lab_equipment",              label: "S2 — Lab Equipment" },
  { value: "it_hardware",                label: "S3 — IT Hardware" },
  { value: "vehicle_exporters",          label: "S4 — Vehicle Exporters" },
  { value: "charities_ngos",             label: "S5 — Charities & NGOs" },
  { value: "commercial_vendors",         label: "S6 — Commercial Vendors" },
  { value: "uk_universities",            label: "S7 — UK Universities" },
  { value: "ghana_public_universities",  label: "S8 — Ghana Public Unis" },
  { value: "ghana_private_universities", label: "S9 — Ghana Private Unis" },
  { value: "ghana_health",               label: "S10 — Ghana Health" },
  { value: "mining",                     label: "S11 — Mining" },
  { value: "automotive_importers",       label: "S12 — Automotive Importers" },
  { value: "ghanaian_smes",              label: "S13 — Ghanaian SMEs" },
  { value: "ghana_ngos",                 label: "S14 — Ghana NGOs" },
];

const STAGES = [
  { value: "cold",       label: "Cold",        color: "bg-slate-500/15 text-slate-300 border-slate-500/40" },
  { value: "contacted",  label: "Contacted",   color: "bg-blue-500/15 text-blue-300 border-blue-500/40" },
  { value: "responded",  label: "Responded",   color: "bg-amber-500/15 text-amber-300 border-amber-500/40" },
  { value: "meeting",    label: "Meeting",     color: "bg-violet-500/15 text-violet-300 border-violet-500/40" },
  { value: "quote_sent", label: "Quote Sent",  color: "bg-sky-500/15 text-sky-300 border-sky-500/40" },
  { value: "converted",  label: "Converted",   color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" },
  { value: "dead",       label: "Dead",        color: "bg-red-500/15 text-red-400 border-red-500/40" },
];

const PLAYBOOK_DAYS = [1, 3, 7, 14, 21, 30, 60, 90];

const CASE_STUDIES = [
  "UDS — Emergency Air Freight (Jan 2026)",
  "University of Ghana — 80,000 Certificates (Mar 2026)",
];

const CHANNELS = [
  { value: "email",      label: "Email" },
  { value: "linkedin",   label: "LinkedIn" },
  { value: "whatsapp",   label: "WhatsApp" },
  { value: "phone",      label: "Phone" },
  { value: "in_person",  label: "In Person" },
  { value: "referral",   label: "Referral" },
];

function stageChip(stage) {
  const s = STAGES.find((x) => x.value === stage) || STAGES[0];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.color}`}>
      {s.label}
    </span>
  );
}

function sectorLabel(value) {
  return SECTORS.find((s) => s.value === value)?.label || value;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// ── Add Prospect Form ──────────────────────────────────────────────────────────
function AddProspectForm({ onSuccess, onCancel }) {
  const empty = { name: "", email: "", phone: "", company: "", sector: "secure_print", channel: "email", nextActionDate: "", nextActionNote: "" };
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch(`${MARKETING_API}/prospects`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = "w-full bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#FFA500]/50 transition placeholder:text-gray-600";
  const label = "block text-xs uppercase tracking-widest text-gray-400 mb-1.5";

  return (
    <div className="max-w-lg bg-[#020617] border border-[#1f2937] rounded-2xl p-6">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">New prospect</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Name *</label>
            <input value={form.name} onChange={set("name")} placeholder="Contact name" className={field} required />
          </div>
          <div>
            <label className={label}>Company</label>
            <input value={form.company} onChange={set("company")} placeholder="Company name" className={field} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Email</label>
            <input type="email" value={form.email} onChange={set("email")} placeholder="email@company.com" className={field} />
          </div>
          <div>
            <label className={label}>Phone</label>
            <input value={form.phone} onChange={set("phone")} placeholder="+44 7700…" className={field} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Sector *</label>
            <select value={form.sector} onChange={set("sector")} className={field}>
              {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Channel</label>
            <select value={form.channel} onChange={set("channel")} className={field}>
              {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>Next action date</label>
            <input type="date" value={form.nextActionDate} onChange={set("nextActionDate")} className={field} />
          </div>
          <div>
            <label className={label}>Next action note</label>
            <input value={form.nextActionNote} onChange={set("nextActionNote")} placeholder="e.g. Send Day 1 cold email" className={field} />
          </div>
        </div>
        {error && <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>}
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 rounded-full bg-[#FFA500] text-black font-semibold text-sm uppercase tracking-[0.14em] hover:brightness-110 transition disabled:opacity-40">
            {saving ? "Saving…" : "Add Prospect"}
          </button>
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 rounded-full border border-[#1f2937] text-gray-400 text-sm hover:text-white transition">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Prospect Detail ────────────────────────────────────────────────────────────
function ProspectDetail({ prospect: initial, onBack, onUpdate }) {
  const [p, setP] = useState(initial);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [nextActionDate, setNextActionDate] = useState(p.nextActionDate ? p.nextActionDate.slice(0,10) : "");
  const [nextActionNote, setNextActionNote] = useState(p.nextActionNote || "");
  const [caseStudy, setCaseStudy] = useState("");

  const patch = async (payload) => {
    setSaving(true);
    try {
      const res = await fetch(`${MARKETING_API}/prospects/${p._id}`, {
        method: "PATCH", headers: authHeaders(), body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setP(data.prospect);
      onUpdate(data.prospect);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const logNote = () => {
    if (!note.trim()) return;
    patch({ note });
    setNote("");
  };

  const markPlaybookDay = (day) => {
    const stageMap = { 1: "contacted", 3: "contacted", 7: "contacted", 14: "contacted", 21: "contacted", 30: "contacted", 60: "contacted", 90: "contacted" };
    patch({ playbookDay: day, note: `Playbook Day ${day} completed.` });
  };

  const sendCaseStudy = () => {
    if (!caseStudy) return;
    patch({ caseStudySent: { name: caseStudy }, note: `Case study sent: ${caseStudy}` });
    setCaseStudy("");
  };

  return (
    <div>
      <button onClick={onBack} className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-6 transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to pipeline
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — contact info + controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-white text-base">{p.name}</p>
                {p.company && <p className="text-sm text-gray-400">{p.company}</p>}
              </div>
              {stageChip(p.stage)}
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              {p.email && <p><span className="text-gray-600">Email</span> <span className="text-gray-200 ml-2">{p.email}</span></p>}
              {p.phone && <p><span className="text-gray-600">Phone</span> <span className="text-gray-200 ml-2">{p.phone}</span></p>}
              <p><span className="text-gray-600">Sector</span> <span className="text-[#FFA500] ml-2">{sectorLabel(p.sector)}</span></p>
              <p><span className="text-gray-600">Channel</span> <span className="text-gray-200 ml-2 capitalize">{p.channel}</span></p>
              <p><span className="text-gray-600">Added</span> <span className="text-gray-200 ml-2">{formatDate(p.createdAt)}</span></p>
              {p.caseStudySent?.name && (
                <p><span className="text-gray-600">Case study</span> <span className="text-emerald-400 ml-2 text-xs">{p.caseStudySent.name}</span></p>
              )}
            </div>
          </div>

          {/* Stage mover */}
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Move stage</p>
            <div className="flex flex-col gap-2">
              {STAGES.map((s) => (
                <button key={s.value} onClick={() => patch({ stage: s.value, note: `Stage moved to: ${s.label}` })}
                  disabled={saving || p.stage === s.value}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold border transition text-left ${
                    p.stage === s.value
                      ? `${s.color} opacity-100`
                      : "bg-transparent border-[#1f2937] text-gray-500 hover:text-gray-300 hover:border-gray-600"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Next action */}
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Next action</p>
            <input type="date" value={nextActionDate} onChange={(e) => setNextActionDate(e.target.value)}
              className="w-full bg-[#0a0f14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm mb-2 outline-none focus:border-[#FFA500]/50" />
            <input value={nextActionNote} onChange={(e) => setNextActionNote(e.target.value)}
              placeholder="What needs to happen?" className="w-full bg-[#0a0f14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#FFA500]/50 placeholder:text-gray-700" />
            <button onClick={() => patch({ nextActionDate, nextActionNote })} disabled={saving}
              className="w-full py-2 rounded-lg bg-[#FFA500]/10 border border-[#FFA500]/30 text-[#FFA500] text-xs font-semibold hover:bg-[#FFA500]/15 transition">
              Save next action
            </button>
          </div>

          {/* Case study sender */}
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Log case study send</p>
            <select value={caseStudy} onChange={(e) => setCaseStudy(e.target.value)}
              className="w-full bg-[#0a0f14] border border-[#1f2937] rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-[#FFA500]/50">
              <option value="">Select case study…</option>
              {CASE_STUDIES.map((cs) => <option key={cs} value={cs}>{cs}</option>)}
            </select>
            <button onClick={sendCaseStudy} disabled={saving || !caseStudy}
              className="w-full py-2 rounded-lg bg-[#FFA500]/10 border border-[#FFA500]/30 text-[#FFA500] text-xs font-semibold hover:bg-[#FFA500]/15 transition disabled:opacity-40">
              Mark as sent
            </button>
          </div>
        </div>

        {/* Right — playbook tracker + notes */}
        <div className="lg:col-span-2 space-y-4">

          {/* Playbook day tracker */}
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Playbook sequence</p>
            <div className="flex flex-wrap gap-2">
              {PLAYBOOK_DAYS.map((day) => {
                const done = p.playbookDay >= day;
                return (
                  <button key={day} onClick={() => markPlaybookDay(day)} disabled={saving}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      done
                        ? "bg-[#FFA500]/15 border-[#FFA500]/50 text-[#FFA500]"
                        : "bg-transparent border-[#1f2937] text-gray-600 hover:text-gray-300 hover:border-gray-600"
                    }`}>
                    Day {day}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Last completed: <span className="text-gray-400">{p.playbookDay > 0 ? `Day ${p.playbookDay}` : "Not started"}</span>
            </p>
          </div>

          {/* Activity log */}
          <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-5">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Activity log</p>

            {/* Add note */}
            <div className="flex gap-2 mb-5">
              <input value={note} onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && logNote()}
                placeholder="Log a call, email, or observation…"
                className="flex-1 bg-[#0a0f14] border border-[#1f2937] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FFA500]/50 placeholder:text-gray-700" />
              <button onClick={logNote} disabled={saving || !note.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#FFA500] text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 transition disabled:opacity-40">
                Log
              </button>
            </div>

            {/* Notes list */}
            {p.notes?.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {[...p.notes].reverse().map((n) => (
                  <div key={n._id} className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFA500]/60 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-300 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{formatDate(n.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No activity logged yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Prospects Tab ──────────────────────────────────────────────────────────────
function ProspectsTab() {
  const [prospects, setProspects]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [view, setView]             = useState("pipeline"); // pipeline | due | add
  const [selected, setSelected]     = useState(null);
  const [sectorFilter, setSectorFilter] = useState("");
  const [stageFilter, setStageFilter]   = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`${MARKETING_API}/prospects`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed");
      setProspects(data.prospects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onUpdate = (updated) => {
    setProspects((prev) => prev.map((p) => p._id === updated._id ? updated : p));
    setSelected(updated);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this prospect?")) return;
    await fetch(`${MARKETING_API}/prospects/${id}`, { method: "DELETE", headers: authHeaders() });
    setProspects((prev) => prev.filter((p) => p._id !== id));
    setSelected(null);
    setView("pipeline");
  };

  // Stats
  const total      = prospects.length;
  const dueToday   = prospects.filter((p) => p.nextActionDate && isOverdue(p.nextActionDate) && !["converted","dead"].includes(p.stage)).length;
  const converted  = prospects.filter((p) => p.stage === "converted").length;
  const active     = prospects.filter((p) => !["converted","dead"].includes(p.stage)).length;

  // Filtered list
  const filtered = prospects.filter((p) => {
    if (sectorFilter && p.sector !== sectorFilter) return false;
    if (stageFilter  && p.stage  !== stageFilter)  return false;
    return true;
  });

  // Due today list
  const dueList = prospects.filter((p) =>
    p.nextActionDate && isOverdue(p.nextActionDate) && !["converted","dead"].includes(p.stage)
  ).sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate));

  if (selected) {
    return (
      <ProspectDetail
        prospect={selected}
        onBack={() => setSelected(null)}
        onUpdate={onUpdate}
      />
    );
  }

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total prospects", value: total,     color: "text-white" },
          { label: "Active",          value: active,    color: "text-blue-300" },
          { label: "Due / overdue",   value: dueToday,  color: dueToday > 0 ? "text-amber-300" : "text-gray-400" },
          { label: "Converted",       value: converted, color: "text-emerald-300" },
        ].map((s) => (
          <div key={s.label} className="bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4">
            <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sub-nav */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex gap-1 bg-[#020617] border border-[#1f2937] rounded-xl p-1">
          {[
            { id: "pipeline", label: "Pipeline" },
            { id: "due",      label: dueToday > 0 ? `Due today (${dueToday})` : "Due today" },
          ].map((v) => (
            <button key={v.id} onClick={() => setView(v.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-[0.14em] transition ${
                view === v.id ? "bg-[#FFA500] text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}>
              {v.label}
            </button>
          ))}
        </div>
        <button onClick={() => setView("add")}
          className="px-5 py-2 rounded-full bg-[#FFA500] text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 transition">
          + Add Prospect
        </button>
      </div>

      {view === "add" && (
        <AddProspectForm onSuccess={() => { load(); setView("pipeline"); }} onCancel={() => setView("pipeline")} />
      )}

      {view === "due" && (
        <div>
          {dueList.length === 0 ? (
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm">No actions due today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dueList.map((p) => (
                <button key={p._id} onClick={() => setSelected(p)}
                  className="w-full text-left bg-[#020617] border border-amber-500/30 rounded-2xl p-5 hover:bg-white/[0.02] transition group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{p.name}{p.company ? ` — ${p.company}` : ""}</p>
                      <p className="text-xs text-[#FFA500] mt-0.5">{sectorLabel(p.sector)}</p>
                      <p className="text-sm text-gray-400 mt-2">{p.nextActionNote || "No action note"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {stageChip(p.stage)}
                      <p className={`text-xs mt-2 ${isOverdue(p.nextActionDate) ? "text-red-400" : "text-gray-500"}`}>
                        {formatDate(p.nextActionDate)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "pipeline" && (
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-5 flex-wrap">
            <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-2 text-sm text-gray-300 outline-none focus:border-[#FFA500]/50">
              <option value="">All sectors</option>
              {SECTORS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
              className="bg-[#020617] border border-[#1f2937] rounded-xl px-4 py-2 text-sm text-gray-300 outline-none focus:border-[#FFA500]/50">
              <option value="">All stages</option>
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/40 text-red-300 text-sm">{error}</div>}

          {loading ? (
            <p className="text-sm text-gray-500">Loading prospects…</p>
          ) : filtered.length === 0 ? (
            <div className="bg-[#020617] border border-[#1f2937] rounded-2xl p-8 text-center">
              <p className="text-gray-400 text-sm">No prospects yet.</p>
              <p className="text-gray-600 text-xs mt-1">Click + Add Prospect to start working the playbook.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p) => (
                <button key={p._id} onClick={() => setSelected(p)}
                  className="w-full text-left bg-[#020617] border border-[#1f2937] rounded-2xl px-5 py-4 hover:bg-white/[0.02] hover:border-gray-600 transition group">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-100 truncate">{p.name}{p.company ? ` — ${p.company}` : ""}</p>
                        {stageChip(p.stage)}
                        {p.playbookDay > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFA500]/10 border border-[#FFA500]/30 text-[#FFA500] font-semibold">
                            Day {p.playbookDay}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{sectorLabel(p.sector)} · {p.channel}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {p.nextActionDate && (
                        <p className={`text-xs font-semibold ${isOverdue(p.nextActionDate) ? "text-red-400" : "text-gray-500"}`}>
                          {isOverdue(p.nextActionDate) ? "Overdue" : formatDate(p.nextActionDate)}
                        </p>
                      )}
                      {p.nextActionNote && <p className="text-xs text-gray-600 mt-0.5 max-w-[180px] truncate">{p.nextActionNote}</p>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Marketing;
