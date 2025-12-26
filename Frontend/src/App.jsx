import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "@/components/layouts/RootLayout.jsx";

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
import RequireCustomerAuth from "@/components/auth/RequireCustomerAuth.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },

      // Public
      { path: "services", element: <Services /> },
      { path: "services/:id", element: <ServiceDetail /> },

      // Auth
      { path: "login", element: <CustomerLogin /> },

      // Customer (protected)
      {
        path: "myshipments",
        element: (
          <RequireCustomerAuth>
            <MyShipments />
          </RequireCustomerAuth>
        ),
      },
      {
        path: "shipmentdetails/:id",
        element: (
          <RequireCustomerAuth>
            <ShipmentDetails />
          </RequireCustomerAuth>
        ),
      },
      {
        path: "allshipments",
        element: (
          <RequireCustomerAuth>
            <AllShipments />
          </RequireCustomerAuth>
        ),
      },

      // 404 (last)
      { path: "*", element: <NotFound /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
