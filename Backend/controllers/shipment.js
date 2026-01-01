// Backend/controllers/shipment.js
const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

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

// ---------------- QUOTE HELPERS (Option A sync + totals) ----------------
// (Added near top as requested)

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
 * Line-items totals helper (NEW)
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
 * Convert quote lineItems to charges[] (NEW)
 * NOTE: charges schema may vary; we include currency/category for safety.
 */
function quoteLineItemsToCharges(lineItems = [], currency = "GBP") {
  const items = Array.isArray(lineItems) ? lineItems : [];
  return items
    .filter((li) => String(li?.label || "").trim())
    .map((li) => {
      const qty = toNumber(li.qty, 1);
      const unitPrice = toNumber(li.unitPrice, 0);

      const amount =
        li.amount !== undefined && li.amount !== null && li.amount !== ""
          ? toNumber(li.amount, qty * unitPrice)
          : qty * unitPrice;

      const taxRate = toNumber(li.taxRate, 0);

      return {
        code: String(li.code || "").trim(),
        label: String(li.label || "").trim(),
        qty,
        unitPrice: round2(unitPrice),
        amount: round2(amount),
        taxRate,
        currency: String(currency || "GBP").trim() || "GBP",
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

  // These should never be client-controlled:
  delete clean.createdBy;

  // 🚫 Ownership reassignment via update route is risky; keep createShipment as the place to set customer.
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

// ---------------- QUOTE HELPERS (email formatting, etc.) ----------------

function toMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

/**
 * Existing quote-object normalizer (kept for email builder / sendQuoteEmail)
 * (Renamed to avoid clashing with new computeQuoteTotals(lineItems))
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
    normalizedItems.reduce((sum, li) => sum + (Number(li.amount) || 0), 0)
  );

  const taxTotal = toMoney(
    normalizedItems.reduce((sum, li) => sum + (Number(li._tax) || 0), 0)
  );

  const total = toMoney(subtotal + taxTotal);

  // Strip internal field
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
            BRAND.name
          )}</div>
          <div style="margin-top:6px;font-size:18px;font-weight:800;">${escapeHtml(
            title
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
            unit
          )}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:700;">${escapeHtml(
            amt
          )}</td>
        </tr>
      `;
    })
    .join("");

  const notes = quote.notesToCustomer
    ? `<div style="margin-top:12px;color:#334155;font-size:14px;line-height:1.6;">
         <strong>Notes:</strong><br/>${escapeHtml(
           quote.notesToCustomer
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
            BRAND.name
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
                  validUntil
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
                formatCurrency(quote.subtotal, quote.currency)
              )}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:${BRAND.colours.muted};">Tax</div>
              <div style="font-weight:800;">${escapeHtml(
                formatCurrency(quote.taxTotal, quote.currency)
              )}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:${BRAND.colours.muted};">Total</div>
              <div style="font-weight:900;font-size:16px;">${escapeHtml(
                formatCurrency(quote.total, quote.currency)
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

// ---------------- CONTROLLERS ----------------

async function createShipment(req, res) {
  try {
    const payload = { ...req.body };

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

    const shipment = await Shipment.create(payload);

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
      Math.max(parseInt(req.query.limit, 10) || 200, 1),
      500
    );
    const skip = (page - 1) * limit;

    const shipments = await Shipment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("customer", "fullname email country")
      .lean();

    return res.status(200).json(shipments);
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
    Object.assign(shipment, updates);

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

    shipment.isDeleted = true;
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

    const allowedStatuses = [
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
    if (status && allowedStatuses.includes(status)) {
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
    const { name, fileUrl } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
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
    });
  } catch (err) {
    console.error("Error adding document to shipment:", err);
    return res.status(500).json({
      message: "Failed to add document",
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

    const allowedStatuses = [
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

    if (!status || !allowedStatuses.includes(status)) {
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
 * ALSO syncs: shipment.charges[] derived from quote.lineItems
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

    // Must have at least one labelled line
    const hasAnyLabel = incomingLineItems.some((li) =>
      String(li?.label || "").trim()
    );
    if (!hasAnyLabel) {
      return res.status(400).json({
        ok: false,
        message: "Quote must contain at least one line item label.",
      });
    }

    // Totals + cleaned items
    const { clean, subtotal, taxTotal, total } =
      computeQuoteTotals(incomingLineItems);

    // Update quote object
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
          toNumber(li.qty, 1) * toNumber(li.unitPrice, 0)
        ),
        taxRate: toNumber(li.taxRate, 0),
      })),
      subtotal,
      // keep both names for compatibility with existing email template (taxTotal) and any older fields (tax)
      taxTotal,
      tax: taxTotal,
      total,
      version: prevVersion + 1,
      // Do NOT set sentAt here; send endpoint handles sentAt
    };

    // ✅ Sync charges[] from quote lineItems (Option A)
    shipment.charges = quoteLineItemsToCharges(
      shipment.quote.lineItems,
      currency
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
    shipment.quote.tax = computed.taxTotal;
    shipment.quote.total = computed.total;

    const customerEmail = String(
      req.body?.toEmail || shipment.shipper?.email || ""
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
        shipment.quote?.total || 0
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

      await shipment.save();

      return res.status(200).json({
        message:
          "MAIL_TRANSPORT=console: email simulated (not delivered). Quote not marked as sent.",
        mail,
        shipment,
      });
    }

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
 * ✅ ADMIN: Send Booking Confirmation email + mark booking_confirmed (truth rules)
 * --------------------------------------------------
 * @route   POST /api/v1/shipments/:id/booking/confirm
 * Optional body: { toEmail } // defaults to shipment.shipper.email
 *
 * LOCKED RULE:
 * - Only mark booking_confirmed after SMTP confirms send (messageId present).
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

    // Require that a quote exists (booking confirmation assumes quote stage happened)
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

    // Soft guard on lifecycle (do not hard-refactor status system here)
    const allowedPrior = new Set(["quoted", "quote_accepted"]);
    if (shipment.status && !allowedPrior.has(String(shipment.status))) {
      return res.status(400).json({
        message: `Cannot confirm booking from current status "${shipment.status}". Expected quoted or quote_accepted.`,
      });
    }

    const customerEmail = String(
      req.body?.toEmail || shipment.shipper?.email || ""
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
          "MAIL_TRANSPORT=console: email simulated (not delivered). Booking not marked as confirmed.",
        mail,
        shipment,
      });
    }

    // SMTP mode: require messageId
    const msgId = mail?.messageId;
    if (!msgId) {
      return res.status(500).json({
        message:
          "SMTP send did not return a messageId. Booking not marked as confirmed.",
        mail,
      });
    }

    // ✅ Now (and only now) mark booking confirmed
    shipment.status = "booking_confirmed";

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
          "referenceNo status mode ports.originPort ports.destinationPort createdAt"
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
          "referenceNo status mode createdAt ports.originPort ports.destinationPort consignee.name shipper.name charges"
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
        0
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
  getUserShipment,
  updateShipment,
  updateCharges,
  deleteShipment,
  addTrackingEvent,
  addDocument,
  updateStatus,
  getDashboardStats,

  // ✅ Quote
  saveQuote,
  sendQuoteEmail,

  // ✅ Booking confirmation
  sendBookingConfirmationEmail,
};
