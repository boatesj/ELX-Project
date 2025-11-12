import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";
import Home from "./pages/Home";
import Shipments from "./pages/Shipments";
import Shipment from "./pages/Shipment";
import Navbar from "./components/Navbar";
import Menu from "./components/Menu";
import Footer from "./components/Footer";
import Users from "./pages/Users";

function App() {

  const Layout = () => {

    return(
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
    )
  }

  const router = createBrowserRouter([
    {path:"/",
      element:<Layout />,
      children:[
        {path:"/",
          element:<Home />
        },
        {path:"/shipments",
          element:<Shipments />
        },
        {path:"/shipment/:shipmentId",
          element:<Shipment />
        },
        {path:"/users",
          element:<Users />
        }
      ]
    },
    
  ])
  return <>
  <RouterProvider router={router} />
  
  </>;
}

export default App;
