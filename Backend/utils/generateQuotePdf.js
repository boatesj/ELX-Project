const PDFDocument = require("pdfkit");

const BRAND = {
  dark: "#1A2930",
  orange: "#FFA500",
  grey: "#6B7280",
  lightGrey: "#F3F4F6",
};

function fmt(amount, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(amount || 0);
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Generate a quote/invoice PDF for a shipment.
 * @param {object} shipment - Mongoose document (lean or full)
 * @param {object} settings - Admin settings singleton
 * @returns {Promise<Buffer>}
 */
function generateQuotePdf(shipment, settings) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const companyName = settings?.company?.companyName || "Ellcworth Express Ltd";
    const tradingName = settings?.company?.tradingName || "Ellcworth Express";
    const currency    = shipment?.quote?.currency || settings?.company?.currency || "GBP";
    const q           = shipment.quote || {};
    const shipper     = shipment.shipper || {};
    const ports       = shipment.ports || {};
    const ref         = shipment.referenceNo || "—";

    // ── Header ────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 90).fill(BRAND.dark);

    doc.fillColor("#FFFFFF")
       .fontSize(20).font("Helvetica-Bold")
       .text(tradingName.toUpperCase(), 50, 28);

    doc.fontSize(9).font("Helvetica")
       .text(companyName, 50, 52)
       .text("cs@ellcworth.com  •  +44 20 8979 6054  •  www.ellcworth.com", 50, 64);

    // Orange accent bar
    doc.rect(0, 90, doc.page.width, 4).fill(BRAND.orange);

    // ── Document title ────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.fillColor(BRAND.dark).fontSize(16).font("Helvetica-Bold")
       .text("FREIGHT QUOTATION", 50, 110);

    // ── Meta grid ─────────────────────────────────────────────────────────
    const metaTop = 135;
    const col2    = 320;

    doc.fontSize(8).font("Helvetica").fillColor(BRAND.grey);
    doc.text("QUOTE REFERENCE",  50,  metaTop);
    doc.text("DATE ISSUED",      50,  metaTop + 18);
    doc.text("VALID UNTIL",      50,  metaTop + 36);
    doc.text("BILL TO",          col2, metaTop);
    doc.text("ROUTE",            col2, metaTop + 18);
    doc.text("MODE",             col2, metaTop + 36);

    doc.fontSize(9).font("Helvetica-Bold").fillColor(BRAND.dark);
    doc.text(ref,                              50,  metaTop + 9);
    doc.text(formatDate(new Date()),           50,  metaTop + 27);
    doc.text(formatDate(q.validUntil),         50,  metaTop + 45);
    doc.text(shipper.name || "—",             col2, metaTop + 9);
    doc.text(
      `${ports.originPort || "UK"} → ${ports.destinationPort || "—"}`,
      col2, metaTop + 27
    );
    doc.text(shipment.mode || "—",            col2, metaTop + 45);

    // Divider
    doc.moveTo(50, metaTop + 62).lineTo(545, metaTop + 62)
       .strokeColor(BRAND.lightGrey).lineWidth(1).stroke();

    // ── Line items table ──────────────────────────────────────────────────
    const tableTop = metaTop + 75;
    const cols     = { code: 50, label: 120, qty: 330, unit: 390, amount: 470 };

    // Table header
    doc.rect(50, tableTop, 495, 20).fill(BRAND.dark);
    doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold");
    doc.text("CODE",       cols.code,  tableTop + 6);
    doc.text("DESCRIPTION",cols.label, tableTop + 6);
    doc.text("QTY",        cols.qty,   tableTop + 6);
    doc.text("UNIT PRICE", cols.unit,  tableTop + 6);
    doc.text("AMOUNT",     cols.amount,tableTop + 6);

    const lineItems = q.lineItems || [];
    let rowY = tableTop + 24;

    lineItems.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.rect(50, rowY - 3, 495, 18).fill("#F9FAFB");
      }
      doc.fillColor(BRAND.dark).fontSize(8).font("Helvetica");
      doc.text(item.code  || "—",                     cols.code,  rowY);
      doc.text(item.label || "—",                     cols.label, rowY, { width: 200 });
      doc.text(String(item.qty || 1),                 cols.qty,   rowY);
      doc.text(fmt(item.unitPrice, currency),          cols.unit,  rowY);
      doc.text(fmt(item.amount,    currency),          cols.amount,rowY);
      rowY += 20;
    });

    if (lineItems.length === 0) {
      doc.fillColor(BRAND.grey).fontSize(8).font("Helvetica")
         .text("No line items added.", 50, rowY);
      rowY += 20;
    }

    // Divider
    doc.moveTo(50, rowY + 4).lineTo(545, rowY + 4)
       .strokeColor(BRAND.lightGrey).lineWidth(1).stroke();

    // ── Totals ────────────────────────────────────────────────────────────
    rowY += 14;
    const totCol = 400;

    doc.fontSize(8).font("Helvetica").fillColor(BRAND.grey);
    doc.text("Subtotal",  totCol, rowY);
    doc.text("Tax",       totCol, rowY + 16);

    doc.fontSize(8).font("Helvetica-Bold").fillColor(BRAND.dark);
    doc.text(fmt(q.subtotal || 0, currency), totCol + 80, rowY,   { align: "right", width: 65 });
    doc.text(fmt(q.taxTotal || 0, currency), totCol + 80, rowY + 16, { align: "right", width: 65 });

    rowY += 32;
    doc.rect(totCol - 5, rowY - 4, 155, 22).fill(BRAND.dark);
    doc.fillColor("#FFFFFF").fontSize(10).font("Helvetica-Bold");
    doc.text("TOTAL",                            totCol,      rowY + 2);
    doc.text(fmt(q.total || 0, currency),        totCol + 55, rowY + 2, { align: "right", width: 90 });

    // ── Notes ─────────────────────────────────────────────────────────────
    if (q.notesToCustomer) {
      rowY += 40;
      doc.fillColor(BRAND.grey).fontSize(8).font("Helvetica-Bold")
         .text("NOTES", 50, rowY);
      doc.fillColor(BRAND.dark).fontSize(8).font("Helvetica")
         .text(q.notesToCustomer, 50, rowY + 12, { width: 495 });
      rowY += 12 + doc.heightOfString(q.notesToCustomer, { width: 495 });
    }

    // ── Footer ────────────────────────────────────────────────────────────
    doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill(BRAND.dark);
    doc.fillColor("#FFFFFF").fontSize(7).font("Helvetica")
       .text(
         `${companyName}  •  This quotation is valid until ${formatDate(q.validUntil) || "further notice"}  •  All prices in ${currency}`,
         50, doc.page.height - 33, { align: "center", width: doc.page.width - 100 }
       );

    doc.end();
  });
}

module.exports = { generateQuotePdf };
