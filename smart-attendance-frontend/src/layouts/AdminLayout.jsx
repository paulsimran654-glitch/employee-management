import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="app-shell flex h-screen overflow-hidden lg:p-4">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-4">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-4 pb-8 pt-20 lg:px-6 lg:pt-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
