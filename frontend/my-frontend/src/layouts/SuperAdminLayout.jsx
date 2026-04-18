import { Outlet } from "react-router-dom";

const SuperAdminLayout = () => {
    return (
        <div>
            <h2>Super Admin Layout</h2>
            <Outlet />
        </div>
    );
};

export default SuperAdminLayout;