// Backend/controllers/shipment.js
const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");
const User = require("../models/User");
const Port = require("../models/Port");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const buildCustomerRequestSnapshot = require("../helpers/buildCustomerRequestSnapshot");

// ✅ Mail dispatcher (local util abstraction)
// Controllers should not depend on BackgroundServices folder structure.
const { dispatchMail } = require("../utils/dispatchMail");

// ---------------- BRAND + COPY (Corporate Standards) ----------------
//
// Keep these values consistent across all outbound customer emails.
// If brand colours change, update here only.
//
const BRAND = {
  name: "Ellcworth Express",
  tagline: "UK → Africa Logistics",
  colours: {
    navy: "#1A2930",
    accent: "#FFA500",
    bg: "#f8fafc",
    cardBorder: "#e5e7eb",
    text: "#0f172a",
    muted: "#64748b",
  },
};

// ---------------- STATUS (MUST MATCH Shipment.js ENUM) ----------------
const ALLOWED_STATUSES = [
  // Request → Quote workflow
  "request_received",
  "under_review",
  "quoted",
  "customer_requested_changes",
  "customer_approved",

  // Operational
  "pending",
  "booked",
  "at_origin_yard",
  "loaded",
  "sailed",
  "arrived",
  "cleared",
  "delivered",
  "cancelled",
];

// ---------------- QUOTE HELPERS (Option A sync + totals) ----------------

