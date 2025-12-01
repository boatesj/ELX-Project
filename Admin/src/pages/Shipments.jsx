import { DataGrid } from "@mui/x-data-grid";
import { FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";

const Shipments = () => {
  const rows = [
    {
      id: 1,
      shipper: "Presbyterian University College",
      consignee: "Advanced Secure Technologies",
      from: "Cardiff, UK",
      destination: "Accra, Ghana",
      weight: 45,
      cost: 320,
      status: "Booked",
    },
    {
      id: 2,
      shipper: "Kwame Nkrumah University of Science & Tech",
      consignee: "Ellcworth Express (Kumasi Office)",
      from: "Birmingham, UK",
      destination: "Tema Port, Ghana",
      weight: 850,
      cost: 2750,
      status: "Loaded",
    },
    {
      id: 3,
      shipper: "Mrs. Ama Boateng",
      consignee: "Kofi Boateng",
      from: "London, UK",
      destination: "Takoradi, Ghana",
      weight: 1230,
      cost: 1580,
      status: "Arrived",
    },
    {
      id: 4,
      shipper: "Jubilee Bank Ghana",
      consignee: "Secure Print Ghana",
      from: "Manchester, UK",
      destination: "Accra, Ghana",
      weight: 18,
      cost: 210,
      status: "Booked",
    },
    {
      id: 5,
      shipper: "Daniel Owusu",
      consignee: "Agnes Owusu",
      from: "Leeds, UK",
      destination: "Kumasi, Ghana",
      weight: 95,
      cost: 460,
      status: "Loaded",
    },
  ];

  // Badge styling logic
  const getStatusClasses = (status) => {
    switch (status) {
      case "Booked":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "Loaded":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "Arrived":
        return "bg-green-100 text-green-700 border border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-300";
    }
  };

  const columns = [
    { field: "shipper", headerName: "Shipper", width: 240 },
    { field: "consignee", headerName: "Consignee", width: 240 },
    { field: "from", headerName: "From", width: 170 },
    { field: "destination", headerName: "Destination", width: 180 },
    { field: "weight", headerName: "Weight (kg)", width: 140 },
    { field: "cost", headerName: "Cost (£)", width: 120 },

    // ✓ Status Column With Badges
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

    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      filterable: false,
      renderCell: () => {
        return (
          <div className="flex items-center h-full gap-3">
            {/* Edit Button */}
            <button
              className="
                px-3 py-1 rounded-md font-semibold text-xs
                bg-[#FFA500] text-black
                hover:bg-[#e69300] transition
              "
            >
              Edit
            </button>

            {/* Delete Button */}
            <button
              className="
                flex items-center gap-2 
                px-3 py-1 rounded-md font-semibold text-xs
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
        <h1 className="text-[20px] font-semibold">All Shipments</h1>
        <Link to="/newshipment">
          <button className="bg-[#1A2930] text-white px-[16px] py-[10px] rounded-md hover:bg-[#FFA500] transition">
            New Shipment
          </button>
        </Link>
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

export default Shipments;
