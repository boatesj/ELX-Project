import Footer from "../components/Footer";

const Login = () => {
  return (
    <div>
      <div className="h-[80vh] flex items-center justify-evenly p-[50px] text-gray-300">
        {/* LEFT SIDE */}
        <div>
          <h2 className="text-[#d9d9d9] font-semibold text-[35px]">
            Ellcworth Express Ltd
          </h2>
          <img src="../welcome_email.png" alt="Welcome" className="mt-4" />
        </div>

        {/* RIGHT SIDE - LOGIN BOX */}
        <div className="h-[450px] w-[450px] bg-[#FFA500] m-[20px] mt-[80px] rounded-md flex flex-col items-center justify-center">
          {/* Email */}
          <input
            type="text"
            className="bg-[#edecec] p-[15px] w-[350px] rounded mb-[20px] outline-none"
            placeholder="Enter Your Email"
          />

          {/* Password */}
          <input
            type="password"
            className="bg-[#edecec] p-[15px] w-[350px] rounded mb-[30px] outline-none"
            placeholder="Enter Your Password"
          />

          {/* Button */}
          <button
            type="submit"
            className="
        bg-[#1A2930] text-white 
        p-[12px] w-[200px] rounded-md 
        hover:bg-[#edecec] hover:text-black 
        font-semibold transition
      "
          >
            Login
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
