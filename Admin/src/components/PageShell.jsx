import React from "react";

export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="w-full">
      {/* Top header */}
      <div className="sticky top-0 z-10 bg-[#0B1118]/80 backdrop-blur border-b border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-white font-semibold tracking-[0.02em] text-lg sm:text-xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-gray-400 text-[12px] sm:text-[13px] mt-1">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">{children}</div>
    </div>
  );
}
