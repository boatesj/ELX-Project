export const shipments = [
  {
    id: "ELLX-2025-001", // use the reference as the id for routing
    reference: "ELLX-2025-001",
    mode: "roro",
    status: "Booked",
    date: "2025-11-20",
    shipper: "Presbyterian University College",
    consignee: "Advanced Secure Technologies",
    from: "Cardiff, UK",
    destination: "Accra, Ghana",
    weight: 45,
    cost: 320,
    accountHolder: "Derry Morgan",

    vehicle: {
      makeModel: "Toyota Land Cruiser",
      chassisNumber: "JTEBR09J105012345",
      registrationNumber: "KY05 ABC",
      units: 1,
      dimensions: "4.95m L × 1.98m W × 1.85m H",
      commercialValue: "£18,500",
      customsRequired: true,
    },

    container: null,
    air: null,
    cargoDescription: null,

    shipperContact: {
      address: "Private Mail Bag, Koforidua, Ghana",
      email: "puc.registry@example.com",
      telephone: "+233 30 000 0000",
    },
    consigneeContact: {
      address: "Secure Print House, Accra, Ghana",
      email: "frontdesk@advsecure-ghana.com",
      telephone: "+233 24 000 1111",
    },
    documents: [
      {
        type: "Draft Bill of Lading",
        status: "Awaiting approval",
        available: true,
      },
      {
        type: "Final Bill of Lading",
        status: "Not yet issued",
        available: false,
      },
      {
        type: "Packing list (loaded units)",
        status: "Not yet available",
        available: false,
      },
    ],
  },

  {
    id: "ELLX-2025-002",
    reference: "ELLX-2025-002",
    mode: "container",
    status: "Loaded",
    date: "2025-11-18",
    shipper: "Kwame Nkrumah University of Science & Tech",
    consignee: "Ellcworth Express (Kumasi Office)",
    from: "Birmingham, UK",
    destination: "Tema Port, Ghana",
    weight: 850,
    cost: 2750,
    accountHolder: "Derry Morgan",

    container: {
      containerNumber: "MSCU1234567",
      sizeType: "40' HC",
      cargoDescription: "Examination papers and student materials",
      pieces: 120,
    },
    vehicle: null,
    air: null,
    cargoDescription: "Educational materials – boxed and palletised",

    shipperContact: {
      address: "University Post Office, Kumasi, Ghana",
      email: "exams.office@knust.edu.gh",
      telephone: "+233 32 000 2222",
    },
    consigneeContact: {
      address: "Adum Business District, Kumasi, Ghana",
      email: "ops.kumasi@ellcworth.com",
      telephone: "+233 24 123 4567",
    },
    documents: [
      { type: "Draft Bill of Lading", status: "Approved", available: true },
      { type: "Final Bill of Lading", status: "Issued", available: true },
      { type: "Packing list", status: "Available", available: true },
    ],
  },

  {
    id: "ELLX-2025-003",
    reference: "ELLX-2025-003",
    mode: "documents",
    status: "Arrived",
    date: "2025-11-15",
    shipper: "Mrs. Ama Boateng",
    consignee: "Kofi Boateng",
    from: "London, UK",
    destination: "Takoradi, Ghana",
    weight: 3,
    cost: 210,
    accountHolder: "Derry Morgan",

    vehicle: null,
    container: null,
    air: null,
    cargoDescription: "Secure documents – legal papers and certificates",

    shipperContact: {
      address: "10 High Street, London, UK",
      email: "ama.boateng@example.com",
      telephone: "+44 7700 900000",
    },
    consigneeContact: {
      address: "Harbour Road, Takoradi, Ghana",
      email: "kofi.boateng@example.com",
      telephone: "+233 26 000 3333",
    },
    documents: [
      { type: "Proof of delivery", status: "Signed", available: true },
    ],
  },

  {
    id: "ELLX-2025-004",
    reference: "ELLX-2025-004",
    mode: "air",
    status: "Booked",
    date: "2025-11-22",
    shipper: "Jubilee Bank Ghana",
    consignee: "Secure Print Ghana",
    from: "Manchester, UK",
    destination: "Accra, Ghana",
    weight: 18,
    cost: 540,
    accountHolder: "Derry Morgan",

    air: {
      serviceLevel: "Priority",
      awbNumber: "ET123-98765432",
      cargoDescription: "Secure cheque stock and cards",
      pieces: 6,
    },
    vehicle: null,
    container: null,
    cargoDescription: null,

    shipperContact: {
      address: "Jubilee House, Accra, Ghana",
      email: "ops@jubileebank.com",
      telephone: "+233 30 220 0000",
    },
    consigneeContact: {
      address: "Print House, North Industrial Area, Accra, Ghana",
      email: "dispatch@secureprint.com",
      telephone: "+233 20 111 2222",
    },
    documents: [
      { type: "Air Waybill", status: "Issued", available: true },
      { type: "Packing list", status: "Available", available: true },
    ],
  },

  {
    id: "ELLX-2025-005",
    reference: "ELLX-2025-005",
    mode: "cargo",
    status: "Loaded",
    date: "2025-11-19",
    shipper: "Daniel Owusu",
    consignee: "Agnes Owusu",
    from: "Leeds, UK",
    destination: "Kumasi, Ghana",
    weight: 95,
    cost: 460,
    accountHolder: "Derry Morgan",

    vehicle: null,
    container: null,
    air: null,
    cargoDescription: "Household goods and personal effects",

    shipperContact: {
      address: "Flat 3, City Road, Leeds, UK",
      email: "daniel.owusu@example.com",
      telephone: "+44 7700 123456",
    },
    consigneeContact: {
      address: "Aboabo, Kumasi, Ghana",
      email: "agnes.owusu@example.com",
      telephone: "+233 24 987 6543",
    },
    documents: [
      { type: "Packing list", status: "Available", available: true },
      {
        type: "Draft Bill of Lading",
        status: "Awaiting approval",
        available: true,
      },
    ],
  },
];
