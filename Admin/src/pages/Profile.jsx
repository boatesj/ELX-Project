import { useEffect, useState } from "react";
import { HiUserCircle, HiLockClosed } from "react-icons/hi2";
import { rootRequest } from "../requestMethods";

const Profile = () => {
  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    postcode: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        // ✅ Token is attached by rootRequest interceptors
        const res = await rootRequest.get("/auth/me");

        const data = res?.data;

        if (!data?.ok) {
          setErrorMessage(data?.message || "Failed to load profile.");
          setLoading(false);
          return;
        }

        setProfile((prev) => ({ ...prev, ...(data?.data || {}) }));
      } catch (err) {
        console.error("Profile fetch error:", err);
        setErrorMessage(
          err?.response?.data?.message || "Failed to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaveMessage("");
    setErrorMessage("");

    try {
      // ✅ Token is attached by rootRequest interceptors
      const res = await rootRequest.patch("/auth/me", profile);

      const data = res?.data;

      if (!data?.ok) {
        setErrorMessage(data?.message || "Failed to update profile.");
        return;
      }

      setSaveMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setErrorMessage(
        err?.response?.data?.message || "Failed to update profile.",
      );
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSaveMessage("");
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    try {
      // ✅ Token is attached by rootRequest interceptors
      const res = await rootRequest.patch("/auth/me/password", {
        currentPassword,
        newPassword,
      });

      const data = res?.data;

      if (!data?.ok) {
        setErrorMessage(data?.message || "Failed to update password.");
        return;
      }

      setSaveMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password update error:", err);
      setErrorMessage(
        err?.response?.data?.message || "Failed to update password.",
      );
    }
  };

  return (
    <div className="p-8 bg-[#0F0F0F] min-h-screen text-white">
      <h1 className="text-2xl font-semibold mb-2">My Profile</h1>
      <p className="text-gray-400 mb-6">
        Manage your personal and administrative account details.
      </p>

      {errorMessage && (
        <div className="mb-4 bg-red-600/20 text-red-300 px-4 py-2 rounded-md border border-red-600">
          {errorMessage}
        </div>
      )}
      {saveMessage && (
        <div className="mb-4 bg-emerald-600/20 text-emerald-300 px-4 py-2 rounded-md border border-emerald-600">
          {saveMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <HiUserCircle className="text-3xl text-[#FFA500]" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <form className="space-y-4" onSubmit={handleProfileSave}>
              <div>
                <label className="text-sm text-gray-300">Full Name</label>
                <input
                  className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                  value={profile.fullname}
                  onChange={(e) =>
                    setProfile({ ...profile, fullname: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-300">Email</label>
                <input
                  className="w-full mt-1 p-2 rounded bg-gray-800 text-gray-400 cursor-not-allowed"
                  value={profile.email}
                  disabled
                />
              </div>

              <div>
                <label className="text-sm text-gray-300">Phone</label>
                <input
                  className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Country</label>
                  <input
                    className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                    value={profile.country}
                    onChange={(e) =>
                      setProfile({ ...profile, country: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">City</label>
                  <input
                    className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                    value={profile.city}
                    onChange={(e) =>
                      setProfile({ ...profile, city: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-300">Postcode</label>
                  <input
                    className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                    value={profile.postcode}
                    onChange={(e) =>
                      setProfile({ ...profile, postcode: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300">Address</label>
                  <input
                    className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                    value={profile.address}
                    onChange={(e) =>
                      setProfile({ ...profile, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 w-full bg-[#FFA500] text-[#1A1A1A] py-2 rounded-md font-semibold hover:bg-[#ffb733] transition"
              >
                Save Changes
              </button>
            </form>
          )}
        </div>

        <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <HiLockClosed className="text-3xl text-[#FFA500]" />
            <h2 className="text-xl font-semibold">Change Password</h2>
          </div>

          <form className="space-y-4" onSubmit={handlePasswordSave}>
            <div>
              <label className="text-sm text-gray-300">Current Password</label>
              <input
                type="password"
                className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">New Password</label>
              <input
                type="password"
                className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full mt-1 p-2 rounded bg-[#0F0F0F] border border-gray-700 text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFA500] text-[#1A1A1A] py-2 rounded-md font-semibold hover:bg-[#ffb733] transition"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
