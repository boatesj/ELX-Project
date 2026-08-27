import { useEffect, useState } from "react";
import { authRequest } from "../requestMethods";
import { FaCheck, FaTimes, FaTrash, FaGlobe, FaGlobeEurope } from "react-icons/fa";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-500 border border-gray-200",
  submitted: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
};

function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [drafts, setDrafts] = useState({});

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authRequest.get("/feedback");
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const draftFor = (item) =>
    drafts[item._id] ?? {
      displayName: item.displayName || "",
      displayQuote: item.displayQuote || "",
    };

  const handleDraftChange = (item, field, value) => {
    setDrafts((prev) => ({
      ...prev,
      [item._id]: { ...draftFor(item), [field]: value },
    }));
  };

  const handleApprove = async (item, isPublic) => {
    const draft = draftFor(item);
    try {
      const res = await authRequest.patch(`/feedback/${item._id}/approve`, {
        displayName: draft.displayName,
        displayQuote: draft.displayQuote,
        isPublic,
      });
      const updated = res.data;
      setItems((prev) => prev.map((f) => (f._id === item._id ? updated : f)));
      setSuccess(isPublic ? "Published to the homepage." : "Approved (kept off the homepage for now).");
    } catch (err) {
      console.error(err);
      setError("Could not update this feedback.");
    }
  };

  const handleReject = async (item) => {
    try {
      const res = await authRequest.patch(`/feedback/${item._id}/reject`);
      const updated = res.data;
      setItems((prev) => prev.map((f) => (f._id === item._id ? updated : f)));
      setSuccess("Feedback rejected — kept on record, hidden from the site.");
    } catch (err) {
      console.error(err);
      setError("Could not reject this feedback.");
    }
  };

  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `Delete this feedback request from ${item.clientName || "this customer"}? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      await authRequest.delete(`/feedback/${item._id}`);
      setItems((prev) => prev.filter((f) => f._id !== item._id));
      setSuccess("Feedback request deleted.");
    } catch (err) {
      console.error(err);
      setError("Could not delete this feedback request.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A2930]">Testimonials</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review submitted feedback, tidy the wording, and publish approved quotes to the
            homepage. Nothing appears on the public site until you publish it here.
          </p>
        </div>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[#1A2930]">
            All feedback requests ({items.length})
          </h2>
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const draft = draftFor(item);
            const canReview = item.status === "submitted" || item.status === "approved";

            return (
              <div
                key={item._id}
                className="rounded-xl border border-gray-200 p-4 hover:border-gray-300"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {item.clientName}
                      {item.clientTitle ? `, ${item.clientTitle}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.organisation} · {item.source}
                      {item.context ? ` · ${item.context}` : ""}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Requested {formatDate(item.createdAt)}
                      {item.respondedAt ? ` · Responded ${formatDate(item.respondedAt)}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium capitalize ${
                        STATUS_STYLES[item.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.isPublic && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#1A2930]/5 px-2 py-1 text-[11px] font-medium text-[#1A2930]">
                        <FaGlobe className="text-[10px]" /> Live on site
                      </span>
                    )}
                  </div>
                </div>

                {item.status === "pending" && (
                  <p className="mt-3 text-xs text-gray-400 italic">
                    Awaiting a response from the customer.
                  </p>
                )}

                {item.status !== "pending" && (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
                      <p>
                        <span className="font-semibold text-gray-700">Rating:</span>{" "}
                        {item.rating ? `${item.rating} / 5` : "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Communication:</span>{" "}
                        {item.answers?.communication ? `${item.answers.communication} / 5` : "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Timeliness:</span>{" "}
                        {item.answers?.timeliness || "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-700">Would recommend:</span>{" "}
                        {item.answers?.wouldRecommend === true
                          ? "Yes"
                          : item.answers?.wouldRecommend === false
                          ? "No"
                          : "—"}
                      </p>
                      {item.answers?.improvementNote && (
                        <p className="pt-1 border-t border-gray-200 mt-1">
                          <span className="font-semibold text-gray-700">
                            Private — could we improve:
                          </span>{" "}
                          {item.answers.improvementNote}
                        </p>
                      )}
                    </div>

                    {canReview && (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] font-semibold text-gray-600">
                            Display name (shown on site)
                          </label>
                          <input
                            value={draft.displayName}
                            onChange={(e) =>
                              handleDraftChange(item, "displayName", e.target.value)
                            }
                            placeholder="Director of Procurement, University of Ghana"
                            className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#FFA500] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-gray-600">
                            Public quote (edit before publishing)
                          </label>
                          <textarea
                            value={draft.displayQuote}
                            onChange={(e) =>
                              handleDraftChange(item, "displayQuote", e.target.value)
                            }
                            rows={3}
                            className="mt-0.5 w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#FFA500] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  {canReview && !item.isPublic && (
                    <button
                      type="button"
                      onClick={() => handleApprove(item, true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#1A2930] px-3 py-1.5 font-semibold text-[#FFA500] hover:bg-[#0F1720]"
                    >
                      <FaCheck className="text-[11px]" /> Approve &amp; publish
                    </button>
                  )}
                  {canReview && item.isPublic && (
                    <button
                      type="button"
                      onClick={() => handleApprove(item, false)}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      <FaGlobeEurope className="text-[11px]" /> Unpublish
                    </button>
                  )}
                  {item.status === "submitted" && (
                    <button
                      type="button"
                      onClick={() => handleReject(item)}
                      className="inline-flex items-center gap-1 text-red-500 hover:text-red-600"
                    >
                      <FaTimes className="text-[11px]" /> Reject
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="inline-flex items-center gap-1 text-gray-400 hover:text-red-600 ml-auto"
                  >
                    <FaTrash className="text-[11px]" /> Delete
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && items.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-gray-500">
              No feedback requests yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Testimonials;
