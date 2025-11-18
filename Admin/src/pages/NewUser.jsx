import { useState } from "react";

// Reusable input component
const FormInput = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
}) => (
  <div className="flex flex-col my-[16px]">
    <label className="font-medium mb-1" htmlFor={name}>
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border p-[10px] w-[300px] rounded outline-none ${
        error ? "border-red-500" : "border-[#555]"
      }`}
    />
    {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
  </div>
);

const NewUser = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    address: "",
    userType: "",
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const countries = [
    "United Kingdom",
    "United States",
    "Canada",
    "Ghana",
    "Nigeria",
    "Germany",
    "United Arab Emirates",
    "India",
  ];

  const userTypes = ["Shipper", "Consignee", "Both", "Admin"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error as user types
    setSuccessMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
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

    if (!formData.address.trim()) {
      newErrors.address = "Address is required.";
    }

    if (!formData.userType.trim()) {
      newErrors.userType = "User type is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    // Later this is where you'll POST to the backend API
    console.log("New user data:", formData);

    setSuccessMessage("User created successfully (not yet saved to backend).");
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      country: "",
      address: "",
      userType: "",
    });
  };

  return (
    <div className="m-[30px] bg-white p-[30px] rounded-md shadow-md">
      <h2 className="text-[22px] font-semibold mb-[20px]">New User</h2>

      {successMessage && (
        <div className="mb-4 px-4 py-2 rounded-md bg-green-100 text-green-800 text-sm border border-green-300">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormInput
          label="Full Name"
          name="fullName"
          placeholder="Jerry Antwerp"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />

        <FormInput
          label="Email"
          name="email"
          type="email"
          placeholder="JAntwerp@priority.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />

        <FormInput
          label="Phone Number"
          name="phone"
          placeholder="+44 7123 456 789"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        {/* Country Dropdown */}
        <div className="flex flex-col my-[16px]">
          <label className="font-medium mb-1" htmlFor="country">
            Country
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`border p-[10px] w-[300px] rounded outline-none ${
              errors.country ? "border-red-500" : "border-[#555]"
            }`}
          >
            <option value="">Select a country</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.country && (
            <span className="text-red-500 text-xs mt-1">{errors.country}</span>
          )}
        </div>

        {/* User Type Dropdown */}
        <div className="flex flex-col my-[16px]">
          <label className="font-medium mb-1" htmlFor="userType">
            User Type
          </label>
          <select
            id="userType"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className={`border p-[10px] w-[300px] rounded outline-none ${
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
            <span className="text-red-500 text-xs mt-1">{errors.userType}</span>
          )}
        </div>

        <div className="flex flex-col my-[16px]">
          <label className="font-medium mb-1" htmlFor="address">
            Address
          </label>
          <input
            id="address"
            name="address"
            type="text"
            placeholder="35214 Auroria Avenue, UK"
            value={formData.address}
            onChange={handleChange}
            className={`border p-[10px] w-[300px] rounded outline-none ${
              errors.address ? "border-red-500" : "border-[#555]"
            }`}
          />
          {errors.address && (
            <span className="text-red-500 text-xs mt-1">{errors.address}</span>
          )}
        </div>

        <button
          type="submit"
          className="
            bg-[#1A2930] text-white 
            p-[12px] w-[300px] rounded-md 
            hover:bg-[#FFA500] hover:text-black 
            font-semibold transition
          "
        >
          Create User
        </button>
      </form>
    </div>
  );
};

export default NewUser;
