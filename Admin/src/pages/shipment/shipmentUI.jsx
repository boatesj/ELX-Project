// Admin/src/pages/shipment/shipmentUI.jsx

import React from "react";

// ---------- Small UI helpers (mobile-first) ----------

export const Card = ({ title, children, right }) => (
  <div className="bg-white rounded-md p-4 shadow-sm space-y-3">
    <div className="flex items-start justify-between gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
        {title}
      </h2>
      {right ? <div>{right}</div> : null}
    </div>
    {children}
  </div>
);

export const Section = ({ title, subtitle, open, onToggle, children }) => (
  <div className="bg-white rounded-md shadow-sm">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left border-b border-slate-100"
    >
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-[11px] text-gray-500 mt-1">{subtitle}</p>
        ) : null}
      </div>
      <span className="text-xs font-semibold text-[#1A2930]">
        {open ? "Hide" : "Show"}
      </span>
    </button>

    {open ? <div className="px-4 pb-4 pt-3">{children}</div> : null}
  </div>
);

export const Field = ({ label, children, hint }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    {children}
    {hint ? <p className="text-[10px] text-gray-500 mt-0.5">{hint}</p> : null}
  </div>
);

export const Input = (props) => (
  <input
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

export const Select = (props) => (
  <select
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);

export const Textarea = (props) => (
  <textarea
    {...props}
    className={`border border-gray-300 rounded px-3 py-2 text-sm w-full bg-white ${
      props.className || ""
    }`}
  />
);
