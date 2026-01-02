// Admin/src/pages/shipment/shipmentSelectors.js

/**
 * Pure UI selectors (no side effects).
 * These helpers just interpret the current form state.
 */

export function getCargoFlags(form = {}) {
  const serviceType = form.serviceType;
  const mode = form.mode;
  const cargoType = form.cargoType;

  const isSea = serviceType === "sea_freight";
  const isDocs = mode === "air_docs";

  // RoRo can come from mode OR cargoType (legacy)
  const isRoRo = mode === "roro" || cargoType === "vehicle";

  // Container modes can be inferred from mode OR cargoType (legacy)
  const isContainerMode =
    mode === "fcl" ||
    mode === "lcl" ||
    cargoType === "container" ||
    cargoType === "lcl";

  return { isSea, isDocs, isRoRo, isContainerMode };
}

export function getModeOptions(MODE_OPTIONS, serviceType) {
  return MODE_OPTIONS?.[serviceType] || [];
}

export function getQuoteStageFlags(REQUEST_STATUSES, status) {
  const isRequestPipeline = REQUEST_STATUSES?.has(status);

  const isQuotedStage =
    status === "quoted" || status === "customer_requested_changes";

  const isApprovedStage = status === "customer_approved";
  const isBookedStage = status === "booked";

  return { isRequestPipeline, isQuotedStage, isApprovedStage, isBookedStage };
}

export function getQuoteActionFlags({
  statusActing,
  saving,
  quoteSending,
  quoteSaving,
  isQuotedStage,
  isApprovedStage,
}) {
  const busy = !!(statusActing || saving || quoteSending || quoteSaving);

  const canMarkApproved = !busy && !!isQuotedStage;
  const canConfirmBooking = !busy && !!isApprovedStage;

  return { canMarkApproved, canConfirmBooking };
}
