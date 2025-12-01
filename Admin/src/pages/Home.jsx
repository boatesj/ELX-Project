import { HiArrowSmallUp, HiArrowLongDown } from "react-icons/hi2";
import { PieChart } from "@mui/x-charts/PieChart";

const Home = () => {
  return (
    <div className="p-6 bg-[#0F0F0F] min-h-screen">
      {" "}
      {/* SOLID DARK BACKGROUND */}
      {/* TOP METRIC CARDS */}
      <div className="flex items-center gap-6">
        {/* CARD */}
        <div
          className="flex flex-col text-[#E5E5E5] 
            h-[250px] w-[350px] bg-[#1A1A1A] 
            shadow-xl rounded-xl"
        >
          <div className="flex flex-col items-center justify-center mt-[10%]">
            <h1 className="text-[20px] font-semibold">Users</h1>

            <div className="flex items-center mt-[20px] gap-2">
              <HiArrowSmallUp className="text-[28px] text-green-500" />
              <HiArrowLongDown className="text-[28px] text-red-500" />
            </div>

            <span className="mt-[20px] text-[22px] font-bold">200</span>
          </div>
        </div>

        {/* CARD */}
        <div
          className="flex flex-col text-[#E5E5E5] 
            h-[250px] w-[350px] bg-[#1A1A1A] 
            shadow-xl rounded-xl"
        >
          <div className="flex flex-col items-center justify-center mt-[10%]">
            <h1 className="text-[20px] font-semibold">Delivered Shipments</h1>

            <div className="flex items-center mt-[20px] gap-2">
              <HiArrowSmallUp className="text-[28px] text-green-500" />
              <HiArrowLongDown className="text-[28px] text-red-500" />
            </div>

            <span className="mt-[20px] text-[22px] font-bold">2000</span>
          </div>
        </div>

        {/* CARD */}
        <div
          className="flex flex-col text-[#E5E5E5] 
            h-[250px] w-[350px] bg-[#1A1A1A] 
            shadow-xl rounded-xl"
        >
          <div className="flex flex-col items-center justify-center mt-[10%]">
            <h1 className="text-[20px] font-semibold">Pending Shipments</h1>

            <div className="flex items-center mt-[20px] gap-2">
              <HiArrowSmallUp className="text-[28px] text-green-500" />
              <HiArrowLongDown className="text-[28px] text-red-500" />
            </div>

            <span className="mt-[20px] text-[22px] font-bold">100</span>
          </div>
        </div>
      </div>
      {/* PIE CHART + RECENT USERS */}
      <div className="flex items-center justify-between mt-12">
        {/* PIE CHART */}
        <div
          className="h-[450px] w-[500px] text-[#FAFAFA] bg-[#1A1A1A] 
            shadow-xl rounded-xl p-4 flex items-center justify-center"
        >
          <PieChart
            width={400}
            height={300}
            series={[
              {
                data: [
                  { id: 0, value: 10, label: "series A" },
                  { id: 1, value: 15, label: "series B" },
                  { id: 2, value: 20, label: "series C" },
                ],
                innerRadius: 30,
                outerRadius: 100,
                paddingAngle: 5,
                cornerRadius: 5,
                startAngle: -45,
                endAngle: 225,
                cx: 150,
                cy: 150,
              },
            ]}
          />
        </div>

        {/* RECENT USERS */}
        <div
          className="h-[350px] w-[300px] bg-[#1A1A1A] 
            shadow-xl p-[20px] rounded-xl"
        >
          <h2 className="px-[10px] text-[#fff] font-semibold">Recent Users</h2>

          <ol className="flex font-semibold flex-col px-[20px] mt-[10px] text-[#FAFAFA] leading-9">
            <li>1. Mary Sequell</li>
            <li>2. Christina Maybrook</li>
            <li>3. Jacob TwoTimes</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default Home;
