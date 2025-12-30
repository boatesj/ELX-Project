// Backend/controllers/shipment.js
const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");

// ✅ Import BackgroundServices mail dispatcher (adjust path if needed)
let dispatchMail = null;
try {
  // From Backend/controllers -> ../../BackgroundServices/EmailService/helpers/sendmail.js
  // If your folder structure differs, update this path.
  // eslint-disable-next-line global-require
  ({
    dispatchMail,
  } = require("../../BackgroundServices/EmailService/helpers/sendmail"));
} catch (e) {
  // Keep API usable even if mail service isn't wired in this environment
  dispatchMail = null;
  console.warn(
    "⚠️ Email dispatcher not available. sendQuoteEmail will fail until dispatchMail is wired.",
    e?.message
  );
}

/**
 * Role helpers (your requireAuth normalizes role to lower-case)
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

// ---------------- QUOTE HELPERS ----------------

function toMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}

function computeQuoteTotals(rawQuote = {}) {
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

function buildQuoteEmailHtml({ shipment, quote }) {
  const ref = escapeHtml(shipment.referenceNo || "");
  const shipperName = escapeHtml(shipment.shipper?.name || "Customer");
  const origin = escapeHtml(shipment.ports?.originPort || "");
  const dest = escapeHtml(shipment.ports?.destinationPort || "");
  const serviceType = escapeHtml(shipment.serviceType || "");
  const mode = escapeHtml(shipment.mode || "");
  const validUntil = quote.validUntil
    ? new Date(quote.validUntil).toLocaleDateString("en-GB")
    : null;

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
          <td style="padding:10px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${escapeHtml(
            amt
          )}</td>
        </tr>
      `;
    })
    .join("");

  const notes = quote.notesToCustomer
    ? `<div style="margin-top:12px;color:#334155;font-size:14px;line-height:1.4;">
         <strong>Notes:</strong><br/>${escapeHtml(
           quote.notesToCustomer
         ).replaceAll("\n", "<br/>")}
       </div>`
    : "";

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="padding:18px 22px;background:#1A2930;color:#fff;">
        <div style="font-size:14px;letter-spacing:0.06em;text-transform:uppercase;opacity:.9;">Ellcworth Express</div>
        <div style="margin-top:6px;font-size:18px;font-weight:700;">Freight Quote</div>
        <div style="margin-top:6px;font-size:12px;opacity:.9;">Reference: <span style="font-family:monospace;">${ref}</span></div>
      </div>

      <div style="padding:18px 22px;">
        <p style="margin:0 0 10px 0;font-size:14px;color:#0f172a;">Dear ${shipperName},</p>
        <p style="margin:0 0 14px 0;font-size:14px;color:#334155;line-height:1.4;">
          Thank you for your request. Please find our quote below for <strong>${origin} → ${dest}</strong>
          (${serviceType}${mode ? ` · ${mode}` : ""}).
        </p>

        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0f172a;">
          <thead>
            <tr>
              <th style="text-align:left;padding:10px 8px;border-bottom:2px solid #e5e7eb;">Charge</th>
              <th style="text-align:right;padding:10px 8px;border-bottom:2px solid #e5e7eb;">Qty</th>
              <th style="text-align:right;padding:10px 8px;border-bottom:2px solid #e5e7eb;">Unit</th>
              <th style="text-align:right;padding:10px 8px;border-bottom:2px solid #e5e7eb;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows || ""}
          </tbody>
        </table>

        <div style="margin-top:14px;border-top:1px solid #e5e7eb;padding-top:12px;">
          <div style="display:flex;justify-content:flex-end;gap:24px;font-size:14px;color:#0f172a;">
            <div style="text-align:right;">
              <div style="color:#64748b;">Subtotal</div>
              <div style="font-weight:700;">${escapeHtml(
                formatCurrency(quote.subtotal, quote.currency)
              )}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:#64748b;">Tax</div>
              <div style="font-weight:700;">${escapeHtml(
                formatCurrency(quote.taxTotal, quote.currency)
              )}</div>
            </div>
            <div style="text-align:right;">
              <div style="color:#64748b;">Total</div>
              <div style="font-weight:800;font-size:16px;">${escapeHtml(
                formatCurrency(quote.total, quote.currency)
              )}</div>
            </div>
          </div>
        </div>

        ${
          validUntil
            ? `<div style="margin-top:10px;color:#64748b;font-size:12px;">Quote valid until: <strong>${escapeHtml(
                validUntil
              )}</strong></div>`
            : ""
        }

        ${notes}

        <div style="margin-top:16px;color:#334155;font-size:14px;line-height:1.4;">
          If you would like to proceed, please reply to this email quoting your reference number above.
          (Customer portal acceptance will be added next.)
        </div>

        <div style="margin-top:18px;color:#64748b;font-size:12px;">
          Kind regards,<br/>
          Ellcworth Express Operations
        </div>
      </div>
    </div>
  </div>
  `;
}

// ---------------- CONTROLLERS ----------------

/**
 * CREATE SHIPMENT
 * --------------------------------------------------
 * @route   POST /shipments
 * @access  Authenticated (admin / portal user)
 * Body is validated by validateShipmentCreate + handleValidation.
 */
