import { useEffect, useState } from "react";
import { getMasterDetails, getWorkList } from "../../api/api";
import AssignModal from "./AssignModal";

export default function TaskList() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch project list on page load
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await getMasterDetails(1, 4);
        setProjects(res.data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, []);

  // Handle Search
  const handleSearch = async () => {
    if (!selectedProject) {
      alert("Please select a project");
      return;
    }

    setLoading(true);

    try {
      const res = await getWorkList({ projectId: selectedProject });
      setTasks(res || []);
    } catch (err) {
      console.error("Error fetching work list:", err);
      alert("Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Task List</h3>
      </div>

      {/* FILTER ROW */}
      <div className="card p-3 mb-4">
        <div className="row align-items-end">

          {/* Project Dropdown */}
          <div className="col-md-4">
            <label className="form-label">Project</label>
            <select
              className="form-select"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.intId} value={p.intId}>
                  {p.varName}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="col-md-2">
            <button className="viewpro-btn3 w-100" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* LOADER */}
      {loading && <p>Loading tasks...</p>}

      {/* EMPTY STATE */}
      {!loading && tasks.length === 0 && (
        <p className="text-muted">No tasks found. Please search.</p>
      )}

      {/* TASK TABLE */}
      {!loading && tasks.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Short Description</th>
                <th>Module</th>
                <th>Work Type</th>
                <th>Platform</th>
                <th>Priority</th>
                <th>Created Date</th>
                <th>Assign</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.workId}>
                  <td>{index + 1}</td>
                  <td>{task.shortDescription}</td>
                  <td>{task.moduleName}</td>
                  <td>{task.workTypeName}</td>
                  <td>{task.platformName}</td>
                  <td>{task.priorityName}</td>
                  <td>{task.createdDate}</td>

                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowAssignModal(true);
                      }}
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {showAssignModal && (
        <AssignModal
          task={selectedTask}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            handleSearch(); // refresh task list
          }}
        />
      )}
    </div>
  );
}