function toNumber(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function round2(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

/**
 * Line-items totals helper
 * Input: lineItems[]
 * Output: { clean, subtotal, taxTotal, total }
 */
function computeQuoteTotals(lineItems = []) {
  const items = Array.isArray(lineItems) ? lineItems : [];

  const clean = items.map((li) => {
    const qty = toNumber(li.qty, 1);
    const unitPrice = toNumber(li.unitPrice, 0);

    // amount can be explicitly set, otherwise derived
    const amountRaw =
      li.amount !== undefined && li.amount !== null && li.amount !== ""
        ? toNumber(li.amount, qty * unitPrice)
        : qty * unitPrice;

    const taxRate = toNumber(li.taxRate, 0);
    const tax = (amountRaw * taxRate) / 100;

    return {
      ...li,
      qty,
      unitPrice: round2(unitPrice),
      amount: round2(amountRaw),
      taxRate,
      _tax: round2(tax),
    };
  });

  const subtotal = round2(clean.reduce((s, x) => s + toNumber(x.amount, 0), 0));
  const taxTotal = round2(clean.reduce((s, x) => s + toNumber(x._tax, 0), 0));
  const total = round2(subtotal + taxTotal);

  return { clean, subtotal, taxTotal, total };
}

/**
 * Convert quote lineItems to charges[] (SCHEMA-SAFE)
 * Shipment.js ChargeSchema: { label, amount, currency, category }
 *
 * We store a single amount per line item (li.amount) and keep it simple.
 */
function quoteLineItemsToCharges(lineItems = [], currency = "GBP") {
  const items = Array.isArray(lineItems) ? lineItems : [];
  const cur = String(currency || "GBP").trim() || "GBP";

  return items
    .filter((li) => String(li?.label || "").trim())
    .map((li) => {
      const qty = toNumber(li.qty, 1);
      const unitPrice = toNumber(li.unitPrice, 0);

      const amount =
        li.amount !== undefined && li.amount !== null && li.amount !== ""
          ? toNumber(li.amount, qty * unitPrice)
          : qty * unitPrice;

      return {
        label: String(li.label || "").trim(),
        amount: round2(amount),
        currency: cur,
        category: "quote",
      };
    });
}

// ---------------- ROLE HELPERS ----------------

/**
 * Role helpers (requireAuth normalizes role to lower-case)
 * Admin in token may be "admin"; in DB enum you also have "Admin".
 */
function isAdmin(req) {
  const role = String(req?.user?.role || "").toLowerCase();
  return role === "admin";
}

function requireUserId(req) {
  const id = req?.user?.id;
  return id ? String(id) : null;
}

// ---------------- QUERY HELPERS ----------------

/**
 * Helper: normalise filters from query string (ADMIN USE)
 */
function buildShipmentFilter(query = {}) {
  const {
    customer,
    status,
    mode,
    originPort,
    destinationPort,
    fromDate,
    toDate,
    search,
  } = query;

  const filter = { isDeleted: false };

  if (customer) filter.customer = customer; // expects ObjectId string
  if (status) filter.status = status;
  if (mode) filter.mode = mode;

  // NOTE: dashboard + lists currently use ports.originPort / ports.destinationPort
  if (originPort) filter["ports.originPort"] = originPort;
  if (destinationPort) filter["ports.destinationPort"] = destinationPort;

  if (fromDate || toDate) {
    filter.shippingDate = {};
    if (fromDate) filter.shippingDate.$gte = new Date(fromDate);
    if (toDate) filter.shippingDate.$lte = new Date(toDate);
  }

  if (search) {
    const regex = new RegExp(String(search).trim(), "i");
    filter.$or = [
      { referenceNo: regex },
      { "shipper.name": regex },
      { "consignee.name": regex },
      { "ports.originPort": regex },
      { "ports.destinationPort": regex },
      { "cargo.description": regex },
    ];
  }

  return filter;
}

/**
 * Helper: ensure shipment exists and caller can access it
 * - Admin: can access any non-deleted shipment
 * - Customer: only their own (customer == req.user.id)
 */
async function findAccessibleShipmentById(req, id, opts = {}) {
  const { lean = false, populateCustomer = true } = opts;

  if (!mongoose.isValidObjectId(id)) return { error: "Invalid shipment id" };

  const base = { _id: id, isDeleted: false };
  const userId = requireUserId(req);

  if (!isAdmin(req)) {
    if (!userId) return { error: "Unauthorized" };
    base.customer = userId;
  }

  let q = Shipment.findOne(base);
  if (populateCustomer) q = q.populate("customer", "fullname email country");
  if (lean) q = q.lean();

  const shipment = await q;
  if (!shipment) return { error: "Shipment not found" };

  return { shipment };
}

/**
 * Helper: restrict update fields for customers
 * Admin can update anything except protected internal fields.
 */
function sanitizeUpdatesForRole(req, updates) {
  const clean = { ...updates };

  // Always protected, regardless of role:
  delete clean.isDeleted; // never directly
  delete clean.__v;

  // Reference number should not be mutated via update route
  delete clean.referenceNo;

  // ✅ Immutable customer intent snapshot must never be mutated via update route
  delete clean.customerRequest;

  // These should never be client-controlled:
  delete clean.createdBy;

  // 🚫 Ownership reassignment via update route is risky
  delete clean.customer;

  if (!isAdmin(req)) {
    // Customers can never change admin-only / audit / financial areas
    delete clean.trackingEvents;
    delete clean.documents;
    delete clean.charges;
    delete clean.notifications;
    delete clean.paymentStatus;
    delete clean.status; // admin-only via PATCH status route anyway

    // ✅ Quote is admin-only
    delete clean.quote;
  }

  return clean;
}

function isBlankCustomerRequest(cr) {
  if (!cr || typeof cr !== "object") return true;

  const origin = String(cr?.route?.origin || "").trim();
  const destination = String(cr?.route?.destination || "").trim();

  return !origin && !destination;
}

// ---------------- QUOTE HELPERS (email formatting, etc.) ----------------

function toMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

/**
 * Existing quote-object normalizer (kept for email builder / sendQuoteEmail)
 */
function computeQuoteObjectTotals(rawQuote = {}) {
  const currency = String(rawQuote.currency || "GBP").trim() || "GBP";
  const lineItems = Array.isArray(rawQuote.lineItems) ? rawQuote.lineItems : [];

  const normalizedItems = lineItems
    .filter((li) => li && String(li.label || "").trim())
    .map((li) => {
      const qty = Number(li.qty ?? 1);
      const unitPrice = Number(li.unitPrice ?? 0);

      const safeQty = Number.isFinite(qty) ? qty : 1;
      const safeUnit = Number.isFinite(unitPrice) ? unitPrice : 0;

      const computedAmount = toMoney(safeQty * safeUnit);
      const amount = toMoney(li.amount ?? computedAmount);

      const taxRate = Number(li.taxRate ?? 0);
      const safeTaxRate = Number.isFinite(taxRate) ? taxRate : 0;

      const tax = toMoney((amount * safeTaxRate) / 100);

      return {
        code: String(li.code || "").trim(),
        label: String(li.label || "").trim(),
        qty: safeQty,
        unitPrice: toMoney(safeUnit),
        amount: toMoney(amount),
        taxRate: safeTaxRate,
        _tax: tax, // internal compute only
      };
    });

  const subtotal = toMoney(
    normalizedItems.reduce((sum, li) => sum + (Number(li.amount) || 0), 0),
  );

  const taxTotal = toMoney(
    normalizedItems.reduce((sum, li) => sum + (Number(li._tax) || 0), 0),
  );

  const total = toMoney(subtotal + taxTotal);

  const finalItems = normalizedItems.map(({ _tax, ...rest }) => rest);

  return {
    currency,
    validUntil: rawQuote.validUntil ? new Date(rawQuote.validUntil) : undefined,
    notesToCustomer: String(rawQuote.notesToCustomer || "").trim(),
    internalNotes: String(rawQuote.internalNotes || "").trim(),
    lineItems: finalItems,
    subtotal,
    taxTotal,
    total,
  };
}

function formatCurrency(amount, currency = "GBP") {
  const n = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${toMoney(n).toFixed(2)}`;
  }
}

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatUkDateMaybe(dateLike) {
  if (!dateLike) return "";
  try {
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB");
  } catch {
    return "";
  }
}

function brandHeaderHtml({ title, reference }) {
  const ref = escapeHtml(reference || "");
  return `
    <div style="padding:18px 22px;background:${BRAND.colours.navy};color:#fff;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div>
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:.92;">${escapeHtml(
            BRAND.name,
          )}</div>
          <div style="margin-top:6px;font-size:18px;font-weight:800;">${escapeHtml(
            title,
          )}</div>
          <div style="margin-top:6px;font-size:12px;opacity:.92;">
            Reference: <span style="font-family:monospace;">${ref}</span>
          </div>
        </div>
        <div style="width:10px;min-height:54px;background:${
          BRAND.colours.accent
        };border-radius:999px;"></div>
      </div>
    </div>
  `;
}

/**
 * ✅ CORPORATE Quote Email HTML
 */
function buildQuoteEmailHtml({ shipment, quote, approveInstruction }) {
  const refRaw = shipment.referenceNo || "";
  const shipperName = escapeHtml(shipment.shipper?.name || "Customer");
  const origin = escapeHtml(shipment.ports?.originPort || "");
  const dest = escapeHtml(shipment.ports?.destinationPort || "");
  const serviceType = escapeHtml(shipment.serviceType || "");
  const mode = escapeHtml(shipment.mode || "");
  const validUntil = quote?.validUntil
    ? formatUkDateMaybe(quote.validUntil)
    : "";

  const rows = (quote.lineItems || [])
    .map((li) => {
      const label = escapeHtml(li.label);
      const qty = escapeHtml(li.qty);
      const unit = formatCurrency(li.unitPrice, quote.currency);
      const amt = formatCurrency(li.amount, quote.currency);
      return `
        <tr>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;">${label}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${qty}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(
            unit,
          )}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:700;">${escapeHtml(
            amt,
          )}</td>
        </tr>
      `;
    })
    .join("");

  const notes = quote.notesToCustomer
    ? `<div style="margin-top:12px;color:#334155;font-size:14px;line-height:1.6;">
         <strong>Notes:</strong><br/>${escapeHtml(
           quote.notesToCustomer,
         ).replaceAll("\n", "<br/>")}
       </div>`
    : "";

  const approveText =
    approveInstruction || `I approve the quote – Reference ${refRaw}.`;

  const requestChangesText = `Request changes – Reference ${refRaw}.`;

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:${
    BRAND.colours.bg
  };padding:24px;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${
      BRAND.colours.cardBorder
    };">
      ${brandHeaderHtml({ title: "Freight Quote", reference: refRaw })}

      <div style="padding:18px 22px;">
        <p style="margin:0 0 10px 0;font-size:14px;color:${
          BRAND.colours.text
        };">Dear ${shipperName},</p>

        <p style="margin:0 0 14px 0;font-size:14px;color:#334155;line-height:1.7;">
          Thank you for requesting a quote from <strong>${escapeHtml(
            BRAND.name,
          )}</strong>.
          Please find below our quotation for the shipment detailed in your request.
        </p>

        <div style="margin:0 0 14px 0;font-size:13px;color:${
          BRAND.colours.text
        };line-height:1.7;">
          <div><strong>Route:</strong> ${origin} → ${dest}</div>
          ${mode ? `<div><strong>Mode:</strong> ${mode}</div>` : ""}
          ${
            serviceType
              ? `<div><strong>Service:</strong> ${serviceType}</div>`
              : ""
          }
          ${
            validUntil
              ? `<div><strong>Quote valid until:</strong> ${escapeHtml(
                  validUntil,
                )}</div>`
              : ""
          }
        </div>

        <table style="width:100%;border-collapse:collapse;font-size:14px;color:${
          BRAND.colours.text
        };">
          <thead>
            <tr>
              <th style="text-align:left;padding:10px 8px;border-bottom:2px solid ${
                BRAND.colours.cardBorder
              };">Charge</th>
              <th style="text-align:right;padding:10px 8px;border-bottom:2px solid ${
                BRAND.colours.cardBorder
              };">Qty</th>
              <th style="text-align:right;padding:10px 8px;border-bottom:2px solid ${
                BRAND.colours.cardBorder
              };">Unit</th>
              <th style="text-align:right;padding:10px 8px;border-bottom:2px solid ${
                BRAND.colours.cardBorder
              };">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows || ""}
          </tbody>
        </table>

        <div style="margin-top:14px;border-top:1px solid ${
          BRAND.colours.cardBorder
        };padding-top:12px;">
          <div style="display:flex;justify-content:flex-end;gap:24px;font-size:14px;color:${
            BRAND.colours.text
          };">
            <div style="text-align:right;">
              <div style="color:${BRAND.colours.muted};">Subtotal</div>
              <div style="font-weight:800;">${escapeHtml(
                formatCurrency(quote.subtotal, quote.currency),
              )}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:${BRAND.colours.muted};">Tax</div>
              <div style="font-weight:800;">${escapeHtml(
                formatCurrency(quote.taxTotal, quote.currency),
              )}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:${BRAND.colours.muted};">Total</div>
              <div style="font-weight:900;font-size:16px;">${escapeHtml(
                formatCurrency(quote.total, quote.currency),
              )}</div>
            </div>
          </div>
        </div>

        ${notes}

        <div style="margin-top:18px;padding:14px;border:1px solid ${
          BRAND.colours.cardBorder
        };border-radius:10px;background:#f9fafb;">
          <div style="font-size:13px;color:${
            BRAND.colours.text
          };font-weight:800;margin-bottom:6px;">
            Next step — approve your quote
          </div>
          <div style="font-size:13px;color:#334155;line-height:1.7;">
            To proceed, reply to this email confirming your approval. For clarity, you may copy/paste:
            <div style="margin:10px 0;padding:10px 12px;background:#fff;border:1px solid ${
              BRAND.colours.cardBorder
            };border-radius:8px;font-family:monospace;">
              ${escapeHtml(approveText)}
            </div>

            If you need adjustments before approving, reply with:
            <div style="margin:10px 0 0 0;padding:10px 12px;background:#fff;border:1px solid ${
              BRAND.colours.cardBorder
            };border-radius:8px;font-family:monospace;">
              ${escapeHtml(requestChangesText)}
            </div>
          </div>
        </div>

        <div style="margin-top:14px;color:#334155;font-size:14px;line-height:1.7;">
          Once approved, our operations team will confirm collection/drop-off arrangements and issue a formal
          <strong>Booking Confirmation</strong> with timelines and required documents.
        </div>

        <div style="margin-top:10px;color:${
          BRAND.colours.muted
        };font-size:12px;line-height:1.6;">
          No payment or documentation is required at this stage. Please wait for our Booking Confirmation.
        </div>

        <div style="margin-top:18px;color:${
          BRAND.colours.muted
        };font-size:12px;line-height:1.6;">
          Kind regards,<br/>
          <strong>${escapeHtml(BRAND.name)} Operations</strong><br/>
          ${escapeHtml(BRAND.tagline)}
        </div>
      </div>
    </div>
  </div>
  `;
}

