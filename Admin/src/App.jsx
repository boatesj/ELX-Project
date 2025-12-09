import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
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

function App() {
  const Layout = () => {
    return (
      <div>
        <Navbar />
        <div className="flex">
          <div className="w-[20%]">
            <Menu />
          </div>
          <div className="w-[80%]">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    );
  };

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> }, // default route
        { path: "shipments", element: <Shipments /> },
        { path: "newshipment", element: <NewShipment /> },
        { path: "shipments/:shipmentId", element: <Shipment /> },
        { path: "users", element: <Users /> },
        { path: "newuser", element: <NewUser /> },
        { path: "profile", element: <Profile /> },
        { path: "orders", element: <Orders /> },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
