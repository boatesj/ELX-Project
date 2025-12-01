const NewShipment = () => {
  return (
    <div className="m-[30px] bg-white p-[30px] rounded-md shadow-md">
      <h2 className="text-[22px] font-semibold mb-[20px]">New Shipment</h2>

      <div className="flex gap-[40px] flex-wrap">

        {/* LEFT COLUMN */}
        <div>
          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Origin</label>
            <input
              type="text"
              placeholder="Ontario, Canada"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>

          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Destination</label>
            <input
              type="text"
              placeholder="Alaska, USA"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>

          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Shipper</label>
            <input
              type="text"
              placeholder="Andy Ferguson"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>
          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Shipper's Email</label>
            <input
              type="email"
              placeholder="marvelous@plush.com"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>

          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Consignee</label>
            <input
              type="text"
              placeholder="Marjorie Blunt"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>


          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Consignee's Email</label>
            <input
              type="email"
              placeholder="hellomad@flatpack.com"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Weight (kg)</label>
            <input
              type="number"
              placeholder="2000"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>

          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Cost (£)</label>
            <input
              type="number"
              placeholder="950"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>

          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Date</label>
            <input
              type="date"
              className="border border-[#555] p-[10px] w-[300px] rounded"
            />
          </div>

          <div className="flex flex-col my-[20px]">
            <label className="font-medium mb-1">Note</label>
            <textarea
              placeholder="Perishable goods"
              className="border border-[#555] p-[10px] w-[300px] h-[100px] rounded"
            />
          </div>

          <button
            className="
              bg-[#1A2930] text-white 
              p-[12px] w-[300px] rounded-md 
              hover:bg-[#FFA500] hover:text-black 
              font-semibold transition
            "
          >
            Create Shipment
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewShipment;
