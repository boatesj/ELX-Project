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
import NewBooking from "@/pages/customer/NewBooking.jsx";
import EditBooking from "@/pages/customer/EditBooking.jsx";
import RequireCustomerAuth from "@/components/auth/RequireCustomerAuth.jsx";
import ResetPassword from "@/pages/auth/ResetPassword.jsx";
import Unsubscribe from "@/pages/public/Unsubscribe.jsx";
import About from "@/pages/public/About.jsx";
import Institutional from "@/pages/public/Institutional.jsx";
import GhanaDestination from "@/pages/public/Ghana.jsx";
import Terms from "@/pages/public/Terms.jsx";
import Privacy from "@/pages/public/Privacy.jsx";
import Cookies from "@/pages/public/Cookies.jsx";
import ShipmentMap from "@/pages/public/ShipmentMap.jsx";
import Insights from "@/pages/public/Insights.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },

      // Public
      { path: "services", element: <Services /> },
      { path: "services/:id", element: <ServiceDetail /> },
        { path: "institutional", element: <Institutional /> },
        { path: "destinations/ghana", element: <GhanaDestination /> },
        { path: "/about", element: <About /> },
        { path: "terms", element: <Terms /> },
        { path: "privacy", element: <Privacy /> },
        { path: "cookies", element: <Cookies /> },
        { path: "map", element: <ShipmentMap /> },
          { path: "insights", element: <Insights /> },

      // Auth
      { path: "login", element: <CustomerLogin /> },
      { path: "auth/reset-password/:token", element: <ResetPassword /> },
      { path: "unsubscribe", element: <Unsubscribe /> },

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
        path: "newbooking",
        element: (
          <RequireCustomerAuth>
            <NewBooking />
          </RequireCustomerAuth>
        ),
      },
      {
        path: "shipmentedit/:id",
        element: (
          <RequireCustomerAuth>
            <EditBooking />
          </RequireCustomerAuth>
        ),
      },

      // Customer fallbacks (explicit)
      {
        path: "myshipments/*",
        element: (
          <RequireCustomerAuth>
            <NotFound />
          </RequireCustomerAuth>
        ),
      },
      {
        path: "shipmentdetails",
        element: (
          <RequireCustomerAuth>
            <NotFound />
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
