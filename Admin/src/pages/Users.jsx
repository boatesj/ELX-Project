import { DataGrid } from "@mui/x-data-grid";
import { FaTrash, FaEye, FaEdit } from "react-icons/fa";

const Users = () => {
  const rows = [
    {
      id: 1,
      name: "OceanGate Logistics Ltd",
      email: "ops@oceangate.co.uk",
      phone: "+44 20 8801 9900",
      type: "Shipper",
      country: "United Kingdom",
      city: "London",
      status: "Active",
      registered: "2024-01-08",
    },
    {
      id: 2,
      name: "Global Tech Supplies Inc.",
      email: "contact@globaltechsupplies.com",
      phone: "+1 415 227 9002",
      type: "Shipper",
      country: "United States",
      city: "San Francisco",
      status: "Active",
      registered: "2023-12-18",
    },
    {
      id: 3,
      name: "Maria Hernandez",
      email: "maria.hdz@mail.com",
      phone: "+55 11 98221 4410",
      type: "Shipper",
      country: "Brazil",
      city: "São Paulo",
      status: "Pending",
      registered: "2024-02-01",
    },
    {
      id: 4,
      name: "Zenith Auto Parts FZC",
      email: "sales@zenithautoparts.ae",
      phone: "+971 6 557 9921",
      type: "Consignee",
      country: "United Arab Emirates",
      city: "Sharjah",
      status: "Active",
      registered: "2023-11-22",
    },
    {
      id: 5,
      name: "Klaus Müller",
      email: "kmueller@web.de",
      phone: "+49 30 5521 0198",
      type: "Shipper",
      country: "Germany",
      city: "Berlin",
      status: "Active",
      registered: "2024-03-10",
    },
    {
      id: 6,
      name: "Nairobi Medical Centre",
      email: "admin@nmc.ke",
      phone: "+254 722 129 380",
      type: "Consignee",
      country: "Kenya",
      city: "Nairobi",
      status: "Active",
      registered: "2023-10-14",
    },
    {
      id: 7,
      name: "Li Wei",
      email: "li.wei88@163.com",
      phone: "+86 21 6672 3811",
      type: "Shipper",
      country: "China",
      city: "Shanghai",
      status: "Suspended",
      registered: "2023-09-05",
    },
    {
      id: 8,
      name: "Toronto Freight Hub",
      email: "info@tfh.ca",
      phone: "+1 647 901 2299",
      type: "Shipper",
      country: "Canada",
      city: "Toronto",
      status: "Active",
      registered: "2024-02-20",
    },
    {
      id: 9,
      name: "West African Trading Co.",
      email: "support@watc.ng",
      phone: "+234 803 112 7744",
      type: "Consignee",
      country: "Nigeria",
      city: "Lagos",
      status: "Active",
      registered: "2023-08-19",
    },
    {
      id: 10,
      name: "Indian Machine Works",
      email: "contact@imw.in",
      phone: "+91 44 90900 1188",
      type: "Shipper",
      country: "India",
      city: "Chennai",
      status: "Active",
      registered: "2024-01-30",
    },
    {
      id: 11,
      name: "EcoFarm Produce SA",
      email: "hello@ecofarm.co.za",
      phone: "+27 11 880 2229",
      type: "Consignee",
      country: "South Africa",
      city: "Johannesburg",
      status: "Active",
      registered: "2023-12-01",
    },
    {
      id: 12,
      name: "Haruna Mensah",
      email: "hmensah@gmail.com",
      phone: "+233 244 772 100",
      type: "Shipper",
      country: "Ghana",
      city: "Accra",
      status: "Pending",
      registered: "2024-03-22",
    },
    {
      id: 13,
      name: "Royal Exports Limited",
      email: "exports@royalexports.pk",
      phone: "+92 321 440 9901",
      type: "Shipper",
      country: "Pakistan",
      city: "Karachi",
      status: "Active",
      registered: "2023-11-11",
    },
    {
      id: 14,
      name: "Apex Furniture Co.",
      email: "sales@apexfurniture.com",
      phone: "+65 8123 4321",
      type: "Shipper",
      country: "Singapore",
      city: "Singapore",
      status: "Active",
      registered: "2023-12-28",
    },
    {
      id: 15,
      name: "EuroTech Components",
      email: "contact@eurotech.fr",
      phone: "+33 1 4421 9001",
      type: "Consignee",
      country: "France",
      city: "Paris",
      status: "Active",
      registered: "2024-01-05",
    },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border border-green-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "Suspended":
        return "bg-red-100 text-red-700 border border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const columns = [
    { field: "name", headerName: "Full Name / Company", width: 250 },
    { field: "email", headerName: "Email", width: 240 },
    { field: "phone", headerName: "Phone", width: 160 },
    { field: "type", headerName: "User Type", width: 130 },
    { field: "country", headerName: "Country", width: 150 },
    { field: "city", headerName: "City", width: 150 },

    {
      field: "status",
      headerName: "Status",
      width: 150,
      renderCell: (params) => (
        <div className="flex items-center h-full">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold leading-tight ${getStatusClasses(
              params.value
            )}`}
          >
            {params.value}
          </span>
        </div>
      ),
    },

    { field: "registered", headerName: "Registered", width: 150 },

    {
      field: "actions",
      headerName: "Actions",
      width: 260,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const userId = params.row.id;

        const handleView = () => {
          console.log("View user", userId);
        };

        const handleEdit = () => {
          console.log("Edit user", userId);
        };

        const handleDelete = () => {
          console.log("Delete user", userId);
        };

        return (
          <div className="flex items-center h-full gap-2">
            {/* View */}
            <button
              onClick={handleView}
              className="
                flex items-center gap-1
                px-2 py-1 rounded-md text-xs font-semibold
                bg-[#1A2930] text-white
                hover:bg-[#243746] transition
              "
            >
              <FaEye className="text-white" />
              View
            </button>

            {/* Edit */}
            <button
              onClick={handleEdit}
              className="
                flex items-center gap-1
                px-2 py-1 rounded-md text-xs font-semibold
                bg-[#FFA500] text-[#1A2930]
                hover:bg-[#ffb733] transition
              "
            >
              <FaEdit />
              Edit
            </button>

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="
                flex items-center gap-1
                px-2 py-1 rounded-md text-xs font-semibold
                bg-[#E53935] text-white
                hover:bg-[#c62828] transition
              "
            >
              <FaTrash className="text-white" />
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="m-[30px] bg-[#D9D9D9] p-[20px] rounded-md">
      <div className="flex items-center justify-between mb-[20px]">
        <h1 className="text-[20px] font-semibold">All Users</h1>
        <button className="bg-[#1A2930] text-white px-[16px] py-[10px] rounded-md hover:bg-[#FFA500] transition">
          New User
        </button>
      </div>

      <div className="bg-white rounded-md p-4 shadow-md">
        <DataGrid
          rows={rows}
          columns={columns}
          checkboxSelection
          autoHeight
          pageSizeOptions={[5, 10]}
          initialState={{
            pagination: { paginationModel: { pageSize: 5, page: 0 } },
          }}
        />
      </div>
    </div>
  );
};

export default Users;