async function createShipment(req, res) {
  try {
    const payload = { ...req.body };

    // Never allow client to force isDeleted/referenceNo unless migration flag is explicitly set
    payload.isDeleted = false;

    if (!req.query.keepRef) {
      delete payload.referenceNo;
    }

    const userId = requireUserId(req);
    const admin = isAdmin(req);

    // Ownership rules:
    // - Customer: customer MUST be req.user.id (ignore any supplied customer)
    // - Admin: can create for a specified customer; if not provided, default to admin user id
    if (!admin) {
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      payload.customer = userId;
    } else {
      if (!payload.customer) payload.customer = userId; // admin creating for self by default
    }

    // createdBy should always be the authenticated actor if present
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

/**
 * GET ALL SHIPMENTS (with optional filters)
 * --------------------------------------------------
 * @route   GET /shipments
 * @desc    Admin-only list (route is gated). Defensive here too.
 * @access  Authenticated
 *
 * NOTE:
 *  - Returns a plain ARRAY for backwards compatibility.
 *  - Supports optional ?page=&limit=
 */
async function getAllShipments(req, res) {
  try {
    // Defensive: should already be admin-gated in routes
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

/**
 * GET ONE SHIPMENT BY ID
 * --------------------------------------------------
 * @route   GET /shipments/:id
 * @access  Authenticated (admin or owner)
 */
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
 * GET LOGGED-IN USER'S SHIPMENTS
 * --------------------------------------------------
 * @route   GET /shipments/me/list
 * @desc    Customer portal "My Shipments"
 * @access  Authenticated
 */
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

/**
 * UPDATE SHIPMENT
 * --------------------------------------------------
 * @route   PUT /shipments/:id
 * @access  Authenticated (admin or owner) — with role-based field restrictions
 */
async function updateShipment(req, res) {
  try {
    const { id } = req.params;

    // Ensure shipment exists + caller is allowed to touch it
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

    // Apply updates safely
    Object.assign(shipment, updates);

    await shipment.save();

    return res.status(200).json({
      message: "Shipment updated successfully",
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

/**
 * SOFT DELETE SHIPMENT
 * --------------------------------------------------
 * @route   DELETE /shipments/:id
 * @desc    Soft-delete (isDeleted=true)
 * @access  Authenticated (admin or owner)
 */
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
      message: "Shipment deleted (soft delete) successfully",
    });
  } catch (err) {
    console.error("Error deleting shipment:", err);
    return res.status(500).json({
      message: "Failed to delete shipment",
      error: err.message,
    });
  }
}

/**
 * ADD TRACKING EVENT (admin only — route enforces)
 */
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
      message: "Tracking event added successfully",
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

/**
 * ADD DOCUMENT (admin only — route enforces)
 * IMPORTANT: Admin UI expects an array at res.data.data (documents array).
 */
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

    // ✅ Return documents array in `data` for Shipment.jsx
    return res.status(200).json({
      message: "Document added to shipment",
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

/**
 * UPDATE STATUS (admin only — route enforces)
 */
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
      message: "Shipment status updated",
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
 * ✅ SAVE QUOTE (admin only — route enforces)
 * --------------------------------------------------
 * @route   PATCH /api/v1/shipments/:id/quote
 * Body: { quote: { currency, validUntil, notesToCustomer, internalNotes, lineItems[] } }
 */
async function saveQuote(req, res) {
  try {
    if (!isAdmin(req)) return res.status(403).json({ message: "Forbidden" });

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid shipment id" });
    }

    const shipment = await Shipment.findOne({ _id: id, isDeleted: false });
    if (!shipment)
      return res.status(404).json({ message: "Shipment not found" });

    const incoming = req.body?.quote || req.body || {};
    const computed = computeQuoteTotals(incoming);

    if (!computed.lineItems || computed.lineItems.length === 0) {
      return res.status(400).json({
        message: "Quote must contain at least one line item with a label.",
      });
    }

    // Versioning: bump if quote exists
    const prevVersion = shipment.quote?.version || 0;
    const nextVersion = prevVersion ? prevVersion + 1 : 1;

    shipment.quote = {
      ...(shipment.quote ? shipment.quote.toObject?.() : {}),
      ...computed,
      version: nextVersion,
      sentAt: shipment.quote?.sentAt, // keep if already sent (we only set on send endpoint)
      acceptedAt: shipment.quote?.acceptedAt,
      acceptedByEmail: shipment.quote?.acceptedByEmail,
    };

    // Optional: if in request_received, move to under_review when quote draft saved
    if (shipment.status === "request_received") {
      shipment.status = "under_review";
    }

    shipment.trackingEvents.push({
      status: "update",
      event: `Quote draft saved (v${nextVersion})`,
      location: "",
      date: new Date(),
      meta: {
        updatedBy: req?.user?.id || null,
        source: "admin_quote_save",
        quoteVersion: nextVersion,
        total: shipment.quote.total,
        currency: shipment.quote.currency,
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Quote saved",
      shipment,
    });
  } catch (err) {
    console.error("Error saving quote:", err);
    return res.status(500).json({
      message: "Failed to save quote",
      error: err.message,
    });
  }
}

/**
 * ✅ SEND QUOTE EMAIL (admin only — route enforces)
 * --------------------------------------------------
 * @route   POST /api/v1/shipments/:id/quote/send
 * Optional body: { toEmail }  // defaults to shipment.shipper.email
 */
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

    // Recompute totals defensively (in case something changed)
    const computed = computeQuoteTotals(shipment.quote);
    shipment.quote.subtotal = computed.subtotal;
    shipment.quote.taxTotal = computed.taxTotal;
    shipment.quote.total = computed.total;

    const toEmail = String(
      req.body?.toEmail || shipment.shipper?.email || ""
    ).trim();
    if (!toEmail) {
      return res
        .status(400)
        .json({
          message: "No recipient email found (shipper.email is missing).",
        });
    }

    if (!dispatchMail) {
      return res.status(500).json({
        message:
          "Email dispatcher not available. Wire BackgroundServices EmailService or provide dispatchMail in this environment.",
      });
    }

    const subject = `Ellcworth Express Quote — ${shipment.referenceNo}`;
    const html = buildQuoteEmailHtml({ shipment, quote: shipment.quote });

    const from =
      process.env.EMAIL_FROM || process.env.EMAIL || "no-reply@ellcworth.com";

    await dispatchMail({
      from,
      to: toEmail,
      subject,
      html,
    });

    shipment.quote.sentAt = new Date();
    shipment.status = "quoted";

    shipment.trackingEvents.push({
      status: "update",
      event: `Quote sent to customer (${toEmail})`,
      location: "",
      date: new Date(),
      meta: {
        updatedBy: req?.user?.id || null,
        source: "admin_quote_send",
        toEmail,
        quoteVersion: shipment.quote.version || 1,
        total: shipment.quote.total,
        currency: shipment.quote.currency,
      },
    });

    await shipment.save();

    return res.status(200).json({
      message: "Quote emailed successfully",
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
 * DASHBOARD STATS (admin only — route enforces)
 * Shape aligned with Home.jsx expectations.
 */
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
  deleteShipment,
  addTrackingEvent,
  addDocument,
  updateStatus,
  getDashboardStats,

  // ✅ NEW exports
  saveQuote,
  sendQuoteEmail,
};
