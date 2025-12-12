// Admin/src/App.jsx
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import Shipments from "./pages/Shipments";
import Shipment from "./pages/Shipment";
import Navbar from "./components/Navbar";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import Users from "./pages/Users";
import NewUser from "./pages/NewUser";
import Login from "./pages/Login";
import NewShipment from "./pages/NewShipment";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import UserDetails from "./pages/UserDetails";
import EditUser from "./pages/EditUser";

// NEW: elements / master-data pages
import Elements from "./pages/Elements";
import Ports from "./pages/Ports";
import ServiceTypes from "./pages/ServiceTypes";
import CargoCategories from "./pages/CargoCategories";

// Layout wrapper for all authenticated/admin pages
function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar now needs a burger button on mobile */}
      <Navbar onMenuClick={openMenu} />

      <div className="flex flex-1 w-full">
        {/* Desktop sidebar (lg+) */}
        <aside className="hidden lg:block lg:w-[280px] xl:w-[320px] border-r border-slate-200 bg-white">
          <Menu />
        </aside>

        {/* Mobile drawer */}
        {isMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* overlay */}
            <button
              aria-label="Close menu overlay"
              onClick={closeMenu}
              className="absolute inset-0 bg-black/40"
            />
            {/* drawer */}
            <div className="relative h-full w-[85%] max-w-[320px] bg-white shadow-xl border-r border-slate-200">
              <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200">
                <div className="text-sm font-semibold tracking-wide text-slate-900">
                  Ellcworth Admin
                </div>
                <button
                  onClick={closeMenu}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              {/* Make menu links close the drawer */}
              <div className="p-2">
                <Menu onNavigate={closeMenu} />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* consistent mobile padding + max width for “corporate” feel */}
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },

      { path: "shipments", element: <Shipments /> },
      { path: "newshipment", element: <NewShipment /> },
      { path: "shipments/:shipmentId", element: <Shipment /> },

      { path: "users", element: <Users /> },
      { path: "newuser", element: <NewUser /> },
      { path: "users/:id", element: <UserDetails /> },
      { path: "users/:id/edit", element: <EditUser /> },

      { path: "profile", element: <Profile /> },
      { path: "orders", element: <Orders /> },

      { path: "elements", element: <Elements /> },
      { path: "elements/ports", element: <Ports /> },
      { path: "elements/service-types", element: <ServiceTypes /> },
      { path: "elements/cargo-categories", element: <CargoCategories /> },
    ],
  },
  { path: "/login", element: <Login /> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
