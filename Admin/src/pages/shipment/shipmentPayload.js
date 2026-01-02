// Admin/src/pages/shipment/shipmentPayload.js
import { uiModeToBackendMode } from "./shipmentConstants";

/**
 * Builds the payload for PUT /shipments/:id
 * Keeps logic in one place so the component stays clean.
 */
export function buildUpdatePayload({ form, shipment, override = {} }) {
  const backendMode = uiModeToBackendMode(form.serviceType, form.mode);

  const payload = {
    referenceNo: form.referenceNo || shipment?.referenceNo,
    serviceType: form.serviceType,
    mode: backendMode,
    status: form.status,
    paymentStatus: form.paymentStatus || "unpaid",

    ports: {
      originPort: form.originPort,
      destinationPort: form.destinationPort,
    },

    shipper: {
      name: form.shipperName,
      address: form.shipperAddress,
      email: form.shipperEmail,
      phone: form.shipperPhone,
    },
    consignee: {
      name: form.consigneeName,
      address: form.consigneeAddress,
      email: form.consigneeEmail,
      phone: form.consigneePhone,
    },
    notify: {
      name: form.notifyName,
      address: form.notifyAddress,
      email: form.notifyEmail,
      phone: form.notifyPhone,
    },

    vessel: {
      name: form.vesselName,
      voyage: form.vesselVoyage,
    },

    shippingDate: form.shippingDate
      ? new Date(form.shippingDate)
      : shipment?.shippingDate,

    eta: form.eta ? new Date(form.eta) : shipment?.eta,

    cargo: {
      description: form.cargoDescription,
      weight: form.cargoWeight,
      vehicle: {
        make: form.vehicleMake,
        model: form.vehicleModel,
        year: form.vehicleYear,
        vin: form.vehicleVin,
      },
      container: {
        containerNo: form.containerNo,
        size: form.containerSize,
        sealNo: form.containerSealNo,
      },
    },

    services: {
      repacking: {
        required: form.repackingRequired,
        notes: form.repackingNotes,
      },
    },

    ...override,
  };

  // Only set cargoType if present (keeps backend clean)
  if (form.cargoType) payload.cargoType = form.cargoType;

  return payload;
}
