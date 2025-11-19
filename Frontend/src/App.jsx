import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Myshipments from "./pages/Myshipments";
import ShipmentDetails from "./pages/ShipmentDetails";
import Shipments from "./pages/Shipments";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/myshipments",
      element: <Myshipments />,
    },
    {
      path: "/shipmentdetails/:id",
      element: <ShipmentDetails />,
    },
    {
      path: "/allshipments",
      element: <Shipments />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
