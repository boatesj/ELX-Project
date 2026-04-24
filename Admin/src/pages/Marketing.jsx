import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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

const TEMPLATES = {
  blank: {
    subject: "",
    accent: "#FFA500",
    serviceLabel: "Container · RoRo · Air Freight",
    body: "<p>Hi {{name}},</p><p>Write your message here...</p>",
  },
  promo: {
    subject: "🚢 May Shipping Deals — Air, Container & RoRo to West Africa",
    accent: "#FFA500",
    serviceLabel: "Container · RoRo · Air Freight",
    body: `<p>Hi {{name}},</p>
<p>We're pleased to share some of our most competitive rates this May on key routes from the UK to West Africa. Whether you're moving cargo by air, sea, or vehicle — we have a solution that works for your timeline and budget.</p>
<h2>This Month's Rates</h2>
<ul>
  <li>✈️ <strong>Air Freight</strong> — 24-hour delivery to Accra (Kotoka International Airport)</li>
  <li>📦 <strong>FCL Container</strong> — MSC 40ft High Cube from £2,500 (London Gateway → Tema)</li>
  <li>🚗 <strong>RoRo Vehicle Shipping</strong> — from £500 (Sheerness / Teesport → Tema)</li>
</ul>
<p>All rates are subject to availability and cargo details. Our team is ready to provide a full quotation tailored to your shipment — including customs clearance, documentation, and door delivery options where required.</p>
<p>To secure these rates or request a full quote, click the button below or reply directly to this email. Our team responds within one business day.</p>`,
  },
  container: {
    subject: "📦 Container Shipping Rates — Ellcworth Express",
    accent: "#38bdf8",
    serviceLabel: "FCL & LCL Container Freight",
    body: `<p>Hi {{name}},</p>
<p>We have updated container rates on our UK to West Africa routes. Whether you need a full container (FCL) or shared space (LCL), we have flexible options to suit your cargo and budget.</p>
<h2>Container Options</h2>
<ul>
  <li>20ft FCL — From £XXX</li>
  <li>40ft FCL — From £XXX</li>
  <li>LCL (per CBM) — From £XXX</li>
</ul>
<p>Get in touch for a competitive quote on your route.</p>`,
  },
  roro: {
    subject: "🚗 RoRo Vehicle Shipping — Ellcworth Express",
    accent: "#a78bfa",
    serviceLabel: "Vehicle Shipping — Cars, 4x4s & Commercial",
    body: `<p>Hi {{name}},</p>
<p>Shipping your vehicle to West Africa? Our RoRo service offers safe, cost-effective transport from major UK ports to destinations including Tema, Lagos, Cotonou, and more.</p>
<h2>Why Choose Our RoRo Service</h2>
<ul>
  <li>Competitive rates from Tilbury, Sheerness & Southampton</li>
  <li>Runners and non-runners accepted</li>
  <li>Full tracking from port to destination</li>
  <li>Experienced customs clearance team</li>
</ul>
<p>Contact us today for a RoRo quote on your vehicle.</p>`,
  },
  air: {
    subject: "✈️ Priority Air Freight — Certified Same-Day UK to Accra | Ellcworth Express",
    accent: "#fcd34d",
    serviceLabel: "Priority Air Freight — UK to Accra",
    body: `<p>Hi {{name}},</p>

<p>When your institution's documents, certificates, and executive cargo cannot wait — neither do we.</p>

<p>Ellcworth Express operates a dedicated priority air freight service between the United Kingdom and Accra's Kotoka International Airport, purpose-built for the exacting standards of Ghana's leading institutions.</p>

<p>Whether you are dispatching official university certificates, academic credentials, time-sensitive procurement documents, or high-value executive cargo — our service guarantees speed, security, and complete chain-of-custody visibility from collection to delivery.</p>

<h2>Our Priority Air Freight Service</h2>
<ul>
  <li>✦ <strong>Same-day UK collection</strong> — we collect directly from your institution</li>
  <li>✦ <strong>24-hour delivery</strong> to Kotoka International Airport, Accra</li>
  <li>✦ <strong>Onward delivery</strong> to your institution available on request</li>
  <li>✦ <strong>Real-time tracking</strong> from dispatch to final delivery</li>
  <li>✦ <strong>Fully insured</strong>, tamper-evident secure packaging</li>
  <li>✦ <strong>Dedicated account manager</strong> — one point of contact, always</li>
</ul>

<h2>Why Procurement Directors Choose Ellcworth Express</h2>
<p>We understand that academic credentials and institutional documents carry legal and reputational weight. Our handling protocols are designed to meet the compliance requirements of Ghana's public institutions, with full documentation provided for customs clearance and institutional records.</p>

<p><strong>No queues. No delays. No compromise.</strong></p>

<p>To arrange a priority collection or discuss a regular service agreement for your institution, reply directly to this email or speak with our team today.</p>`,
  },
  newsletter: {
    subject: "📦 Ellcworth Express — Shipping News & Updates",
    accent: "#FFA500",
    serviceLabel: "Industry News & Updates",
    body: `<p>Hi {{name}},</p>
<p>Here's the latest from Ellcworth Express — industry updates, route news, and tips to make your next shipment smoother.</p>
<h2>In This Issue</h2>
<ul>
  <li>Port congestion update — Tema & Lagos</li>
  <li>New RoRo vessel schedule — Q3 departures</li>
  <li>Customs documentation checklist</li>
  <li>Customer spotlight</li>
</ul>
<p>Add your newsletter content here. Our team is always available to answer any questions about your shipment.</p>`,
  },
};



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
        setSubject(tpl.subject);
        setHtmlBody(tpl.body);
        setTemplateMeta({ accent: tpl.accent || "#FFA500", serviceLabel: tpl.serviceLabel || "" });
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

export default Marketing;
