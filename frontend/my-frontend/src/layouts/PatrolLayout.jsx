import { Outlet } from "react-router-dom";

const PatrolLayout = () => {
    return (
        <div>
            <h2>Patrol Layout</h2>
            <Outlet />
        </div>
    );
};

export default PatrolLayout;