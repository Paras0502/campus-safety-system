import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const MyReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReports = async () => {
        try {
            const res = await axiosInstance.get("/reports/my");
            setReports(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    if (loading) return <p>Loading reports...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h2>My Reports</h2>

            {reports.length === 0 ? (
                <p>No reports found.</p>
            ) : (
                <ul>
                    {reports.map((report) => (
                        <li key={report._id} style={{ marginBottom: "15px" }}>
                            <strong>Type:</strong> {report.incidentType} <br />
                            <strong>Description:</strong> {report.description} <br />
                            <strong>Location:</strong> {report.location?.address || "N/A"} <br />
                            <strong>Status:</strong> {report.status} <br />
                            <small>
                                Created At:{" "}
                                {new Date(report.createdAt).toLocaleString()}
                            </small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default MyReports;