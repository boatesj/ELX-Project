import { createBrowserRouter, RouterProvider } from "react-router-dom";

import RootLayout from "@/components/layout/RootLayout.jsx";

// Public
import Home from "./pages/Home.jsx"; // keep as-is for now
import NotFound from "./pages/public/NotFound.jsx";
import Services from "./pages/public/Services.jsx";
import ServiceDetail from "./pages/public/ServiceDetail.jsx";

// Auth
import CustomerLogin from "./pages/auth/CustomerLogin.jsx";

// Customer
import MyShipments from "./pages/customer/MyShipments.jsx";
import ShipmentDetails from "./pages/customer/ShipmentDetails.jsx";
import AllShipments from "./pages/customer/AllShipments.jsx";

function App() {
  const router = createBrowserRouter([
    {
      element: <RootLayout />, // Navbar mounted ONCE here
      children: [
        { path: "/", element: <Home /> },
        { path: "/login", element: <CustomerLogin /> },
        { path: "/myshipments", element: <MyShipments /> },
        { path: "/shipmentdetails/:id", element: <ShipmentDetails /> },
        { path: "/allshipments", element: <AllShipments /> },
        { path: "*", element: <NotFound /> },
        { path: "/services", element: <Services /> },
        { path: "/services/:id", element: <ServiceDetail /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
