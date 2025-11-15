import { DataGrid } from '@mui/x-data-grid';
import { FaTrash } from "react-icons/fa";


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
  },
  {
    id: 2,
    shipper: "Kwame Nkrumah University of Science & Tech",
    consignee: "Ellcworth Express (Kumasi Office)",
    from: "Birmingham, UK",
    destination: "Tema Port, Ghana",
    weight: 850,
    cost: 2_750,
  },
  {
    id: 3,
    shipper: "Mrs. Ama Boateng",
    consignee: "Kofi Boateng",
    from: "London, UK",
    destination: "Takoradi, Ghana",
    weight: 1_230,
    cost: 1_580,
  },
  {
    id: 4,
    shipper: "Jubilee Bank Ghana",
    consignee: "Secure Print Ghana",
    from: "Manchester, UK",
    destination: "Accra, Ghana",
    weight: 18,
    cost: 210,
  },
  {
    id: 5,
    shipper: "Daniel Owusu",
    consignee: "Agnes Owusu",
    from: "Leeds, UK",
    destination: "Kumasi, Ghana",
    weight: 95,
    cost: 460,
  },
];


const columns = [
  { field: "shipper", headerName: "Shipper", width: 240 },
  { field: "consignee", headerName: "Consignee", width: 240 },
  { field: "from", headerName: "From", width: 170 },
  { field: "destination", headerName: "Destination", width: 180 },
  { field: "weight", headerName: "Weight (kg)", width: 140 },
  { field: "cost", headerName: "Cost (£)", width: 120 },

  {
    field: "actions",
    headerName: "Actions",
    width: 200,
    renderCell: () => {
      return (
        <div className="flex gap-3">
          {/* Edit Button */}
          <button className="
            px-3 py-1 rounded-md font-semibold 
            bg-[#FFA500] text-black 
            hover:bg-[#e69300] transition
          ">
            Edit
          </button>

          {/* Delete Button */}
          <button className="
            flex items-center gap-2
            px-3 py-1 rounded-md font-semibold
            bg-[#E53935] text-white
            hover:bg-[#c62828] transition
          ">
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
        <button className="bg-[#1A2930] text-white px-[16px] py-[10px] rounded-md hover:bg-[#FFA500] transition">
          New Shipment
        </button>
      </div>
      <DataGrid rows={rows} columns={columns} checkboxSelection />
    </div>
  );
};

export default Shipments;
