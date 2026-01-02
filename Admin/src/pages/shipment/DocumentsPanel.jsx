import React from "react";

const DocumentsPanel = ({
  documents,
  docError,

  newDocName,
  setNewDocName,

  newDocFile,
  setNewDocFile,

  uploadingDoc,
  uploadProgress,

  onUpload,

  fileInputRef,
}) => {
  return (
    <>
      {docError ? (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">
          {docError}
        </p>
      ) : null}

      <div className="space-y-2">
        {(documents || []).length === 0 ? (
          <p className="text-xs text-gray-500">
            No documents uploaded yet for this shipment.
          </p>
        ) : (
          <ul className="space-y-1 text-xs">
            {(documents || []).map((doc, idx) => (
              <li
                key={doc.fileUrl || idx}
                className="flex items-center justify-between border border-gray-100 rounded-md px-3 py-2"
              >
                <div className="flex flex-col">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] font-medium text-[#1A2930] hover:text-[#FFA500]"
                  >
                    {doc.name}
                  </a>
                  <span className="text-[10px] text-gray-500">
                    Uploaded{" "}
                    {doc.uploadedAt
                      ? new Date(doc.uploadedAt).toLocaleDateString("en-GB")
                      : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Attach panel */}
      <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
        <p className="text-[11px] font-semibold text-gray-700">
          Attach new document
        </p>

        <input
          type="text"
          value={newDocName}
          onChange={(e) => setNewDocName(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white text-xs py-1.5"
          placeholder="Document name (e.g. Invoice, Draft BL, Packing list)"
        />

        {/* Upload file */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.csv,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setNewDocFile(file);
            }}
            className="block w-full text-xs text-gray-700
              file:mr-3 file:py-1.5 file:px-3
              file:rounded file:border-0
              file:text-xs file:font-semibold
              file:bg-slate-100 file:text-slate-900
              hover:file:bg-slate-200"
          />

          {newDocFile ? (
            <p className="text-[10px] text-gray-600">
              Selected: <span className="font-mono">{newDocFile.name}</span>
            </p>
          ) : null}

          {uploadingDoc ? (
            <div className="mt-1">
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded">
                <div
                  className="h-2 bg-[#FFA500] rounded"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, uploadProgress || 0)
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onUpload}
              disabled={uploadingDoc}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-[#FFA500] text-black hover:bg-[#e69300] transition disabled:opacity-60 disabled:cursor-not-allowed"
              title="Upload a local file to this shipment"
            >
              {uploadingDoc ? "Uploading…" : "Upload file"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentsPanel;
