// Admin/src/pages/shipment/shipmentApiHelpers.js

/**
 * Shipment responses can come back in different shapes depending on controller.
 * This makes the UI resilient without rewriting backend.
 */
export function extractShipmentFromResponse(res) {
  return res?.data?.shipment || res?.data?.data || res?.data || null;
}

/**
 * Documents can also come back in different shapes. Keep UI safe.
 */
export function extractDocumentsFromResponse(res) {
  const d1 = res?.data?.data;
  const d2 = res?.data?.documents;
  const d3 = res?.data?.shipment?.documents;
  const d4 = res?.data?.shipment?.data?.documents;
  const docs = d3 || d4 || d2 || d1;
  return Array.isArray(docs) ? docs : [];
}
