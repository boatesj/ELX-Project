import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNames } from "country-list";

// Pre-compute global country list (all ISO countries, sorted)
const COUNTRY_OPTIONS = getNames().sort();

// Reusable input component (mobile-first: full width)
const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-700" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border px-3 py-2 rounded outline-none text-sm w-full bg-white ${
        error ? "border-red-500" : "border-[#555]"
      }`}
    />
    {error && <span className="text-red-500 text-xs">{error}</span>}
  </div>
);

// Simple section wrapper (accordion)
const Section = ({ title, subtitle, open, onToggle, children }) => (
  <div className="bg-white rounded-md shadow-sm border border-slate-100">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left"
    >
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          {title}
        </h3>
        {subtitle ? (
          <p className="text-[11px] text-gray-500 mt-1">{subtitle}</p>
        ) : null}
      </div>
      <span className="text-xs font-semibold text-[#1A2930]">
        {open ? "Hide" : "Show"}
      </span>
    </button>

    {open ? <div className="px-4 pb-4">{children}</div> : null}
  </div>
);

// Backend base + users endpoint (matches app.use("/users", userRoute);)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const USERS_API = `${API_BASE_URL}/users`;

const NewUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountType: "Business", // default
    fullName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    postcode: "",
    address: "",
    userType: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile section toggles
  const [openAccount, setOpenAccount] = useState(true);
  const [openAddress, setOpenAddress] = useState(true);
  const [openRole, setOpenRole] = useState(true);

  const userTypes = ["Shipper", "Consignee", "Both", "Admin"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
    setSubmitError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.accountType.trim()) {
      newErrors.accountType = "Account type is required.";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name / company is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (formData.phone.trim().length < 7) {
      newErrors.phone = "Phone number looks too short.";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City / town is required.";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Street address is required.";
    }

    if (!formData.userType.trim()) {
      newErrors.userType = "User type is required.";
    }

    setErrors(newErrors);

    // If there are errors, open the likely sections so the user can see them
    if (Object.keys(newErrors).length) {
      if (
        newErrors.accountType ||
        newErrors.fullName ||
        newErrors.email ||
        newErrors.phone
      )
        setOpenAccount(true);
      if (
        newErrors.country ||
        newErrors.city ||
        newErrors.postcode ||
        newErrors.address
      )
        setOpenAddress(true);
      if (newErrors.userType) setOpenRole(true);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    // Payload shape – you may need to extend your User schema to store
    // accountType, city, postcode, notes.
    const payload = {
      accountType: formData.accountType, // "Business" / "Individual"
      fullname: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      postcode: formData.postcode,
      address: formData.address,
      role: formData.userType, // "Shipper" / "Consignee" / "Both" / "Admin"
      notes: formData.notes,
      status: "pending", // or "active" as needed
    };

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setSubmitError("Please log in before creating a user.");
        navigate(`/login?redirect=/newuser`);
        return;
      }

      const res = await fetch(USERS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create user");
      }

      setSuccessMessage("User created successfully.");
      setFormData({
        accountType: "Business",
        fullName: "",
        email: "",
        phone: "",
        country: "",
        city: "",
        postcode: "",
        address: "",
        userType: "",
        notes: "",
      });

      setTimeout(() => {
        navigate("/users");
      }, 700);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong creating the user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#D9D9D9] rounded-md p-3 sm:p-5 lg:p-[30px] shadow-sm">
      <div className="mb-4">
        <h2 className="text-[20px] sm:text-[22px] font-semibold text-[#1A2930]">
          New Customer / User
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Capture key account details once so you can reuse them across quotes,
          bookings and secure documents.
        </p>
      </div>

      {successMessage && (
        <div className="mb-4 px-4 py-2 rounded-md bg-green-100 text-green-800 text-sm border border-green-300">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="mb-4 px-4 py-2 rounded-md bg-red-100 text-red-800 text-sm border border-red-300">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 lg:gap-6">
          {/* LEFT: main form sections */}
          <div className="space-y-4">
            <Section
              title="Account"
              subtitle="Core identity and contact details."
              open={openAccount}
              onToggle={() => setOpenAccount((v) => !v)}
            >
              {/* Account Type */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-semibold text-gray-700"
                  htmlFor="accountType"
                >
                  Account Type
                </label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className={`border px-3 py-2 rounded outline-none text-sm w-full bg-white ${
                    errors.accountType ? "border-red-500" : "border-[#555]"
                  }`}
                >
                  <option value="Business">Business</option>
                  <option value="Individual">Individual</option>
                </select>
                {errors.accountType && (
                  <span className="text-red-500 text-xs">
                    {errors.accountType}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name / Company */}
                <FormInput
                  label={
                    formData.accountType === "Business"
                      ? "Company Name / Contact"
                      : "Full Name"
                  }
                  name="fullName"
                  placeholder={
                    formData.accountType === "Business"
                      ? "OceanGate Logistics Ltd"
                      : "Kofi Mensah"
                  }
                  value={formData.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                />

                {/* Email */}
                <FormInput
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="ops@oceangate.co.uk"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                />

                {/* Phone */}
                <FormInput
                  label="Phone Number"
                  name="phone"
                  placeholder="+44 20 8801 9900"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                />
              </div>
            </Section>

            <Section
              title="Address"
              subtitle="Where the customer is based."
              open={openAddress}
              onToggle={() => setOpenAddress((v) => !v)}
            >
              {/* Country */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-semibold text-gray-700"
                  htmlFor="country"
                >
                  Country
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`border px-3 py-2 rounded outline-none text-sm w-full bg-white ${
                    errors.country ? "border-red-500" : "border-[#555]"
                  }`}
                >
                  <option value="">Select a country</option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <span className="text-red-500 text-xs">{errors.country}</span>
                )}
              </div>

              {/* City + Postcode */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="City / Town"
                  name="city"
                  placeholder="Accra"
                  value={formData.city}
                  onChange={handleChange}
                  error={errors.city}
                />

                <FormInput
                  label="Postcode / ZIP (optional)"
                  name="postcode"
                  placeholder="EC1A 1BB"
                  value={formData.postcode}
                  onChange={handleChange}
                  error={errors.postcode}
                />
              </div>

              {/* Street Address */}
              <div className="mt-4 flex flex-col gap-1">
                <label
                  className="text-xs font-semibold text-gray-700"
                  htmlFor="address"
                >
                  Street Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="35214 Auroria Avenue"
                  value={formData.address}
                  onChange={handleChange}
                  className={`border px-3 py-2 rounded outline-none text-sm w-full bg-white ${
                    errors.address ? "border-red-500" : "border-[#555]"
                  }`}
                />
                {errors.address && (
                  <span className="text-red-500 text-xs">{errors.address}</span>
                )}
              </div>
            </Section>

            <Section
              title="Role & notes"
              subtitle="How they use Ellcworth, and any internal guidance."
              open={openRole}
              onToggle={() => setOpenRole((v) => !v)}
            >
              {/* User Type */}
              <div className="flex flex-col gap-1">
                <label
                  className="text-xs font-semibold text-gray-700"
                  htmlFor="userType"
                >
                  User Type
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className={`border px-3 py-2 rounded outline-none text-sm w-full bg-white ${
                    errors.userType ? "border-red-500" : "border-[#555]"
                  }`}
                >
                  <option value="">Select a user type</option>
                  {userTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.userType && (
                  <span className="text-red-500 text-xs">
                    {errors.userType}
                  </span>
                )}
              </div>

              {/* Internal notes */}
              <div className="mt-4 flex flex-col gap-1">
                <label
                  className="text-xs font-semibold text-gray-700"
                  htmlFor="notes"
                >
                  Internal Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="e.g. University client – needs 2 weeks’ notice, prefers WhatsApp updates."
                  value={formData.notes}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded outline-none border-[#555] text-sm resize-none w-full h-[110px] bg-white"
                />
              </div>
            </Section>
          </div>

          {/* RIGHT: desktop helper + desktop submit */}
          <div className="space-y-4">
            <div className="hidden lg:block bg-white rounded-md p-4 border border-slate-100">
              <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                Tip
              </h4>
              <p className="text-[11px] text-gray-600 mt-2">
                Save clean contact details once — then reuse the customer on
                quotes, shipments, documents, and invoices.
              </p>
            </div>

            <div className="hidden lg:block">
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full
                  bg-[#1A2930] text-white
                  py-3 rounded-md
                  hover:bg-[#FFA500] hover:text-black
                  font-semibold transition
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile sticky CTA */}
        <div className="lg:hidden sticky bottom-0 left-0 right-0 pb-3">
          <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-md p-3 shadow-lg">
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full
                bg-[#1A2930] text-white
                py-3 rounded-md
                hover:bg-[#FFA500] hover:text-black
                font-semibold transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
            <p className="mt-2 text-[10px] text-gray-600">
              Creates the user and returns you to the Users table.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewUser;
