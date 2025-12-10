// src/components/module/ModuleList.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMasterTypes,
  getMasterDetailsById,
  getModuleSummary,
  deleteModule,
} from "../../api/api";

import AddModuleModal from "./AddModuleModal";
import CreateTaskModal from "./CreateTaskModal";

export default function ModuleList() {
  const navigate = useNavigate();

  // project + master states
  const [masterTypes, setMasterTypes] = useState([]);
  const [projectMasterTypeId, setProjectMasterTypeId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // module summary
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // tree UI controls
  const [expandedIds, setExpandedIds] = useState(new Set());

  // modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addParentId, setAddParentId] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignModuleId, setAssignModuleId] = useState(null);

  // ---------------------------------------------------------
  // 1. Load Master Types → extract project masterTypeId
  // ---------------------------------------------------------
  useEffect(() => {
    const loadMasterTypes = async () => {
      try {
        const res = await getMasterTypes();
        if (res.success) {
          setMasterTypes(res.data || []);
          const projectType = res.data.find(
            (m) => m.varName.toLowerCase() === "project"
          );
          if (projectType) setProjectMasterTypeId(projectType.intId);
        } else setMasterTypes([]);
      } catch (err) {
        console.error("Master types load error:", err);
        setMasterTypes([]);
      }
    };

    loadMasterTypes();
  }, []);

  // ---------------------------------------------------------
  // 2. Load project list from masterdetails
  // ---------------------------------------------------------
  useEffect(() => {
    if (!projectMasterTypeId) return;

    const loadProjects = async () => {
      try {
        const res = await getMasterDetailsById(projectMasterTypeId);
        if (res.success) setProjects(res.data || []);
        else setProjects([]);
      } catch (err) {
        console.error("Projects load error:", err);
        setProjects([]);
      }
    };

    loadProjects();
  }, [projectMasterTypeId]);

  // ---------------------------------------------------------
  // 3. Load module summary for selected project
  // ---------------------------------------------------------
  const loadSummary = async (projectId) => {
    setLoading(true);
    setError(null);

    try {
      const res = await getModuleSummary(projectId);
      if (res.success) {
        setModules(Array.isArray(res.data) ? res.data : []);
      } else {
        setModules([]);
        setError("Failed to load modules");
      }
    } catch (err) {
      console.error("Module summary error:", err);
      setModules([]);
      setError("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedProjectId) {
      setModules([]);
      return;
    }
    loadSummary(selectedProjectId);
  }, [selectedProjectId]);

  // Refresh after modal success
  const refreshModules = () => {
    if (selectedProjectId) loadSummary(selectedProjectId);
  };

  // ---------------------------------------------------------
  // Build tree structure from flat summary API
  // ---------------------------------------------------------
  const treeRoots = useMemo(() => {
    const map = new Map();
    const roots = [];

    modules.forEach((m) => map.set(m.moduleId, { ...m, children: [] }));

    map.forEach((node) => {
      if (node.parentId == null) roots.push(node);
      else {
        const parent = map.get(node.parentId);
        parent ? parent.children.push(node) : roots.push(node);
      }
    });

    // sort children by moduleName
    const sortRec = (arr) => {
      arr.sort((a, b) => (a.moduleName || "").localeCompare(b.moduleName || ""));
      arr.forEach((c) => sortRec(c.children || []));
    };
    sortRec(roots);

    return roots;
  }, [modules]);

  // expand/collapse tree
  const isExpanded = (id) => expandedIds.has(id);
  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ---------------------------------------------------------
  // Modal handlers
  // ---------------------------------------------------------
  const openAddModule = (parentId = null) => {
    setAddParentId(parentId);
    setShowAddModal(true);
  };

  const openAssignModal = (moduleId) => {
    setAssignModuleId(moduleId);
    setShowAssignModal(true);
  };

  // ---------------------------------------------------------
  // Delete Module Handler (backend must support this)
  // ---------------------------------------------------------
  const handleDeleteModule = async (moduleId) => {
    if (!confirm("Delete module?")) return;
    try {
      const res = await deleteModule(moduleId);
      if (res.success) {
        refreshModules();
      } else {
        alert("Failed to delete module.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete API failed.");
    }
  };

  const handleEditModule = (moduleId) => {
    navigate(`/module-edit/${moduleId}`);
  };

  const handleViewDetails = (moduleId) => {
    navigate(`/module-tree?projectId=${selectedProjectId}&focusId=${moduleId}`);
  };

   const getStatusBadgeColor = (statusName) => {
    switch (statusName?.toLowerCase()) {
        case 'completed':
            return 'bg-success';
        case 'in progress':
            return 'bg-primary';
        case 'pending':
            return 'bg-warning text-dark';
        case 'blocked':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
};

  // ---------------------------------------------------------
  // Render Table Rows Recursively
  // ---------------------------------------------------------
//   const renderRows = (nodes, depth = 0) => {
//     return nodes.flatMap((node) => {
//       const row = (
//         <tr key={node.moduleId}>
//           {/* Tree column */}
//           <td style={{ whiteSpace: "nowrap", verticalAlign: "middle" }}>
//             <div className="d-flex align-items-center">
//               <div
//                 style={{
//                   marginLeft: depth * 18,
//                   display: "inline-flex",
//                   gap: 8,
//                   alignItems: "center",
//                 }}
//               >
//                 {/* expand/collapse */}
//                 {node.children.length > 0 ? (
//                   <button
//                     className="btn btn-sm btn-outline-secondary"
//                     style={{ width: 34, height: 34, padding: 0 }}
//                     onClick={() => toggleExpanded(node.moduleId)}
//                   >
//                     {isExpanded(node.moduleId) ? "▾" : "▸"}
//                   </button>
//                 ) : (
//                   <div style={{ width: 34 }} />
//                 )}

//                 <strong>{node.moduleName}</strong>

//                 {/* Add Submodule */}
//                 <button
//                   className="btn btn-sm btn-link"
//                   onClick={() => openAddModule(node.moduleId)}
//                 >
//                   <i className="bi bi-plus-circle"></i>
//                 </button>
//               </div>
//             </div>
//           </td>

//           {/* Created By */}
//           <td>{node.createdByName || "-"}</td>

//           {/* Assigned To */}
//           <td>
//             {node.assignedToName ? (
//               <span className="badge bg-secondary">{node.assignedToName}</span>
//             ) : (
//               <button
//                 className="btn btn-sm viewpro-btn3"
//                 onClick={() => openAssignModal(node.moduleId)}
//               >
//                 Assign
//               </button>
//             )}
//           </td>

//           {/* Work Type */}
//           <td>
//             {node.workTypeName ? (
//               <span className="badge bg-info text-dark">{node.workTypeName}</span>
//             ) : (
//               "-"
//             )}
//           </td>

//           {/* Status */}
//           <td>{node.statusName || node.status || "-"}</td>

//           {/* Actions */}
//           <td>
//             <div className="dropdown">
//               <button
//                 className="btn btn-sm btn-outline-secondary"
//                 data-bs-toggle="dropdown"
//               >
//                 <i className="bi bi-three-dots-vertical"></i>
//               </button>

//               <ul className="dropdown-menu">
//                 <li>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => handleEditModule(node.moduleId)}
//                   >
//                     Edit
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => handleDeleteModule(node.moduleId)}
//                   >
//                     Delete
//                   </button>
//                 </li>
//                 <li>
//                   <button
//                     className="dropdown-item"
//                     onClick={() => handleViewDetails(node.moduleId)}
//                   >
//                     View Details
//                   </button>
//                 </li>
//               </ul>
//             </div>
//           </td>
//         </tr>
//       );

//       const children =
//         node.children.length > 0 && isExpanded(node.moduleId)
//           ? renderRows(node.children, depth + 1)
//           : [];

//       return [row, ...children];
//     });
//   };
 const renderRows = (nodes, depth = 0) => {
    return nodes.flatMap((node) => {
      const row = (
        <tr key={node.moduleId}>
          {/* Tree column - Improved Indentation & Icons */}
          <td style={{ verticalAlign: "middle" }}>
            <div className="d-flex align-items-center" style={{ paddingLeft: depth * 16 }}>
                
                {/* 1. Expand/Collapse Icon Button (Cleaner, smaller icon style) */}
                {node.children.length > 0 ? (
                  <button
                    className="btn btn-sm btn-light p-0 me-2" // Smaller, light background
                    style={{ width: 24, height: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={() => toggleExpanded(node.moduleId)}
                  >
                    <i className={`bi bi-chevron-${isExpanded(node.moduleId) ? "down" : "right"} small`}></i>
                  </button>
                ) : (
                  <div style={{ width: 24, marginRight: 8 }} /> // Match spacing for alignment
                )}

                {/* 2. Module Name with Icon */}
                <i className={`bi bi-${depth === 0 ? "folder-fill text-primary" : "file-earmark-text text-secondary"} me-2`}></i>
                <strong>{node.moduleName}</strong>

                {/* Add Submodule Button (More prominent icon) */}
                <button
                  className="btn btn-sm btn-link text-success ms-2 p-0" // Changed to text-success
                  onClick={() => openAddModule(node.moduleId)}
                >
                  <i className="bi bi-plus-lg"></i> {/* Larger plus icon */}
                </button>
            </div>
          </td>

          {/* Created By */}
          <td style={{ verticalAlign: "middle" }}>{node.createdByName || "-"}</td>

          {/* Assigned To - Use a standard badge color for assigned */}
          <td style={{ verticalAlign: "middle" }}>
            {node.assignedToName ? (
              <span className="badge bg-primary">{node.assignedToName}</span> 
            ) : (
              <button
                className="btn btn-sm btn-outline-primary" // Use outline-primary for consistency
                onClick={() => openAssignModal(node.moduleId)}
              >
                <i className="bi bi-person-add me-1"></i> Assign
              </button>
            )}
          </td>

          {/* Work Type - Use standard colors */}
          <td style={{ verticalAlign: "middle" }}>
            {node.workTypeName ? (
              <span className="badge bg-dark">{node.workTypeName}</span> 
            ) : (
              "-"
            )}
          </td>

          {/* Status - Use dynamic color mapping */}
          <td style={{ verticalAlign: "middle" }}>
            {node.statusName || node.status ? (
                <span className={`badge ${getStatusBadgeColor(node.statusName || node.status)}`}>
                    {node.statusName || node.status}
                </span>
            ) : (
                "-"
            )}
          </td>

          {/* Actions */}
          <td style={{ verticalAlign: "middle" }}>
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary p-1" // Smaller button
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-gear"></i> {/* Changed to a more meaningful gear icon */}
              </button>

              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleEditModule(node.moduleId)}
                  >
                    <i className="bi bi-pencil-square me-2"></i> Edit
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item text-danger" // Highlight delete
                    onClick={() => handleDeleteModule(node.moduleId)}
                  >
                    <i className="bi bi-trash me-2"></i> Delete
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => handleViewDetails(node.moduleId)}
                  >
                    <i className="bi bi-eye me-2"></i> View Details
                  </button>
                </li>
              </ul>
            </div>
          </td>
        </tr>
      );

      const children =
        node.children.length > 0 && isExpanded(node.moduleId)
          ? renderRows(node.children, depth + 1)
          : [];

      return [row, ...children];
    });
};


  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="container mt-4">
      {/* Header - Use consistent primary button style */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom"> {/* Added border-bottom */}
        <h2 className="m-0">Module Tree Management</h2> {/* Emphasized title */}

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={() => navigate("/")}> {/* Standardized button */}
            <i className="bi bi-house me-1"></i> Home
          </button>

          {selectedProjectId && (
            <button className="btn btn-primary" onClick={() => openAddModule(null)}> {/* Standardized button */}
              <i className="bi bi-plus-lg me-1"></i> Add Top Module
            </button>
          )}
        </div>
      </div>

      {/* Project Dropdown - Use a light card style */}
      <div className="card shadow-sm p-4 mb-4">
        <h5 className="mb-3 text-secondary">Select Project</h5>
        <div className="row">
          <div className="col-md-4">
            <label className="form-label visually-hidden">Project</label> {/* Label for accessibility */}
            <select
              className="form-select form-select-lg" // Larger selection for prominence
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

      {/* Table - Use cleaner card/table styling */}
      <div className="card shadow-lg"> {/* More pronounced card shadow */}
        <div className="card-header bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-dark">Module Tree Structure</h5>
          {loading && <small className="text-primary"><i className="bi bi-arrow-clockwise me-1"></i> Loading...</small>}
        </div>

        <div className="card-body p-0">
          {!selectedProjectId ? (
            <div className="p-4 text-muted border-top">Select a project to view modules.</div>
          ) : error ? (
            <div className="p-4 text-danger border-top"><i className="bi bi-exclamation-triangle-fill me-2"></i> {error}</div>
          ) : modules.length === 0 ? (
            <div className="p-4 text-muted border-top">No modules found. Click "Add Top Module" to begin.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0"> {/* Use table-hover for better interaction */}
                <thead>
                  <tr>
                    <th style={{ minWidth: 350 }}>Module / Submodule</th> {/* Improved header name */}
                    <th>Created By</th>
                    <th>Assigned To</th>
                    <th>Work Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>{renderRows(treeRoots)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals (Unchanged) */}
      <AddModuleModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          refreshModules();
        }}
        projectId={selectedProjectId}
        parentId={addParentId}
      />

      {showAssignModal && (
        <CreateTaskModal
          moduleId={assignModuleId}
          onClose={() => setShowAssignModal(false)}
          onSuccess={() => {
            setShowAssignModal(false);
            refreshModules();
          }}
        />
      )}
    </div>
  )
}
