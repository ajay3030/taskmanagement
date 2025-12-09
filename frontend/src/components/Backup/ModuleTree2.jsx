s// src/components/module/ModuleTree.jsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * ModuleTree reads projectId from query param and fetches:
 * GET /api/modules?projectId={ID}&mode=tree
 * then renders as nested Bootstrap list groups
 */

function TreeNode({ node }) {
  return (
    <li className="list-group-item">
      <div className="d-flex justify-content-between align-items-center">
        <div>{node.varModuleName ?? node.varName}</div>
        <div><small className="text-muted">ID: {node.intId}</small></div>
      </div>

      {node.children && node.children.length > 0 && (
        <ul className="list-group mt-2">
          {node.children.map((c) => (
            <TreeNode key={c.intId} node={c} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function ModuleTree() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get("projectId");
  const focusId = searchParams.get("focusId"); // optional

  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`http://localhost:4000/api/module/get-modules?projectId=${projectId}&mode=tree`)
      .then((r) => r.json())
      .then((d) => {
        setTree(Array.isArray(d) ? d : d.data || []);
      })
      .catch((err) => {
        console.error("Tree fetch error:", err);
        setTree([]);
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="m-0">Module Tree {projectId ? `for Project ${projectId}` : ""}</h4>
        <div>
          <button className="viewpro-btn3 me-2" onClick={() => navigate("/module-list")}>Back to List</button>
          <button className="viewpro-btn3" onClick={() => navigate("/module-add")}>Add Module</button>
        </div>
      </div>

      <div className="card custom-card bd">
        <div className="card-body">
          {loading ? (
            <div>Loading...</div>
          ) : tree.length === 0 ? (
            <div>No modules found for this project.</div>
          ) : (
            <ul className="list-group">
              {tree.map((node) => (
                <TreeNode key={node.intId} node={node} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
