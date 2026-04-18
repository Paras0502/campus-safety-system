import { Outlet } from "react-router-dom";

const StudentLayout = () => {
    return (
        <div>
            <h2>Student Layout</h2>
            <Outlet />
        </div>
    );
};

export default StudentLayout;