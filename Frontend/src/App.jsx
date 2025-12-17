import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "@/components/layout/RootLayout.jsx";

// Pages
import Home from "@/pages/Home.jsx";
import NotFound from "@/pages/public/NotFound.jsx";
import Services from "@/pages/public/Services.jsx";
import ServiceDetail from "@/pages/public/ServiceDetail.jsx";
import CustomerLogin from "@/pages/auth/CustomerLogin.jsx";

// Customer
import MyShipments from "@/pages/customer/MyShipments.jsx";
import ShipmentDetails from "@/pages/customer/ShipmentDetails.jsx";
import AllShipments from "@/pages/customer/AllShipments.jsx";

const router = createBrowserRouter([
  {
    path: "/", // ✅ parent must be anchored
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> }, // ✅ "/" renders Home reliably

      // Public
      { path: "services", element: <Services /> },
      { path: "services/:id", element: <ServiceDetail /> },

      // Auth
      { path: "login", element: <CustomerLogin /> },

      // Customer (we'll protect later)
      { path: "myshipments", element: <MyShipments /> },
      { path: "shipmentdetails/:id", element: <ShipmentDetails /> },
      { path: "allshipments", element: <AllShipments /> },

      // 404 (last)
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
