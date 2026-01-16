import { useEffect, useMemo, useState } from "react";
import { authRequest } from "../requestMethods";

const KEY_PRESETS = [
  { key: "weekly_sailings", label: "Weekly Sailings" },
  { key: "destinations", label: "Destinations" },
  { key: "announcements", label: "Announcements" },
];

const normaliseKey = (val) =>
  String(val || "")
    .trim()
    .toLowerCase();

export default function Content() {
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeKey, setActiveKey] = useState("");
  const active = useMemo(
    () => blocks.find((b) => b.key === activeKey) || null,
    [blocks, activeKey]
  );

  // Editor state
  const [keyInput, setKeyInput] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchBlocks = async () => {
    setLoading(true);
    setLoadError("");
    setSaveMsg("");

    try {
      const res = await authRequest.get("/content");
      const arr = Array.isArray(res?.data) ? res.data : [];
      setBlocks(arr);

      // Keep selection stable
      if (arr.length > 0) {
        const nextKey =
          activeKey && arr.some((b) => b.key === activeKey)
            ? activeKey
            : arr[0].key;
        setActiveKey(nextKey);
      } else {
        setActiveKey("");
      }
    } catch (err) {
      console.error("Content load error:", err?.response?.data || err);
      setLoadError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load content blocks."
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBlocks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync editor fields when active changes
  useEffect(() => {
    if (!active) {
      setKeyInput("");
      setTitle("");
      setBody("");
      return;
    }
    setKeyInput(active.key || "");
    setTitle(active.title || "");
    setBody(active.body || "");
  }, [activeKey, active]);

  const startNewBlock = (presetKey = "") => {
    setSaveMsg("");
    setActiveKey(""); // not editing an existing one
    setKeyInput(presetKey ? presetKey : "");
    setTitle("");
    setBody("");
  };

  const saveExisting = async () => {
    const key = normaliseKey(keyInput);
    if (!key) return setSaveMsg("Key is required.");
    if (!title.trim()) return setSaveMsg("Title is required.");
    if (!body.trim()) return setSaveMsg("Body is required.");

    setSaving(true);
    setSaveMsg("");

    try {
      const res = await authRequest.put(`/content/${encodeURIComponent(key)}`, {
        title: title.trim(),
        body: body.trim(),
      });

      const updated = res?.data;
      setBlocks((prev) =>
        prev.map((b) => (b.key === key ? { ...b, ...updated } : b))
      );
      setActiveKey(key);
      setSaveMsg("Update successful.");
    } catch (err) {
      console.error("Content update error:", err?.response?.data || err);
      setSaveMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update content."
      );
    } finally {
      setSaving(false);
    }
  };

  const createNew = async () => {
    const key = normaliseKey(keyInput);
    if (!key) return setSaveMsg("Key is required.");
    if (!title.trim()) return setSaveMsg("Title is required.");
    if (!body.trim()) return setSaveMsg("Body is required.");

    setSaving(true);
    setSaveMsg("");

    try {
      const res = await authRequest.post("/content", {
        key,
        title: title.trim(),
        body: body.trim(),
      });

      const created = res?.data;
      setBlocks((prev) => {
        const next = [...prev, created];
        next.sort((a, b) => String(a.key).localeCompare(String(b.key)));
        return next;
      });
      setActiveKey(key);
      setSaveMsg("Created successfully.");
    } catch (err) {
      console.error("Content create error:", err?.response?.data || err);
      setSaveMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create content."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteBlock = async (key) => {
    const k = normaliseKey(key);
    if (!k) return;

    const ok = window.confirm(
      `Delete content block "${k}"?\n\nThis cannot be undone.`
    );
    if (!ok) return;

    setSaving(true);
    setSaveMsg("");

    try {
      await authRequest.delete(`/content/${encodeURIComponent(k)}`);
      setBlocks((prev) => prev.filter((b) => b.key !== k));

      // Move selection
      const remaining = blocks.filter((b) => b.key !== k);
      setActiveKey(remaining[0]?.key || "");
      setSaveMsg("Deleted.");
    } catch (err) {
      console.error("Content delete error:", err?.response?.data || err);
      setSaveMsg(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete content."
      );
    } finally {
      setSaving(false);
    }
  };

  const isEditingExisting = useMemo(() => {
    const key = normaliseKey(keyInput);
    return !!key && blocks.some((b) => b.key === key);
  }, [blocks, keyInput]);

  return (
    <div className="bg-[#D9D9D9] rounded-md p-3 sm:p-5 lg:p-[20px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-[18px] sm:text-[20px] font-semibold">
            Content Management
          </h1>
          <p className="mt-1 text-[12px] text-slate-700 max-w-3xl">
            Update public-facing content without redeploying. Use keys like{" "}
            <span className="font-semibold">weekly_sailings</span>,{" "}
            <span className="font-semibold">destinations</span>, and{" "}
            <span className="font-semibold">announcements</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={fetchBlocks}
            className="bg-white border border-slate-200 px-4 py-2 rounded-md font-semibold text-sm hover:bg-slate-50 transition"
            disabled={loading}
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={() => startNewBlock("")}
            className="bg-[#1A2930] text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-[#FFA500] hover:text-black transition"
          >
            New block
          </button>
        </div>
      </div>

      {loadError ? (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {loadError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* LEFT: list */}
        <div className="bg-white rounded-md p-4 shadow-md border border-slate-100">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm font-semibold text-slate-900">Blocks</p>
            <div className="flex gap-2">
              {KEY_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => startNewBlock(p.key)}
                  className="text-[11px] px-2 py-1 rounded-full border border-slate-200 bg-slate-50 hover:bg-white transition"
                  title={`Create "${p.key}"`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-sm text-slate-600">Loading content…</div>
          ) : blocks.length === 0 ? (
            <div className="text-sm text-slate-600">
              No content blocks yet. Create one on the right.
            </div>
          ) : (
            <ul className="space-y-2">
              {blocks.map((b) => {
                const activeRow = b.key === activeKey;
                return (
                  <li key={b._id || b.key}>
                    <button
                      type="button"
                      onClick={() => setActiveKey(b.key)}
                      className={`w-full text-left rounded-md px-3 py-2 border transition ${
                        activeRow
                          ? "border-[#FFA500] bg-[#FFA500]/10"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {b.title || "Untitled"}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {b.key}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] text-slate-600 line-clamp-2">
                        {b.body || ""}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* RIGHT: editor */}
        <div className="bg-white rounded-md p-4 shadow-md border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Editor</p>
              <p className="text-[12px] text-slate-600">
                {isEditingExisting
                  ? "Editing existing block"
                  : "Creating a new block"}
              </p>
            </div>

            {isEditingExisting ? (
              <button
                type="button"
                onClick={() => deleteBlock(keyInput)}
                className="px-4 py-2 rounded-md font-semibold text-sm bg-red-600 text-white hover:bg-red-700 transition"
                disabled={saving}
              >
                Delete
              </button>
            ) : null}
          </div>

          {saveMsg ? (
            <div
              className={`mb-3 rounded-md p-3 text-sm border ${
                saveMsg.toLowerCase().includes("successful") ||
                saveMsg.toLowerCase().includes("created") ||
                saveMsg.toLowerCase().includes("deleted")
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-amber-50 border-amber-200 text-amber-800"
              }`}
            >
              {saveMsg}
            </div>
          ) : null}

          <div className="grid gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                Key (unique)
              </label>
              <input
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="weekly_sailings"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/30"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Lowercase with underscores recommended.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Weekly Sailings"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/30"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1">
                Body (markdown/plain text)
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Add content here…"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#FFA500]/30"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              {isEditingExisting ? (
                <button
                  type="button"
                  onClick={saveExisting}
                  disabled={saving}
                  className="w-full sm:w-auto bg-[#FFA500] text-black px-5 py-2.5 rounded-md font-semibold hover:bg-[#e69300] transition disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={createNew}
                  disabled={saving}
                  className="w-full sm:w-auto bg-[#1A2930] text-white px-5 py-2.5 rounded-md font-semibold hover:bg-[#FFA500] hover:text-black transition disabled:opacity-60"
                >
                  {saving ? "Creating…" : "Create block"}
                </button>
              )}

              <button
                type="button"
                onClick={() => startNewBlock("")}
                disabled={saving}
                className="w-full sm:w-auto bg-white border border-slate-200 px-5 py-2.5 rounded-md font-semibold hover:bg-slate-50 transition disabled:opacity-60"
              >
                Clear
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Tip: Use the public API to render these blocks on the website:
              <span className="font-mono"> /api/v1/content/:key</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