/**
 * ✅ Booking Confirmation Email builders
 */
function buildBookingConfirmationEmailHtml({ shipment }) {
  const refRaw = shipment.referenceNo || "";
  const shipperName = escapeHtml(shipment.shipper?.name || "Customer");
  const origin = escapeHtml(shipment.ports?.originPort || "");
  const dest = escapeHtml(shipment.ports?.destinationPort || "");
  const serviceType = escapeHtml(shipment.serviceType || "");
  const mode = escapeHtml(shipment.mode || "");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:${
    BRAND.colours.bg
  };padding:24px;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${
      BRAND.colours.cardBorder
    };">
      ${brandHeaderHtml({ title: "Booking Confirmed", reference: refRaw })}

      <div style="padding:18px 22px;">
        <p style="margin:0 0 10px 0;font-size:14px;color:${
          BRAND.colours.text
        };">Dear ${shipperName},</p>

        <p style="margin:0 0 14px 0;font-size:14px;color:#334155;line-height:1.7;">
          Thank you for approving our quotation. We are pleased to confirm that your shipment has now been
          <strong>formally booked</strong> with ${escapeHtml(BRAND.name)}.
        </p>

        <div style="margin:0 0 14px 0;font-size:13px;color:${
          BRAND.colours.text
        };line-height:1.7;">
          <div><strong>Booking Reference:</strong> ${escapeHtml(refRaw)}</div>
          <div><strong>Route:</strong> ${origin} → ${dest}</div>
          ${mode ? `<div><strong>Mode:</strong> ${mode}</div>` : ""}
          ${
            serviceType
              ? `<div><strong>Service:</strong> ${serviceType}</div>`
              : ""
          }
        </div>

        <div style="margin-top:14px;padding:14px;border:1px solid ${
          BRAND.colours.cardBorder
        };border-radius:10px;background:#f9fafb;">
          <div style="font-size:13px;color:${
            BRAND.colours.text
          };font-weight:800;margin-bottom:6px;">What happens next</div>
          <div style="font-size:13px;color:#334155;line-height:1.7;">
            Our operations team will now coordinate the next stages of your shipment. We will contact you regarding:
            <ul style="margin:10px 0 0 18px;color:#334155;">
              <li>Collection or drop-off arrangements</li>
              <li>Required shipping documents</li>
              <li>Estimated timelines and key dates</li>
              <li>Payment instructions (where applicable)</li>
            </ul>
            Please do not send documents or payment until requested by our team.
          </div>
        </div>

        <div style="margin-top:16px;color:#334155;font-size:14px;line-height:1.7;">
          If you have any immediate questions, reply to this email and quote your reference above.
        </div>

        <div style="margin-top:18px;color:${
          BRAND.colours.muted
        };font-size:12px;line-height:1.6;">
          Kind regards,<br/>
          <strong>${escapeHtml(BRAND.name)} Operations</strong><br/>
          ${escapeHtml(BRAND.tagline)}
        </div>
      </div>
    </div>
  </div>
  `;
}

function buildBookingConfirmationText({ shipment }) {
  const ref = shipment.referenceNo || "";
  const origin = shipment?.ports?.originPort || "";
  const destination = shipment?.ports?.destinationPort || "";
  const mode = shipment?.mode || "";
  const serviceType = shipment?.serviceType || "";

  return [
    `${BRAND.name} — Booking Confirmed`,
    `Reference: ${ref}`,
    "",
    `Route: ${origin} -> ${destination}`,
    mode ? `Mode: ${mode}` : "",
    serviceType ? `Service: ${serviceType}` : "",
    "",
    "Thank you for approving our quotation.",
    `Your shipment has now been formally booked with ${BRAND.name}.`,
    "",
    "What happens next:",
    "- Collection or drop-off arrangements",
    "- Required shipping documents",
    "- Estimated timelines and key dates",
    "- Payment instructions (where applicable)",
    "",
    "Please do not send documents or payment until requested by our team.",
    "",
    `${BRAND.tagline}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ---------------- CHARGES HELPERS ----------------

function normalizeCharges(rawCharges) {
  const list = Array.isArray(rawCharges) ? rawCharges : [];

  return list
    .filter((c) => c && String(c.label || "").trim())
    .map((c) => {
      const label = String(c.label || "").trim();
      const amountNum = Number(c.amount);
      const amount = Number.isFinite(amountNum) ? toMoney(amountNum) : 0;

      return {
        label,
        amount,
        currency: String(c.currency || "GBP").trim() || "GBP",
        category: String(c.category || "").trim(),
      };
    });
}

function sumCharges(charges) {
  const list = Array.isArray(charges) ? charges : [];
  return toMoney(list.reduce((sum, c) => sum + (Number(c.amount) || 0), 0));
}

/* ⬇⬇⬇ PORT NORMALISATION BLOCK ⬇⬇⬇ */

// ------------------ PORT NORMALISATION ------------------

function escapeRegExp(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolvePort(input) {
  const raw = String(input || "").trim();
  if (!raw) return null;

  const upper = raw.toUpperCase();

  let port = await Port.findOne({ code: upper, isActive: true }).lean();
  if (port) return port;

  port = await Port.findOne({
    name: { $regex: `^${escapeRegExp(raw)}$`, $options: "i" },
    isActive: true,
  }).lean();
  if (port) return port;

  // If input is like "GHTEM - Tema" / "GHTEM Tema", try first token as code
  const maybeCode = upper.split(/[\s\-–—]+/)[0];
  if (maybeCode && maybeCode.length >= 3 && maybeCode.length <= 10) {
    port = await Port.findOne({ code: maybeCode, isActive: true }).lean();
    if (port) return port;
  }

  return null;
}

/**
 * Normalise incoming shipment payload ports BEFORE create.
 *
 * Rules:
 * - Port model is the source of truth.
 * - If origin/destination IDs are supplied, validate + use them.
 * - Otherwise, resolve from code/name/legacy text.
 * - Always keep legacy top-level strings (originPort/destinationPort).
 * - Populate snapshot fields under payload.ports.* for charts/future.
 * - Never crash create flow if unknown: leave legacy only.
 */
async function normalisePortsOnPayload(payload) {
  if (!payload || typeof payload !== "object") return;

  payload.ports = payload.ports || {};

  // --- 1) ID-first (authoritative) ---
  let origin = null;
  let destination = null;

  // Accept canonical top-level ids (Admin sends these), but keep nested as primary
  const originPortId =
    payload?.ports?.originPortId || payload?.originPortId || null;
  const destinationPortId =
    payload?.ports?.destinationPortId || payload?.destinationPortId || null;

  // Ensure nested ids are set so downstream logic stays consistent
  if (!payload.ports.originPortId && originPortId)
    payload.ports.originPortId = originPortId;
  if (!payload.ports.destinationPortId && destinationPortId) {
    payload.ports.destinationPortId = destinationPortId;
  }

  if (originPortId) {
    origin = await Port.findOne({ _id: originPortId, isActive: true }).lean();
  }

  if (destinationPortId) {
    destination = await Port.findOne({
      _id: destinationPortId,
      isActive: true,
    }).lean();
  }

  // --- 2) Fallback resolution from text/code/name (legacy compatible) ---
  const originInput =
    payload.ports.originPortCode ||
    payload.ports.originPortName ||
    payload.originPort ||
    payload.ports.originPort ||
    "";

  const destinationInput =
    payload.ports.destinationPortCode ||
    payload.ports.destinationPortName ||
    payload.destinationPort ||
    payload.ports.destinationPort ||
    "";

  const [originResolved, destinationResolved] = await Promise.all([
    origin ? Promise.resolve(origin) : resolvePort(originInput),
    destination ? Promise.resolve(destination) : resolvePort(destinationInput),
  ]);

  origin = originResolved || null;
  destination = destinationResolved || null;

  // --- 3) Apply canonical snapshots + keep legacy strings ---
  if (origin) {
    payload.ports.originPortId = origin._id;
    payload.ports.originPortCode = origin.code || "";
    payload.ports.originPortName = origin.name || "";
    payload.ports.originPortCountry = origin.country || "";
    payload.ports.originPortType = origin.type || "";

    // Keep dashboard-compatible field and legacy top-level field
    payload.ports.originPort = origin.name || origin.code || "";
    payload.originPort = payload.originPort || payload.ports.originPort;
  } else {
    // Unknown: keep legacy top-level if present; also keep ports.originPort for dashboard
    const legacy = String(payload.originPort || "").trim();
    if (legacy) payload.ports.originPort = legacy;
  }

  if (destination) {
    payload.ports.destinationPortId = destination._id;
    payload.ports.destinationPortCode = destination.code || "";
    payload.ports.destinationPortName = destination.name || "";
    payload.ports.destinationPortCountry = destination.country || "";
    payload.ports.destinationPortType = destination.type || "";

    payload.ports.destinationPort = destination.name || destination.code || "";
    payload.destinationPort =
      payload.destinationPort || payload.ports.destinationPort;
  } else {
    const legacy = String(payload.destinationPort || "").trim();
    if (legacy) payload.ports.destinationPort = legacy;
  }
}

// ---------------- PUBLIC LEAD INVITE (GO-LIVE) ----------------

function pickFrontendBaseUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    process.env.APP_URL ||
    "http://localhost:5173"
  );
}

