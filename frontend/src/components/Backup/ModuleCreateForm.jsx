// src/components/module/ModuleCreateForm.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { insertModule,getMasterTypes,getMasterDetailsById,getModuleList } from "../../api/api";
/**
 * Create Module form:
 * - dynamically finds masterType IDs by varName ("project" and "NodeType")
 * - loads projects and node types from master-details
 * - loads parent modules for selected project
 */
export default function ModuleCreateForm() {
  const navigate = useNavigate();

  const [masterTypes, setMasterTypes] = useState([]);
  const [projectMasterTypeId, setProjectMasterTypeId] = useState(null);
  const [nodeTypeMasterTypeId, setNodeTypeMasterTypeId] = useState(null);

  const [projects, setProjects] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [parentModules, setParentModules] = useState([]);

  const [form, setForm] = useState({
    intProjectId: "",
    intNodeType: "",
    varModuleName: "",
    intParentId: null,
    intCreatedBy: 1,
  });

  useEffect(() => {
    getMasterTypes()
      .then(({ success, data = [] }) => {
        if (success) {
          setMasterTypes(data);
          const proj = data.find(m => m.varName === "project");
          const node = data.find(m => m.varName === "nodetype");
          if (proj) setProjectMasterTypeId(proj.intId);
          if (node) setNodeTypeMasterTypeId(node.intId);
        }
      })
      .catch(err => console.error("Master types error:", err));
  }, []);

  /* 2. projects when ID resolved */
  useEffect(() => {
    if (!projectMasterTypeId) return;
    getMasterDetailsById(projectMasterTypeId)
      .then(({ success, data = [] }) => {
        if (success) setProjects(data);
      })
      .catch(err => console.error("Projects load error:", err));
  }, [projectMasterTypeId]);

  /* 3. node types when ID resolved */
  useEffect(() => {
    if (!nodeTypeMasterTypeId) return;
    getMasterDetailsById(nodeTypeMasterTypeId)
      .then(({ success, data = [] }) => {
        if (success) setNodeTypes(data);
      })
      .catch(err => console.error("NodeTypes load error:", err));
  }, [nodeTypeMasterTypeId]);

  /* 4. parent modules when project selected */
  useEffect(() => {
    if (!form.intProjectId) {
      setParentModules([]);
      return;
    }
    getModuleList(form.intProjectId)
      .then(list => setParentModules(list))
      .catch(err => {
        console.error("Parent modules load error:", err);
        setParentModules([]);
      });
  }, [form.intProjectId]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.intProjectId) return alert("Select a project");
    if (!form.intNodeType) return alert("Select node type");
    if (!form.varModuleName?.trim()) return alert("Module name required");

    const payload = {
      intProjectId: parseInt(form.intProjectId, 10),
      intNodeType: parseInt(form.intNodeType, 10),
      varModuleName: form.varModuleName.trim(),
      intCreatedBy: parseInt(form.intCreatedBy, 10),
      intParentId: form.intParentId ? parseInt(form.intParentId, 10) : null,
    };

    try {
      const data = await insertModule(payload);
      console.log("Module create response:", data);
      alert("Module created successfully");
      navigate(`/module-list`);
    } catch (err) {
      console.error("Create module error:", err);
      alert("Failed to create module");
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-xxl-6 col-xl-7 col-lg-8 col-md-10">
          <div className="card custom-card bd">
            <div className="card-header">
              <h5 className="mb-0">Create Module</h5>
            </div>

            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Project <span className="text-danger">*</span></label>
                <select className="form-select" name="intProjectId" value={form.intProjectId} onChange={handleChange}>
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => <option key={p.intId} value={p.intId}>{p.varName}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Node Type <span className="text-danger">*</span></label>
                <select className="form-select" name="intNodeType" value={form.intNodeType} onChange={handleChange}>
                  <option value="">-- Select Node Type --</option>
                  {nodeTypes.map((n) => <option key={n.intId} value={n.intId}>{n.varName}</option>)}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label"> Node Type Name  <span className="text-danger">*</span></label>
                <input className="form-control" name="varModuleName" value={form.varModuleName} onChange={handleChange} placeholder="Enter Node Type name" />
              </div>

              <div className="mb-3">
                <label className="form-label">Parent Module (optional)</label>
                <select className="form-select" name="intParentId" value={form.intParentId ?? ""} onChange={handleChange}>
                  <option value="">-- No parent --</option>
                  {parentModules.map((pm) => (
                    <option key={pm.intId} value={pm.intId}>{pm.varModuleName ?? pm.varName ?? pm.varModuleName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="card-footer d-flex justify-content-end">
              <button className="viewpro-btn3" onClick={handleSubmit}>Create</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
