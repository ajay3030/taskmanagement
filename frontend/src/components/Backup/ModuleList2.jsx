// src/components/module/ModuleList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ModuleList() {
  const navigate = useNavigate();

  const [masterTypes, setMasterTypes] = useState([]);
  const [projectMasterTypeId, setProjectMasterTypeId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [modules, setModules] = useState([]);

  // Load master types once and resolve project masterType id
  useEffect(() => {
    fetch("http://localhost:4000/api/master/get-master-types")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setMasterTypes(d.data || []);
          const proj = (d.data || []).find((m) => m.varName === "project");
          if (proj) setProjectMasterTypeId(proj.intId);
        }
      })
      .catch((err) => console.error("Master types load error:", err));
  }, []);

  // When projectMasterTypeId available, load projects (master-details)
  useEffect(() => {
    if (!projectMasterTypeId) return;
    // API you use for master-details:
    fetch(`http://localhost:4000/api/master/get-master-details?typeId=1&masterId=${projectMasterTypeId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProjects(d.data || []);
      })
      .catch((err) => console.error("Projects load error:", err));
  }, [projectMasterTypeId]);

  // Load modules list for selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setModules([]);
      return;
    }

    fetch(`http://localhost:4000/api/module/get-modules?projectId=${selectedProjectId}&mode=list`)
      .then((r) => r.json())
      .then((d) => {
        // expecting flat array
        setModules(Array.isArray(d) ? d : d.data || []);
      })
      .catch((err) => {
        console.error("Modules load error:", err);
        setModules([]);
      });
  }, [selectedProjectId]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Modules</h3>
        <div>
          <button className="viewpro-btn3 me-2" onClick={() => navigate("/")}>
            Home Page
          </button>
          <button className="viewpro-btn3 me-2" onClick={() => navigate("/module-add")}>
            Add Module
          </button>
          <button
            className="viewpro-btn3"
            onClick={() => {
              if (!selectedProjectId) return alert("Select a project to view tree.");
              navigate(`/module-tree?projectId=${selectedProjectId}`);
            }}
          >
            View Tree
          </button>
        </div>
      </div>

      <div className="card custom-card bd mb-3">
        <div className="card-body">
          <div className="row align-items-end">
            <div className="col-md-6 mb-2">
              <label className="form-label">Project</label>
              <select
                className="form-select"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                <option value="">-- Select Project --</option>
                {projects.map((p) => (
                  <option key={p.intId} value={p.intId}>
                    {p.varName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card custom-card bd">
        <div className="card-header">
          <h5 className="mb-0">Module List</h5>
        </div>

        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Module Name</th>
                <th>Parent ID</th>
                <th>NodeType</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No modules to display</td>
                </tr>
              ) : (
                modules.map((m) => (
                  <tr key={m.intId}>
                    <td>{m.intId}</td>
                    <td>{m.varModuleName ?? m.varName ?? m.name}</td>
                    <td>{m.intParentId ?? "-"}</td>
                    <td>{m.intNodeType ?? "-"}</td>
                    <td>
                      <button
                        className="viewpro-btn3"
                        onClick={() => {
                          // on view details we'll navigate to tree anchored to this module or open modal (simple approach: navigate to tree)
                          if (!selectedProjectId) {
                            alert("Select a project first");
                            return;
                          }
                          navigate(`/module-tree?projectId=${selectedProjectId}&focusId=${m.intId}`);
                        }}
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
    </div>
  );
}