function signInviteToken(userId) {
  const secret = process.env.JWT_SECRET || process.env.JWT_SEC;
  if (!secret)
    throw new Error("JWT secret not configured (JWT_SECRET/JWT_SEC)");

  // Short-lived token for onboarding
  const expiresIn = process.env.INVITE_TOKEN_EXPIRES || "48h";

  return jwt.sign({ id: String(userId) }, secret, { expiresIn });
}

function buildInviteEmailHtml({ inviteUrl, name }) {
  const safeName = escapeHtml(name || "there");
  const safeUrl = escapeHtml(inviteUrl);

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:${BRAND.colours.bg};padding:24px;">
      <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BRAND.colours.cardBorder};">
        ${brandHeaderHtml({ title: "Complete your registration", reference: "—" })}

        <div style="padding:18px 22px;">
          <p style="margin:0 0 12px 0;font-size:14px;color:${BRAND.colours.text};">Hello ${safeName},</p>

          <p style="margin:0 0 14px 0;font-size:14px;color:#334155;line-height:1.7;">
            Thank you for requesting a quote from <strong>${escapeHtml(BRAND.name)}</strong>.
            To view updates and continue your booking, please set your password using the button below.
          </p>

          <div style="margin:18px 0;">
            <a href="${safeUrl}"
              style="display:inline-block;background:${BRAND.colours.accent};color:#111827;padding:12px 16px;border-radius:10px;font-weight:800;text-decoration:none;">
              Set my password
            </a>
          </div>

          <p style="margin:0 0 8px 0;font-size:13px;color:#334155;line-height:1.6;">
            If the button doesn’t work, copy and paste this link into your browser:
          </p>

          <div style="margin:10px 0 0 0;padding:10px 12px;background:#fff;border:1px solid ${BRAND.colours.cardBorder};border-radius:8px;font-family:monospace;font-size:12px;word-break:break-all;">
            ${safeUrl}
          </div>

          <div style="margin-top:18px;color:${BRAND.colours.muted};font-size:12px;line-height:1.6;">
            Kind regards,<br/>
            <strong>${escapeHtml(BRAND.name)} Team</strong><br/>
            ${escapeHtml(BRAND.tagline)}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildInviteEmailText({ inviteUrl }) {
  return [
    `${BRAND.name} — Complete your registration`,
    "",
    "Thank you for requesting a quote.",
    "To continue, set your password using this link:",
    inviteUrl,
    "",
    BRAND.tagline,
  ].join("\n");
}

async function createOrFindCustomerAndSendInvite({ traceId, shipment }) {
  const shipperName = String(shipment?.shipper?.name || "").trim();
  const shipperEmail = String(shipment?.shipper?.email || "").trim();
  const shipperPhone = String(shipment?.shipper?.phone || "").trim();

  if (!shipperEmail) {
    return { ok: false, reason: "missing_shipper_email" };
  }

  // 1) Find existing user (CRM identity) or create a new pending user (no password yet)
  const normalizedEmail = shipperEmail.toLowerCase();
  let user = await User.findOne({ email: normalizedEmail, isDeleted: false });

  if (!user) {
    // User schema requires phone, country, address — so we supply safe placeholders
    user = await User.create({
      fullname: shipperName || "Customer",
      email: normalizedEmail,
      phone: shipperPhone || "N/A",
      country: "N/A",
      address: "N/A",
      role: "user",
      status: "pending",
      welcomeMailSent: false,
    });

    console.log(`[LEAD][${traceId}] user_created`, {
      userId: String(user._id),
      email: normalizedEmail,
    });
  } else {
    console.log(`[LEAD][${traceId}] user_found`, {
      userId: String(user._id),
      email: normalizedEmail,
      status: user.status,
      welcomeMailSent: user.welcomeMailSent,
    });
  }

  // 2) Attach shipment ownership if not already set (required for customer portal visibility)
  // NOTE: lead requests must not set createdBy, but customer ownership is OK for access.
  if (!shipment.customer) {
    shipment.customer = user._id;
    await shipment.save();
    console.log(`[LEAD][${traceId}] shipment_customer_attached`, {
      shipmentId: String(shipment._id),
      customerId: String(user._id),
    });
  }

  // 3) If already active+welcomeMailSent, do NOT re-send invite
  if (user.status === "active" && user.welcomeMailSent === true) {
    return {
      ok: true,
      skipped: true,
      reason: "already_onboarded",
      userId: user._id,
    };
  }

  // 4) Create invite token + URL
  const token = signInviteToken(user._id);
  const base = pickFrontendBaseUrl().replace(/\/$/, "");
  const cleanBase = String(base || "").replace(/\/$/, "");
  const inviteUrl = `${cleanBase}/#/auth/reset-password/${token}`;

  const html = buildInviteEmailHtml({
    inviteUrl,
    name: shipperName || user.fullname,
  });
  const text = buildInviteEmailText({ inviteUrl });

  // 5) Send email
  const mail = await dispatchMail({
    to: normalizedEmail,
    subject: `${BRAND.name} — Complete your registration`,
    html,
    text,
  });

  // 6) Mark welcomeMailSent when SMTP confirms OR in console mode
  // (console mode is your dev sim; we still mark it to avoid spam)
  const mode = String(mail?.mode || "").toLowerCase();
  if (mode === "console" || mail?.messageId) {
    user.welcomeMailSent = true;
    await user.save();
  }

  return {
    ok: true,
    userId: user._id,
    inviteUrl,
    mail,
  };
}

// ---------------- CONTROLLERS ----------------

/**
 * ✅ NEW (PUBLIC): create lead shipment from landing page
 * POST /api/v1/shipments/public-request
 */
