import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaShip, FaTruck, FaUserShield } from "react-icons/fa";
import { rootRequest } from "../requestMethods";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read ?redirect=/users if present, else default to /shipments
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/shipments";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await rootRequest.post("/auth/login", {
        email,
        password,
      });

      // Keep existing behaviour
      if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data?._id,
          fullname: data?.fullname,
          email: data?.email,
          role: data?.role,
          status: data?.status,
        })
      );

      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong logging in.";
      console.error("Admin login error:", err);
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080c] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-stretch">
        {/* Left: Brand / Mogul side */}
        <div className="hidden md:flex flex-col justify-between rounded-2xl border border-[#1f2937] bg-gradient-to-b from-[#101820] via-[#0b1118] to-[#05080c] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.65)]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/Logo_elx.png"
                alt="Ellcworth Express"
                className="h-10 w-auto"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] tracking-[0.28em] uppercase text-gray-400">
                  Ellcworth
                </span>
                <span className="text-sm font-semibold tracking-[0.16em] text-white">
                  EXPRESS <span className="text-[#FFA500]">ADMIN</span>
                </span>
              </div>
            </div>

            <h1 className="text-2xl lg:text-3xl font-semibold mb-3">
              Your global <span className="text-[#FFA500]">control tower</span>.
            </h1>
            <p className="text-sm text-gray-300 mb-6 leading-relaxed">
              Sign in to oversee shipments, customers, and performance in one
              place. Clear visibility, confident decisions, and calm operations
              across every lane.
            </p>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] border border-[#FFA500]/40">
                  <FaShip className="text-[#FFA500] text-sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-100">
                    Executive shipment oversight
                  </p>
                  <p className="text-gray-400">
                    Track RoRo, containers and air freight without digging
                    through emails or spreadsheets.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] border border-[#10b981]/40">
                  <FaTruck className="text-[#10b981] text-sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-100">
                    Customer & partner clarity
                  </p>
                  <p className="text-gray-400">
                    Keep shippers and consignees aligned with status that&apos;s
                    always up to date.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] border border-[#60a5fa]/40">
                  <FaUserShield className="text-[#60a5fa] text-sm" />
                </div>
                <div>
                  <p className="font-medium text-gray-100">
                    Secure admin workspace
                  </p>
                  <p className="text-gray-400">
                    JWT-secured access so only authorised team members can see
                    and act on sensitive data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Ellcworth Express · UK — Africa Trade Lanes
          </p>
        </div>

        {/* Right: Login card */}
        <div className="flex items-center justify-center">
          <div className="w-full rounded-2xl bg-[#0b1016] border border-[#1f2937] shadow-[0_24px_70px_rgba(0,0,0,0.75)] p-8">
            {/* Mobile logo / brand header */}
            <div className="flex items-center justify-between mb-6 md:mb-8 md:hidden">
              <div className="flex items-center gap-3">
                <img
                  src="/Logo_elx.png"
                  alt="Ellcworth Express"
                  className="h-9 w-auto"
                />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] tracking-[0.28em] uppercase text-gray-400">
                    Ellcworth
                  </span>
                  <span className="text-sm font-semibold tracking-[0.16em] text-white">
                    EXPRESS <span className="text-[#FFA500]">ADMIN</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1">
                Sign in to your admin hub
              </h2>
              <p className="text-xs text-gray-400">
                Use your Ellcworth admin credentials to continue.
              </p>
              {redirectTo && redirectTo !== "/shipments" && (
                <p className="mt-2 text-[11px] text-gray-500">
                  You&apos;ll be redirected to{" "}
                  <span className="text-[#FFA500] font-medium">
                    {redirectTo}
                  </span>{" "}
                  after login.
                </p>
              )}
            </div>

            {error && (
              <div className="mb-4 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label
                  className="mb-1 text-xs font-medium text-gray-200"
                  htmlFor="email"
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  className="p-2.5 rounded-md border border-[#374151] bg-[#05080c] text-white text-sm outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500]"
                  placeholder="admin@ellcworth.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label
                  className="mb-1 text-xs font-medium text-gray-200"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="p-2.5 rounded-md border border-[#374151] bg-[#05080c] text-white text-sm outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500]"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full mt-2
                  bg-[#FFA500] text-[#1A2930]
                  py-2.5 rounded-md text-sm font-semibold
                  hover:bg-[#ffb733] hover:shadow-[0_0_0_1px_rgba(0,0,0,0.4)]
                  transition
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 border-t border-[#1f2937] pt-4">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                This admin area is reserved for authorised Ellcworth personnel.
                Every action is logged to keep your shipments, documents, and
                client data protected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
