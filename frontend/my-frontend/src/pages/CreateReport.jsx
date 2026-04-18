import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

const CreateReport = () => {
    const [formData, setFormData] = useState({
        description: "",
        incidentType: "",
        location: {
            address: "",
        },
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "address") {
            setFormData({
                ...formData,
                location: { ...formData.location, address: value },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            await axiosInstance.post("/reports", formData);

            setMessage("Report submitted successfully!");

            // Reset form
            setFormData({
                description: "",
                incidentType: "",
                location: { address: "" },
            });
        } catch (error) {
            console.error(error);
            setMessage("Error submitting report");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Create Report</h2>

            <form onSubmit={handleSubmit}>
                {/* Description */}
                <div>
                    <label>Description:</label><br />
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Incident Type */}
                <div>
                    <label>Incident Type:</label><br />
                    <input
                        type="text"
                        name="incidentType"
                        value={formData.incidentType}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Location */}
                <div>
                    <label>Location:</label><br />
                    <input
                        type="text"
                        name="address"
                        value={formData.location.address}
                        onChange={handleChange}
                        placeholder="Enter location"
                    />
                </div>

                {/* Submit */}
                <div style={{ marginTop: "10px" }}>
                    <button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit Report"}
                    </button>
                </div>
            </form>

            {/* Message */}
            {message && <p>{message}</p>}
        </div>
    );
};

export default CreateReport;