async function createPublicLeadShipment(req, res) {
  const traceId =
    (crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    console.log(`[LEAD][${traceId}] createPublicLeadShipment:start`, {
      keys: req?.body ? Object.keys(req.body) : [],
      shipperEmail: req?.body?.shipper?.email || null,
      shipperName: req?.body?.shipper?.name || null,
      mode: req?.body?.mode || null,
      serviceType: req?.body?.serviceType || null,
    });

    const payload = { ...req.body };
    // Legacy bridge: allow top-level originPort/destinationPort payloads
    payload.ports = payload.ports || {};
    if (!payload.ports.originPort && payload.originPort) {
      payload.ports.originPort = payload.originPort;
    }
    if (!payload.ports.destinationPort && payload.destinationPort) {
      payload.ports.destinationPort = payload.destinationPort;
    }

    // Force-safe invariants for lead stage
    payload.isDeleted = false;
    payload.channel = "web_portal";
    payload.status = payload.status || "request_received";
    payload.paymentStatus = payload.paymentStatus || "unpaid";

    // Never assign ownership/createdBy for public lead requests
    delete payload.customer;
    delete payload.createdBy;

    // ✅ Immutable customer intent snapshot (schema-aligned)
    // IMPORTANT: must match Shipment.js CustomerRequestSchema shape
    // We build it AFTER ports normalisation so route ports are correct.
    if (
      !payload.customerRequest ||
      isBlankCustomerRequest(payload.customerRequest)
    ) {
      // temporary stub — we'll overwrite after normalisePortsOnPayload
      payload.customerRequest = payload.customerRequest || {};
    }

    // Ensure "requestor snapshot" exists (MODEL DOES NOT HAVE requestor)
    // Store snapshot in meta.requestor so it persists.
    const shipperName = String(payload?.shipper?.name || "").trim();
    const shipperEmail = String(payload?.shipper?.email || "").trim();
    const shipperPhone = String(payload?.shipper?.phone || "").trim();

    payload.meta = payload.meta || {};
    payload.meta.leadStage = true;
    payload.meta.source = payload.meta.source || "web_quote";
    payload.meta.requestor = {
      name: shipperName || "",
      email: shipperEmail || "",
      phone: shipperPhone || "",
    };

    // Validate status against schema enum to avoid save errors
    if (!ALLOWED_STATUSES.includes(payload.status)) {
      payload.status = "request_received";
    }

    await normalisePortsOnPayload(payload);

    // ✅ Build the customerRequest snapshot AFTER ports are normalised
    if (
      !payload.customerRequest ||
      isBlankCustomerRequest(payload.customerRequest)
    ) {
      // buildCustomerRequestSnapshot expects a shipment-like object
      // payload already contains shipper/consignee/ports/meta/etc, so it's safe.
      payload.customerRequest = buildCustomerRequestSnapshot(payload);
    }

    // 🔒 LOCK (GO-LIVE): customerRequest must be built AFTER port normalisation.
    // Do not replace with manual payload.customerRequest = {...} blocks.
    if (
      !payload.customerRequest?.route?.originPort ||
      !payload.customerRequest?.route?.destinationPort
    ) {
      console.warn(`[LEAD][${traceId}] customerRequest_route_missing`, {
        originPort: payload?.ports?.originPort,
        destinationPort: payload?.ports?.destinationPort,
      });
    }

    // 🔒 GO-LIVE LOCK: lead snapshots must contain ports
    if (
      !payload.customerRequest?.route?.originPort ||
      !payload.customerRequest?.route?.destinationPort
    ) {
      console.warn(`[LEAD][${traceId}] snapshot_missing_ports`, {
        ports: payload?.ports,
        customerRequest: payload?.customerRequest,
      });
    }

    const shipment = await Shipment.create(payload);

    // ✅ MS1: create/find user + send invite mail (do not block lead creation if mail fails)
    let invite = null;
    try {
      invite = await createOrFindCustomerAndSendInvite({ traceId, shipment });
    } catch (e) {
      console.warn(`[LEAD][${traceId}] invite_failed`, { error: e.message });
      invite = { ok: false, reason: "invite_failed", error: e.message };
    }

    return res.status(201).json({
      message: "Lead request created successfully.",
      shipment,
      invite,
    });
  } catch (err) {
    console.error("Error creating public lead shipment:", err);
    return res.status(500).json({
      message: "Failed to create lead request",
      error: err.message,
    });
  }
}

async function createShipment(req, res) {
  try {
    const payload = { ...req.body };
    // Legacy bridge: allow top-level originPort/destinationPort payloads
    payload.ports = payload.ports || {};
    if (!payload.ports.originPort && payload.originPort) {
      payload.ports.originPort = payload.originPort;
    }
    if (!payload.ports.destinationPort && payload.destinationPort) {
      payload.ports.destinationPort = payload.destinationPort;
    }

    payload.isDeleted = false;

    if (!req.query.keepRef) {
      delete payload.referenceNo;
    }

    const userId = requireUserId(req);
    const admin = isAdmin(req);

    if (!admin) {
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      payload.customer = userId;
    } else {
      if (!payload.customer) payload.customer = userId;
    }

    if (userId) payload.createdBy = userId;

    await normalisePortsOnPayload(payload);

    const shipment = await Shipment.create(payload);

    // ✅ LOCKED: schema-aligned immutable snapshot (set once, never overwrite)
    if (
      !shipment.customerRequest ||
      isBlankCustomerRequest(shipment.customerRequest)
    ) {
      shipment.customerRequest = buildCustomerRequestSnapshot(shipment);
      await shipment.save();
    }

    return res.status(201).json({
      message: "Shipment created successfully.",
      shipment,
    });
  } catch (err) {
    console.error("Error creating shipment:", err);
    return res.status(500).json({
      message: "Failed to create shipment",
      error: err.message,
    });
  }
}

async function getAllShipments(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const filter = buildShipmentFilter(req.query);

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 25, 1),
      500,
    );
    const skip = (page - 1) * limit;

    const [total, shipments] = await Promise.all([
      Shipment.countDocuments(filter),
      Shipment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("customer", "fullname email country")
        .lean(),
    ]);

    const pages = Math.max(Math.ceil(total / limit), 1);

    return res.status(200).json({
      shipments,
      total,
      page,
      pages,
      limit,
    });
  } catch (err) {
    console.error("Error fetching shipments:", err);
    return res.status(500).json({
      message: "Failed to fetch shipments",
      error: err.message,
    });
  }
}

async function getOneShipment(req, res) {
  try {
    const { id } = req.params;

    const { shipment, error } = await findAccessibleShipmentById(req, id, {
      lean: true,
      populateCustomer: true,
    });

    if (error === "Invalid shipment id")
      return res.status(400).json({ message: error });
    if (error === "Unauthorized")
      return res.status(401).json({ message: error });
    if (error === "Shipment not found")
      return res.status(404).json({ message: error });

    return res.status(200).json(shipment);
  } catch (err) {
    console.error("Error fetching shipment:", err);
    return res.status(500).json({
      message: "Failed to fetch shipment",
      error: err.message,
    });
  }
}

/**
 * ✅ ADMIN: Assign shipment ownership to a customer (required for customer quote approval)
 * PATCH /api/v1/shipments/:id/customer
 * Body: { customerId }
 */
