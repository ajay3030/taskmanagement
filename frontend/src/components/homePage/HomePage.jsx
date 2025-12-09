import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMasterTypes, getMasterDetailsById } from "../../api/api"

export default function HomePage() {
  const navigate = useNavigate();

  const [masterTypes, setMasterTypes] = useState([]);
  const [details, setDetails] = useState([]);
  const [selectedMasterName, setSelectedMasterName] = useState("");

  // Fetch Master Types when page loads
useEffect(() => {
  getMasterTypes()
    .then(({ success, data }) => {
      if (success) setMasterTypes(data);
    })
    .catch((err) => console.error("Error fetching master types:", err));
}, []);

const handleViewDetails = async (masterId, masterName) => {
  setSelectedMasterName(masterName);
  try {
    const { success, data } = await getMasterDetailsById(masterId);
    if (success) {
      setDetails(data);
    } else {
      alert("No details found");
    }
  } catch (err) {
    console.error("Error fetching details:", err);
  }
};

  return (
    <div className="container mt-4">

      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="m-0">Master Types</h3>

        <div>
          {/* <button
            className="viewpro-btn3 me-2"
            onClick={() => navigate("/task-list")}
          >
            Task list
          </button> */}
          <button
            className="viewpro-btn3 me-2"
            onClick={() => navigate("/module-list")}
          >
            Module list
          </button>

          <button
            className="viewpro-btn3 me-2"
            onClick={() => navigate("/master-type")}
          >
            Add Master Type
          </button>

          <button
            className="viewpro-btn3"
            onClick={() => navigate("/master-detail")}
          >
            Add Master Detail
          </button>
        </div>
      </div>

      {/* Master Types Table */}
      <div className="card custom-card bd mb-4">
        <div className="card-header">
          <h5 className="mb-0">List of Master Types</h5>
        </div>

        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Active</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {masterTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No master types found</td>
                </tr>
              ) : (
                masterTypes.map((m) => (
                  <tr key={m.intId}>
                    <td>{m.intId}</td>
                    <td>{m.varName}</td>
                    <td>{m.intActive === 1 ? "Active" : "Inactive"}</td>
                    <td>{m.dttCreationDate?.substring(0, 10)}</td>
                    <td>
                      <button
                        className="viewpro-btn3"
                        onClick={() => handleViewDetails(m.intId, m.varName)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Table (only visible after clicking view) */}
      {details.length > 0 && (
        <div className="card custom-card bd">
          <div className="card-header">
            <h5 className="mb-0">Details for: {selectedMasterName}</h5>
          </div>

          <div className="card-body">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Detail Name</th>
                  <th>Active</th>
                  <th>Created Date</th>
                </tr>
              </thead>

              <tbody>
                {details.map((d) => (
                  <tr key={d.intId}>
                    <td>{d.intId}</td>
                    <td>{d.varName}</td>
                    <td>{d.intActive === 1 ? "Active" : "Inactive"}</td>
                    <td>{d.dttCreationDate?.substring(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
