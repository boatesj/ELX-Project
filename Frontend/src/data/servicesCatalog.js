import {
  FaShip,
  FaCarSide,
  FaPlaneDeparture,
  FaFileSignature,
  FaBoxes,
  FaRegClipboard,
} from "react-icons/fa";

export const SERVICES = [
  {
    id: "container",
    icon: FaShip,
    eyebrow: "FCL & LCL",
    title: "Container Shipping",
    summary:
      "Full and shared containers from the UK to key West African ports with disciplined planning and milestone updates.",
    body: "Move freight with predictable planning — full containers for scale, shared containers for efficiency. We coordinate the paperwork, schedules and handoffs so there are no surprises at loading or arrival.",
    bestFor: "Planned export, bulk cargo, commercial lanes, and cost control.",
    highlights: [
      "FCL / LCL options",
      "Port-to-port or door solutions",
      "Milestone updates",
    ],
    requirements: [
      "Commodity description + packing list",
      "Gross weight + dimensions (or carton count)",
      "Collection address (if pickup required)",
      "Destination port / city + consignee details",
      "Target sailing week / required delivery date",
    ],
    steps: [
      "Share shipment details and preferred timeline",
      "We confirm route options, cut-off dates and documentation requirements",
      "Cargo is collected or delivered to our nominated point",
      "Loaded onto vessel and tracked through key milestones",
      "Arrival support and release guidance (destination-side support as agreed)",
    ],
    docs: [
      "Commercial invoice / proforma (as applicable)",
      "Packing list",
      "Export docs as required (depending on cargo)",
      "Consignee ID / clearance requirements (destination dependent)",
    ],
    cta: { label: "Plan a container shipment", service: "container" },
  },

  {
    id: "roro",
    icon: FaCarSide,
    eyebrow: "Vehicles & Plant",
    title: "RoRo Vehicle Shipping",
    summary:
      "Cars, vans, 4×4s, trucks and plant shipped on regular RoRo sailings with clear document guidance.",
    body: "Export vehicles and rolling equipment with disciplined handling and clear documentation guidance. We help you avoid common errors that delay port release.",
    bestFor: "Cars, 4×4s, vans, trucks, plant, and rolling stock.",
    highlights: [
      "Regular sailings",
      "Vehicle handling care",
      "Docs and release guidance",
    ],
    requirements: [
      "Vehicle make/model + year",
      "VIN / chassis number",
      "Running status (running / non-runner)",
      "Pickup location or delivery to yard",
      "Consignee details + destination port",
    ],
    steps: [
      "Share vehicle details (VIN + spec) and preferred sailing week",
      "We confirm yard drop-off / collection and required documentation",
      "Vehicle delivered to yard and inspected for obvious issues",
      "Loaded RoRo and tracked through milestones",
      "Arrival and release guidance (destination dependent)",
    ],
    docs: [
      "V5C (logbook) or proof of ownership",
      "Copy of shipper/consignee ID (destination dependent)",
      "Any export declarations required",
    ],
    cta: { label: "Ship a vehicle by RoRo", service: "roro" },
  },

  {
    id: "air",
    icon: FaPlaneDeparture,
    eyebrow: "Priority uplift",
    title: "Fast Air Freight",
    summary:
      "Time-critical cargo moved by air with clear handoff checkpoints and priority options.",
    body: "When timelines tighten, air keeps commitments intact — fast uplift with visible progress. We’ll confirm cut-off times, packaging expectations and paperwork early.",
    bestFor: "Urgent cargo where delays are not acceptable.",
    highlights: [
      "Time-critical lanes",
      "Priority options",
      "Clear handoff checkpoints",
    ],
    requirements: [
      "Cargo description + value (for customs)",
      "Exact weight + dimensions",
      "Packaging type (cartons / pallets)",
      "Pickup address (if required) + deadline",
      "Consignee details + destination airport/city",
    ],
    steps: [
      "Share cargo details and the deadline you must meet",
      "We confirm flight options, cut-off time and documentation",
      "Cargo collected or delivered to our air export point",
      "Air uplift and milestone updates",
      "Arrival support and release guidance (as agreed)",
    ],
    docs: [
      "Commercial invoice / proforma",
      "Packing list",
      "Any licenses/permits if applicable",
    ],
    cta: { label: "Request an air freight quote", service: "air" },
  },

  {
    id: "documents",
    icon: FaFileSignature,
    eyebrow: "Secure handling",
    title: "Secure Document Logistics",
    summary:
      "Certificates, cheques and secure print handled with care and accountability.",
    body: "Sensitive documents handled with controlled handoffs and clear accountability — the right discipline for high-trust items.",
    bestFor: "Certificates, cheques, sensitive paperwork, secure print.",
    highlights: [
      "Controlled handling",
      "Clear accountability",
      "Reduced risk of errors",
    ],
    requirements: [
      "Document type + quantity",
      "Destination address + recipient contact",
      "Required delivery date / urgency",
      "Handling instructions (if any)",
    ],
    steps: [
      "Confirm document type and delivery time requirement",
      "Agree controlled handoff method and tracking level",
      "Dispatch with secure packaging and tracking",
      "Delivery confirmation where available",
    ],
    docs: ["Recipient details", "Any delivery authorisation required"],
    cta: { label: "Arrange secure document delivery", service: "documents" },
  },

  {
    id: "repacking",
    icon: FaBoxes,
    eyebrow: "Inbound → Export-ready",
    title: "Repacking & Consolidation",
    summary:
      "Multiple UK deliveries consolidated into one export shipment — checked, repacked, and organised.",
    body: "Multiple UK deliveries consolidated into one export shipment — checked, repacked, and organised to reduce waste and improve export readiness.",
    bestFor:
      "Multi-supplier orders, bulk buys, mixed cartons needing export prep.",
    highlights: [
      "Inbound checks",
      "Export-ready packing",
      "Single consolidated shipment",
    ],
    requirements: [
      "Supplier list + expected delivery window",
      "Item list / SKU list (if available)",
      "Repacking standard required (basic / reinforced / palletised)",
      "Destination + shipment mode (container / air / etc.)",
    ],
    steps: [
      "Receive inbound deliveries and log contents",
      "Repack/strengthen and consolidate into export-ready units",
      "Provide a final packing list and shipment summary",
      "Ship using the selected export service",
    ],
    docs: ["Supplier references", "Item list (if available)"],
    cta: { label: "Consolidate my shipments", service: "repacking" },
  },

  {
    id: "customs",
    icon: FaRegClipboard,
    eyebrow: "Paperwork & compliance",
    title: "Export & Customs Support",
    summary:
      "Practical guidance to reduce document errors and prevent avoidable delays at origin or destination.",
    body: "Practical guidance to reduce document errors and prevent avoidable delays at origin or destination. We help you get documentation ready early and correctly.",
    bestFor:
      "Shippers who want fewer mistakes and smoother clearance outcomes.",
    highlights: [
      "Document preparation",
      "Valuations guidance",
      "Destination readiness",
    ],
    requirements: [
      "Commodity descriptions + values",
      "Consignee details + destination requirements",
      "Supporting docs (invoices, packing list, IDs)",
      "Timeline (when goods must move)",
    ],
    steps: [
      "Identify the required export/customs documentation",
      "Validate values, item descriptions, and consistency",
      "Prepare/guide the export documentation process",
      "Support handoff for clearance steps (as agreed)",
    ],
    docs: [
      "Invoice/proforma",
      "Packing list",
      "IDs and any permits (if applicable)",
    ],
    cta: { label: "Get export paperwork support", service: "customs" },
  },
];

export const getServiceById = (id) => {
  const key = String(id || "")
    .trim()
    .toLowerCase();
  return SERVICES.find((s) => s.id === key) || null;
};