async function assignCustomerToShipment(req, res) {
  try {
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const customerId = String(req.body?.customerId || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    if (!mongoose.isValidObjectId(customerId)) {
      return res.status(400).json({ message: "Invalid customerId" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    const customer = await User.findOne({ _id: customerId, isDeleted: false })
      .select("fullname email role status")
      .lean();

    if (!customer) {
      return res.status(404).json({ message: "Customer user not found" });
    }

    const prevCustomerId = shipment.customer ? String(shipment.customer) : null;
    shipment.customer = customerId;

    shipment.trackingEvents.push({
      status: "update",
      event: "Customer assigned to shipment",
      location: "",
      date: new Date(),
      meta: {
        source: "admin_assign_customer",
        updatedBy: req?.user?.id || null,
        fromCustomerId: prevCustomerId,
        toCustomerId: customerId,
        toCustomerEmail: customer.email || null,
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Customer assigned successfully.",
      shipment,
    });
  } catch (err) {
    console.error("assignCustomerToShipment error:", err);
    return res.status(500).json({
      message: "Failed to assign customer",
      error: err.message,
    });
  }
}

async function getUserShipment(req, res) {
  try {
    const userId = requireUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "User context missing from request." });
    }

    const shipments = await Shipment.find({
      customer: userId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("customer", "fullname email country")
      .lean();

    return res.status(200).json(shipments);
  } catch (err) {
    console.error("Error fetching user's shipments:", err);
    return res.status(500).json({
      message: "Failed to fetch user shipments",
      error: err.message,
    });
  }
}

async function updateShipment(req, res) {
  try {
    const { id } = req.params;

    const { shipment, error } = await findAccessibleShipmentById(req, id, {
      lean: false,
      populateCustomer: false,
    });

    if (error === "Invalid shipment id")
      return res.status(400).json({ message: error });
    if (error === "Unauthorized")
      return res.status(401).json({ message: error });
    if (error === "Shipment not found")
      return res.status(404).json({ message: error });

    const updates = sanitizeUpdatesForRole(req, req.body || {});

    // ✅ Go-live safety: prevent accidental wiping of nested objects from Admin PUT payloads
    if (isAdmin(req) && updates && typeof updates === "object") {
      // never allow snapshot overwrite (already handled elsewhere, keep it here too)
      if ("customerRequest" in updates) delete updates.customerRequest;

      // if payload includes empty objects, drop them (prevents wiping existing data)
      const isEmptyObj = (v) =>
        v &&
        typeof v === "object" &&
        !Array.isArray(v) &&
        Object.keys(v).length === 0;

      if (isEmptyObj(updates.cargo)) delete updates.cargo;
      if (isEmptyObj(updates.meta)) delete updates.meta;
      if (updates.meta && isEmptyObj(updates.meta.intake))
        delete updates.meta.intake;

      // ports should merge, not replace
      if (
        updates.ports &&
        shipment.ports &&
        typeof updates.ports === "object"
      ) {
        updates.ports = { ...(shipment.ports || {}), ...(updates.ports || {}) };
      }
    }

    // ✅ Admin must never overwrite customerRequest
    if (isAdmin(req) && updates && typeof updates === "object") {
      if ("customerRequest" in updates) delete updates.customerRequest;
    }

    Object.assign(shipment, updates);

    // ✅ Never rewrite immutable customerRequest snapshot.
    // Backfill once for legacy shipments that have no snapshot yet.
    if (!isAdmin(req) && isBlankCustomerRequest(shipment.customerRequest)) {
      shipment.customerRequest = buildCustomerRequestSnapshot(shipment);

      shipment.trackingEvents.push({
        status: "update",
        event:
          "Customer updated booking details (customerRequest snapshot backfilled for legacy shipment)",
        location: "",
        date: new Date(),
        meta: {
          source: "customer_portal_update_shipment",
          customerId: req?.user?.id || null,
        },
      });
    }

    await shipment.save();

    return res.status(200).json({
      message: "Shipment updated successfully.",
      shipment,
    });
  } catch (err) {
    console.error("Error updating shipment:", err);
    return res.status(500).json({
      message: "Failed to update shipment",
      error: err.message,
    });
  }
}

async function updateCharges(req, res) {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    const incoming = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body?.charges)
        ? req.body.charges
        : [];

    const charges = normalizeCharges(incoming);

    shipment.charges = charges;

    shipment.trackingEvents.push({
      status: "update",
      event: `Charges updated (${charges.length} line${
        charges.length === 1 ? "" : "s"
      })`,
      location: "",
      date: new Date(),
      meta: {
        updatedBy: req?.user?.id || null,
        source: "admin_charges_update",
        lineCount: charges.length,
        total: sumCharges(charges),
        currency: charges.find((c) => c?.currency)?.currency || "GBP",
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Charges updated successfully.",
      shipment,
    });
  } catch (err) {
    console.error("Error updating charges:", err);
    return res.status(500).json({
      message: "Failed to update charges",
      error: err.message,
    });
  }
}

async function deleteShipment(req, res) {
  try {
    // ✅ Defensive: route is admin-only, but keep controller strict too
    if (!isAdmin(req)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    // Soft delete
    shipment.isDeleted = true;

    // Audit trail (Phase 5 integrity)
    shipment.trackingEvents.push({
      status: "update",
      event: "Shipment deleted (soft delete) by admin",
      location: "",
      date: new Date(),
      meta: {
        source: "admin_delete_shipment",
        deletedBy: req?.user?.id || null,
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Shipment deleted successfully (soft delete).",
    });
  } catch (err) {
    console.error("Error deleting shipment:", err);
    return res.status(500).json({
      message: "Failed to delete shipment",
      error: err.message,
    });
  }
}

async function addTrackingEvent(req, res) {
  try {
    const { id } = req.params;
    const { status, event, location, date, meta } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    const trackingEvent = {
      status: status || "update",
      event,
      location,
      date: date ? new Date(date) : new Date(),
      meta: meta || {},
    };

    shipment.trackingEvents.push(trackingEvent);

    // ✅ Keep shipment.status in sync only for allowed enum statuses
    if (status && ALLOWED_STATUSES.includes(status)) {
      shipment.status = status;
    }

    await shipment.save();

    return res.status(200).json({
      message: "Tracking event added successfully.",
      shipment,
    });
  } catch (err) {
    console.error("Error adding tracking event:", err);
    return res.status(500).json({
      message: "Failed to add tracking event",
      error: err.message,
    });
  }
}

async function addDocument(req, res) {
  try {
    const { id } = req.params;
    const name = String(req.body?.name || "").trim();
    const fileUrl = String(req.body?.fileUrl || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    if (!name) {
      return res.status(400).json({ message: "Document name is required" });
    }

    if (!fileUrl) {
      return res.status(400).json({ message: "Document fileUrl is required" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    const docEntry = {
      name,
      fileUrl,
      uploadedAt: new Date(),
      uploadedBy: req?.user?.id || undefined,
    };

    shipment.documents.push(docEntry);
    await shipment.save();

    return res.status(200).json({
      message: "Document added to shipment successfully.",
      data: shipment.documents,
      document: docEntry,
    });
  } catch (err) {
    console.error("Error adding document to shipment:", err);
    return res.status(500).json({
      message: "Failed to add document",
      error: err.message,
    });
  }
}

async function uploadDocument(req, res) {
  try {
    const { id } = req.params;

    // multer puts the uploaded file on req.file
    const file = req.file;
    const name = String(req.body?.name || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    if (!name) {
      return res
        .status(400)
        .json({ message: "Please provide a document name." });
    }

    if (!file) {
      return res.status(400).json({ message: "Please attach a file." });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    /**
     * ✅ Build URL safely (recommended: store a relative URL)
     * Your multer destination is:
     *   Backend/uploads/documents/shipments/:id/<filename>
     * We expose it publicly via:
     *   /uploads/documents/shipments/:id/<filename>
     */
    const filename = file.filename; // set by multer storage.filename
    const relativeUrl = `/uploads/documents/shipments/${id}/${filename}`;

    const fileUrl = relativeUrl;

    const docEntry = {
      name,
      fileUrl,
      uploadedAt: new Date(),
      uploadedBy: req?.user?.id || undefined,

      // ✅ optional metadata (safe to store; helps Admin UI)
      meta: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    };

    shipment.documents.push(docEntry);
    await shipment.save();

    return res.status(200).json({
      message: "Document uploaded successfully.",
      data: shipment.documents,
      fileUrl,
      document: docEntry,
    });
  } catch (err) {
    console.error("Error uploading document:", err);
    return res.status(500).json({
      message: "Failed to upload document",
      error: err.message,
    });
  }
}

async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, event, location } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing status" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });

    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    shipment.status = status;

    shipment.trackingEvents.push({
      status,
      event:
        event ||
        `Status updated to "${status.replace(/_/g, " ")}" from admin panel`,
      location: location || "",
      date: new Date(),
      meta: {
        updatedBy: req?.user?.id || null,
        source: "admin_panel_status_update",
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Shipment status updated successfully.",
      shipment,
    });
  } catch (err) {
    console.error("Error updating shipment status:", err);
    return res.status(500).json({
      message: "Failed to update shipment status",
      error: err.message,
    });
  }
}

/**
 * ✅ Admin: Save/update quote draft on shipment
 * Route: PATCH /shipments/:id/quote
 *
 * ALSO syncs: shipment.charges[] derived from quote.lineItems (schema-safe)
 */
async function saveQuote(req, res) {
  try {
    const { id } = req.params;

    // Admin only (route already enforces), but keep defensive:
    const role = String(req?.user?.role || "").toLowerCase();
    if (role !== "admin") {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment) {
      return res.status(404).json({ ok: false, message: "Shipment not found" });
    }

    const incoming = req.body?.quote || {};
    const currency =
      String(incoming.currency || shipment?.quote?.currency || "GBP").trim() ||
      "GBP";

    const incomingLineItems = Array.isArray(incoming.lineItems)
      ? incoming.lineItems
      : [];

    // ✅ Go-live stabilisation: remove empty rows that would fail schema validation
    const filteredLineItems = incomingLineItems.filter((li) =>
      String(li?.label || "").trim(),
    );

    // Must have at least one labelled line
    const hasAnyLabel = filteredLineItems.length > 0;
    if (!hasAnyLabel) {
      return res.status(400).json({
        ok: false,
        message: "Quote must contain at least one line item label.",
      });
    }

    // Totals + cleaned items
    const { clean, subtotal, taxTotal, total } =
      computeQuoteTotals(filteredLineItems);

    // Update quote object (schema fields only)
    const prevVersion = toNumber(shipment?.quote?.version, 0);
    shipment.quote = {
      ...(shipment.quote || {}),
      currency,
      validUntil: incoming.validUntil
        ? new Date(incoming.validUntil)
        : shipment?.quote?.validUntil,
      notesToCustomer: String(incoming.notesToCustomer || ""),
      internalNotes: String(incoming.internalNotes || ""),
      lineItems: clean.map((li) => ({
        code: String(li.code || "").trim(),
        label: String(li.label || "").trim(),
        qty: toNumber(li.qty, 1),
        unitPrice: toNumber(li.unitPrice, 0),
        amount: toNumber(
          li.amount,
          toNumber(li.qty, 1) * toNumber(li.unitPrice, 0),
        ),
        taxRate: toNumber(li.taxRate, 0),
      })),
      subtotal,
      taxTotal,
      total,
      version: prevVersion + 1,
      // sentAt/acceptedAt handled elsewhere
    };

    // ✅ Sync charges[] from quote lineItems (schema-safe)
    shipment.charges = quoteLineItemsToCharges(
      shipment.quote.lineItems,
      currency,
    );

    // Optional: bump status from request_received -> under_review on first draft save
    if (shipment.status === "request_received") {
      shipment.status = "under_review";
    }

    await shipment.save();

    return res.status(200).json({
      ok: true,
      data: shipment,
      shipment,
    });
  } catch (err) {
    console.error("❌ saveQuote error:", err);
    return res.status(500).json({
      ok: false,
      message: "Failed to save quote draft",
      error: err.message,
    });
  }
}

async function sendQuoteEmail(req, res) {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment)
      return res.status(404).json({ message: "Shipment not found" });

    if (
      !shipment.quote ||
      !Array.isArray(shipment.quote.lineItems) ||
      shipment.quote.lineItems.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "No saved quote found. Save the quote first." });
    }

    // Recompute totals for safety (using quote-object helper)
    const computed = computeQuoteObjectTotals(shipment.quote);
    shipment.quote.subtotal = computed.subtotal;
    shipment.quote.taxTotal = computed.taxTotal;
    shipment.quote.total = computed.total;

    const customerEmail = String(
      req.body?.toEmail || shipment.shipper?.email || "",
    ).trim();

    if (!customerEmail) {
      return res.status(400).json({
        message: "No recipient email found (shipper.email is missing).",
      });
    }

    const origin = shipment?.ports?.originPort || "";
    const destination = shipment?.ports?.destinationPort || "";
    const validUntil = shipment.quote?.validUntil
      ? new Date(shipment.quote.validUntil).toLocaleDateString("en-GB")
      : "";

    const approveText = `I approve the quote – Reference ${
      shipment.referenceNo || ""
    }.`;
    const requestChangesText = `Request changes – Reference ${
      shipment.referenceNo || ""
    }.`;

    const htmlBody = buildQuoteEmailHtml({
      shipment,
      quote: shipment.quote,
      approveInstruction: approveText,
    });

    const textBody = [
      `${BRAND.name} — Freight Quote`,
      `Reference: ${shipment.referenceNo || ""}`,
      "",
      `Route: ${origin} -> ${destination}`,
      `Total: ${shipment.quote?.currency || "GBP"} ${toMoney(
        shipment.quote?.total || 0,
      ).toFixed(2)}`,
      validUntil ? `Quote valid until: ${validUntil}` : "",
      "",
      "NEXT STEP — approve your quote:",
      `Reply confirming approval. You may copy/paste: "${approveText}"`,
      `If you need changes first, reply with: "${requestChangesText}"`,
      "",
      "No payment or documentation is required at this stage. Please wait for our Booking Confirmation.",
      BRAND.tagline,
    ]
      .filter(Boolean)
      .join("\n");

    const mail = await dispatchMail({
      to: customerEmail,
      subject: `${BRAND.name} — Freight Quote | Ref: ${shipment.referenceNo}`,
      html: htmlBody,
      text: textBody,
    });

    // Console mode: simulate only
    if (mail && String(mail.mode).toLowerCase() === "console") {
      shipment.trackingEvents.push({
        status: "update",
        event: `Quote email simulated (MAIL_TRANSPORT=console) to (${customerEmail})`,
        location: "",
        date: new Date(),
        meta: {
          updatedBy: req?.user?.id || null,
          source: "admin_quote_send",
          toEmail: customerEmail,
          quoteVersion: shipment.quote.version || 1,
          total: shipment.quote.total,
          currency: shipment.quote.currency,
          mailMode: "console",
          messageId: mail.messageId || null,
        },
      });

      // ✅ In your live system you observed status becomes QUOTED even in console.
      // To keep Phase 5 workflow consistent, mark quoted here too.
      shipment.status = "quoted";
      shipment.quote.sentAt = new Date();

      await shipment.save();

      return res.status(200).json({
        message: "Quote emailed successfully.",
        mail,
        shipment,
      });
    }

    // SMTP mode: require messageId
    const msgId = mail?.messageId;
    if (!msgId) {
      return res.status(500).json({
        message:
          "SMTP send did not return a messageId. Quote not marked as sent.",
        mail,
      });
    }

    shipment.quote.sentAt = new Date();
    shipment.status = "quoted";

    shipment.trackingEvents.push({
      status: "update",
      event: `Quote sent to customer (${customerEmail})`,
      location: "",
      date: new Date(),
      meta: {
        updatedBy: req?.user?.id || null,
        source: "admin_quote_send",
        toEmail: customerEmail,
        quoteVersion: shipment.quote.version || 1,
        total: shipment.quote.total,
        currency: shipment.quote.currency,
        mailMode: "smtp",
        messageId: msgId,
        accepted: mail?.accepted,
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Quote emailed successfully.",
      mail,
      shipment,
    });
  } catch (err) {
    console.error("Error sending quote email:", err);
    return res.status(500).json({
      message: "Failed to send quote email",
      error: err.message,
    });
  }
}

/**
 * ✅ CUSTOMER: approve quote (status=customer_approved)
 * POST /api/v1/shipments/:id/quote/approve
 */
async function approveQuoteAsCustomer(req, res) {
  try {
    const { id } = req.params;
    const userId = requireUserId(req);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment)
      return res.status(404).json({ message: "Shipment not found" });

    // Must be owned by the logged-in customer
    if (!shipment.customer || String(shipment.customer) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Must have a quote to approve
    if (
      !shipment.quote ||
      !Array.isArray(shipment.quote.lineItems) ||
      shipment.quote.lineItems.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "No quote found on this shipment." });
    }

    shipment.status = "customer_approved";
    shipment.quote.acceptedAt = new Date();

    shipment.trackingEvents.push({
      status: "customer_approved",
      event: "Customer approved quote",
      location: "",
      date: new Date(),
      meta: {
        source: "customer_portal_quote_approve",
        customerId: userId,
        customerEmail: shipment?.shipper?.email || null,
        quoteVersion: shipment?.quote?.version || null,
      },
    });

    await shipment.save();

    return res.status(200).json({ message: "Quote approved.", shipment });
  } catch (err) {
    console.error("approveQuoteAsCustomer error:", err);
    return res
      .status(500)
      .json({ message: "Failed to approve quote", error: err.message });
  }
}

/**
 * ✅ CUSTOMER: request quote changes (status=customer_requested_changes)
 * POST /api/v1/shipments/:id/quote/request-changes
 * Body: { message?: string }
 */
async function requestQuoteChangesAsCustomer(req, res) {
  try {
    const { id } = req.params;
    const userId = requireUserId(req);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment)
      return res.status(404).json({ message: "Shipment not found" });

    if (!shipment.customer || String(shipment.customer) !== String(userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    shipment.status = "customer_requested_changes";

    const msg = String(req.body?.message || "").trim();

    shipment.trackingEvents.push({
      status: "customer_requested_changes",
      event: msg
        ? `Customer requested changes: ${msg}`
        : "Customer requested quote changes",
      location: "",
      date: new Date(),
      meta: {
        source: "customer_portal_quote_request_changes",
        customerId: userId,
        customerEmail: shipment?.shipper?.email || null,
        quoteVersion: shipment?.quote?.version || null,
      },
    });

    await shipment.save();

    return res.status(200).json({ message: "Change request sent.", shipment });
  } catch (err) {
    console.error("requestQuoteChangesAsCustomer error:", err);
    return res
      .status(500)
      .json({ message: "Failed to request changes", error: err.message });
  }
}

/**
 * ✅ ADMIN: Send Booking Confirmation email + mark BOOKED (schema-safe)
 * --------------------------------------------------
 * @route   POST /api/v1/shipments/:id/booking/confirm
 * Optional body: { toEmail } // defaults to shipment.shipper.email
 *
 * LOCKED RULE:
 * - Only mark booked after SMTP confirms send (messageId present).
 * - If MAIL_TRANSPORT=console, simulate but DO NOT change status.
 */
async function sendBookingConfirmationEmail(req, res) {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment) {
      return res.status(404).json({ message: "Shipment not found" });
    }

    if (
      !shipment.quote ||
      !Array.isArray(shipment.quote.lineItems) ||
      shipment.quote.lineItems.length === 0
    ) {
      return res.status(400).json({
        message:
          "Cannot confirm booking: no saved quote found on this shipment.",
      });
    }

    // ✅ Match your schema workflow statuses
    const allowedPrior = new Set(["customer_approved", "quoted"]);
    if (shipment.status && !allowedPrior.has(String(shipment.status))) {
      return res.status(400).json({
        message: `Cannot confirm booking from current status "${shipment.status}". Expected customer_approved or quoted.`,
      });
    }

    const customerEmail = String(
      req.body?.toEmail || shipment.shipper?.email || "",
    ).trim();

    if (!customerEmail) {
      return res.status(400).json({
        message: "No recipient email found (shipper.email is missing).",
      });
    }

    const htmlBody = buildBookingConfirmationEmailHtml({ shipment });
    const textBody = buildBookingConfirmationText({ shipment });

    const mail = await dispatchMail({
      to: customerEmail,
      subject: `${BRAND.name} — Booking Confirmed | Ref: ${shipment.referenceNo}`,
      html: htmlBody,
      text: textBody,
    });

    // Console mode: simulate only
    if (mail && String(mail.mode).toLowerCase() === "console") {
      shipment.trackingEvents.push({
        status: "update",
        event: `Booking confirmation simulated (MAIL_TRANSPORT=console) to (${customerEmail})`,
        location: "",
        date: new Date(),
        meta: {
          updatedBy: req?.user?.id || null,
          source: "admin_booking_confirm_send",
          toEmail: customerEmail,
          mailMode: "console",
          messageId: mail.messageId || null,
        },
      });

      await shipment.save();

      return res.status(200).json({
        message:
          "MAIL_TRANSPORT=console: email simulated (not delivered). Shipment not marked as booked.",
        mail,
        shipment,
      });
    }

    // SMTP mode: require messageId
    const msgId = mail?.messageId;
    if (!msgId) {
      return res.status(500).json({
        message:
          "SMTP send did not return a messageId. Shipment not marked as booked.",
        mail,
      });
    }

    shipment.status = "booked";

    shipment.trackingEvents.push({
      status: "update",
      event: `Booking confirmed and emailed to customer (${customerEmail})`,
      location: "",
      date: new Date(),
      meta: {
        updatedBy: req?.user?.id || null,
        source: "admin_booking_confirm_send",
        toEmail: customerEmail,
        mailMode: "smtp",
        messageId: msgId,
        accepted: mail?.accepted,
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Booking confirmation emailed successfully.",
      mail,
      shipment,
    });
  } catch (err) {
    console.error("Error sending booking confirmation email:", err);
    return res.status(500).json({
      message: "Failed to send booking confirmation email",
      error: err.message,
    });
  }
}

async function getDashboardStats(req, res) {
  try {
    const baseFilter = { isDeleted: false };

    const start6Months = new Date();
    start6Months.setMonth(start6Months.getMonth() - 5);
    start6Months.setDate(1);
    start6Months.setHours(0, 0, 0, 0);

    const [
      totalShipments,
      groupedByStatus,
      groupedByMode,
      latestShipments,
      last30DaysShipments,
      routesAgg,
      monthlyAgg,
      exportRowsRaw,
    ] = await Promise.all([
      Shipment.countDocuments(baseFilter),

      Shipment.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      Shipment.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$mode", count: { $sum: 1 } } },
      ]),

      Shipment.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "referenceNo status mode ports.originPort ports.destinationPort createdAt",
        )
        .lean(),

      Shipment.find({
        ...baseFilter,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      })
        .select("createdAt")
        .lean(),

      Shipment.aggregate([
        { $match: baseFilter },
        {
          $group: {
            _id: {
              origin: "$ports.originPort",
              destination: "$ports.destinationPort",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      Shipment.aggregate([
        { $match: { ...baseFilter, createdAt: { $gte: start6Months } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Shipment.find(baseFilter)
        .sort({ createdAt: -1 })
        .limit(500)
        .select(
          "referenceNo status mode createdAt ports.originPort ports.destinationPort consignee.name shipper.name charges",
        )
        .lean(),
    ]);

    const byStatus = groupedByStatus.reduce((acc, cur) => {
      acc[cur._id || "unknown"] = cur.count;
      return acc;
    }, {});

    const byMode = groupedByMode.reduce((acc, cur) => {
      acc[cur._id || "unknown"] = cur.count;
      return acc;
    }, {});

    const delivered = byStatus.delivered || 0;
    const cancelled = byStatus.cancelled || 0;
    const pending = byStatus.pending || 0;

    const active =
      totalShipments - delivered - cancelled - pending >= 0
        ? totalShipments - delivered - cancelled - pending
        : 0;

    const totals = {
      totalShipments,
      active,
      pending,
      delivered,
      cancelled,
      last30DaysCount: last30DaysShipments.length,
    };

    const topRoutes = routesAgg.map((r) => ({
      route: `${r._id.origin} \u2192 ${r._id.destination}`,
      count: r.count,
    }));

    const monthlyBookings = monthlyAgg.map((m) => ({
      month: m._id,
      count: m.count,
    }));

    const rows = exportRowsRaw.map((s) => {
      const chargesArr = Array.isArray(s.charges) ? s.charges : [];
      const amountTotal = chargesArr.reduce(
        (sum, c) => sum + (Number(c.amount) || 0),
        0,
      );
      const currency = chargesArr.find((c) => c?.currency)?.currency || "GBP";

      return {
        referenceNo: s.referenceNo || "",
        status: s.status || "unknown",
        mode: s.mode || "",
        createdAt: s.createdAt || null,
        origin: s?.ports?.originPort || "",
        destination: s?.ports?.destinationPort || "",
        shipperName: s?.shipper?.name || "",
        consigneeName: s?.consignee?.name || "",
        amount: Number(amountTotal.toFixed(2)),
        currency,
      };
    });

    return res.status(200).json({
      data: {
        totals,
        byStatus,
        byMode,
        topRoutes,
        recent: latestShipments,
        statusCounts: byStatus,
        monthlyBookings,
        rows,
      },
    });
  } catch (err) {
    console.error("Error calculating dashboard stats:", err);
    return res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: err.message,
    });
  }
}

module.exports = {
  createShipment,
  getAllShipments,
  getOneShipment,
  assignCustomerToShipment,
  getUserShipment,
  updateShipment,
  updateCharges,
  deleteShipment,
  addTrackingEvent,
  addDocument,
  uploadDocument,
  updateStatus,
  getDashboardStats,

  // ✅ Quote
  saveQuote,
  sendQuoteEmail,

  // ✅ CUSTOMER quote actions
  approveQuoteAsCustomer,
  requestQuoteChangesAsCustomer,

  // ✅ Booking confirmation
  sendBookingConfirmationEmail,

  // ✅ NEW (PUBLIC)
  createPublicLeadShipment,

  // ✅ Snapshot builder (for backfill script)
  buildCustomerRequestSnapshot,
};
