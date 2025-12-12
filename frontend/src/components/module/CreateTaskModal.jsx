// src/components/module/CreateTaskModal.jsx
import { useEffect, useState } from "react";
import {
  getMasterDetails,
  uploadMultipleFiles,
  createWorkInfoDetailTarget,
  getFullTaskDetails,
  updateWorkInfoDetailTarget
} from "../../api/api";

export default function CreateTaskModal({
  moduleId = null,
  workInfoId = null,
  mode: initialMode = "create",
  onClose,
  onSuccess,
}) {
  const [mode, setMode] = useState(initialMode); // create | view | edit
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isCreate = mode === "create";

  // ---------- MASTER DATA ----------
  const [workTypes, setWorkTypes] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [changeStatusList, setChangeStatusList] = useState([]);
  const [loadingMasters, setLoadingMasters] = useState(false);

  // ---------- FORM ----------
  const [form, setForm] = useState({
    varShortDescription: "",
    varLongDescription: "",
    intWorkTypeId: "",
    intUserId: 1,
  });

  const [targetForm, setTargetForm] = useState({
    dttTargetDate: "",
    intStatusId: null,
    Comments: "",
    intChangeStatusId: null,
  });

  // ---------- ATTACHMENTS ----------
  const [existingRefs, setExistingRefs] = useState([]);
  const [existingMOMs, setExistingMOMs] = useState([]);
  const [existingTargetAtts] = useState([]); // backend does not return these yet

  const [newRefs, setNewRefs] = useState([]);
  const [newMOMs, setNewMOMs] = useState([]);
  const [newTargetAtts, setNewTargetAtts] = useState([]);

  const [previews, setPreviews] = useState({
    refs: [],
    moms: [],
    targets: [],
  });

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ================================================================
  //  LOAD MASTER VALUES
  // ================================================================
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoadingMasters(true);
      try {
        const wt = await getMasterDetails(1, 6);
        const st = await getMasterDetails(1, 9);
        const cs = await getMasterDetails(1, 10);

        if (!mounted) return;
        setWorkTypes(wt.data || []);
        setStatusList(st.data || []);
        setChangeStatusList(cs.data || []);
      } catch (err) {
        console.error("masters load error", err);
      } finally {
        if (mounted) setLoadingMasters(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  // ================================================================
  //  LOAD FULL TASK DETAILS (VIEW/EDIT)
  // ================================================================
  useEffect(() => {
    if (!workInfoId || mode === "create") return;

    let mounted = true;

    const loadDetails = async () => {
      setLoadingDetails(true);
      setError(null);

      try {
        const res = await getFullTaskDetails(workInfoId);

        if (!mounted) return;

        if (res?.success) {
          const { taskInfo, details, targets } = res.data;

          // ----- FORM -----
          setForm({
            varShortDescription: taskInfo.varShortDescription || "",
            varLongDescription: taskInfo.varLongDescription || "",
            intWorkTypeId: taskInfo.intWorkTypeId || "",
            intUserId: taskInfo.intUserId || 1,
          });

          const t = targets?.[0] || {};
          const formattedDate = t.dttTargetDate
            ? t.dttTargetDate.slice(0, 16)
            : "";

          setTargetForm({
            targetId: t.targetId || null,
            dttTargetDate: formattedDate,
            intStatusId: t.intStatusId || null,
            Comments: t.Comments || "",
            intChangeStatusId: t.intChangeStatusId ?? null,
          });

          // ATTACHMENTS
          setExistingRefs(
            details?.varReferenceImageId
              ? details.varReferenceImageId.split(",").filter(Boolean)
              : []
          );

          setExistingMOMs(
            details?.varMOMId
              ? details.varMOMId.split(",").filter(Boolean)
              : []
          );
        } else {
          setError("Failed to load task details.");
        }
      } catch (err) {
        console.error("load details error", err);
        setError("Error loading task details.");
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => (mounted = false);
  }, [workInfoId, mode]);

  // ================================================================
  //  FILE PREVIEW GENERATION (FIXED MEMORY LEAK)
  // ================================================================
  useEffect(() => {
    const refsURLs = newRefs.map((f) => URL.createObjectURL(f));
    const momsURLs = newMOMs.map((f) => URL.createObjectURL(f));
    const targetURLs = newTargetAtts.map((f) => URL.createObjectURL(f));

    setPreviews({
      refs: refsURLs,
      moms: momsURLs,
      targets: targetURLs,
    });

    return () => {
      refsURLs.forEach((u) => URL.revokeObjectURL(u));
      momsURLs.forEach((u) => URL.revokeObjectURL(u));
      targetURLs.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newRefs, newMOMs, newTargetAtts]);

  // ================================================================
  // INPUT HANDLERS
  // ================================================================
  const disabled = isView;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const parsed = ["intWorkTypeId", "intUserId"].includes(name)
      ? Number(value)
      : value;
    setForm((s) => ({ ...s, [name]: parsed }));
  };

  const handleTargetChange = (e) => {
    const { name, value } = e.target;
    setTargetForm((s) => ({
      ...s,
      [name]: ["intStatusId", "intChangeStatusId"].includes(name)
        ? value ? Number(value) : null
        : value,
    }));
  };

  const selectFiles = (filesList, setter) => {
    const files = Array.from(filesList || []);
    if (files.length) setter((prev) => [...prev, ...files]);
  };

  // ================================================================
  // SUBMIT — CREATE OR EDIT
  // ================================================================
  const buildCsv = (arr) =>
    arr && arr.length ? arr.filter(Boolean).join(",") : null;

  const formatDate = (val) => {
    if (!val) return null;
    const d = new Date(val);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.varShortDescription.trim()) {
      setError("Short description is required.");
      return;
    }
    if (!form.intWorkTypeId) {
      setError("Please select Work Type.");
      return;
    }

    setIsSubmitting(true);

    try {
      // -------- FILE UPLOAD --------
      let uploadResponse = null;
      const hasFiles = newRefs.length || newMOMs.length || newTargetAtts.length;

      if (hasFiles) {
        const fd = new FormData();
        newRefs.forEach((f) => fd.append("referenceImages", f));
        newMOMs.forEach((f) => fd.append("momFiles", f));
        newTargetAtts.forEach((f) => fd.append("targetAttachments", f));

        uploadResponse = await uploadMultipleFiles(fd);
        if (!uploadResponse?.success) throw new Error("File upload failed");
      }

      const newRefNames =
        uploadResponse?.files?.referenceImages?.map((f) => f.fileName) || [];
      const newMOMNames =
        uploadResponse?.files?.momFiles?.map((f) => f.fileName) || [];
      const newTargetNames =
        uploadResponse?.files?.targetAttachments?.map((f) => f.fileName) || [];

      const finalRef = buildCsv([...existingRefs, ...newRefNames]);
      const finalMOM = buildCsv([...existingMOMs, ...newMOMNames]);
      const finalTarget = buildCsv([...existingTargetAtts, ...newTargetNames]);

      const payload = {
        intModuleId: moduleId, // FIXED
        intWorkTypeId: form.intWorkTypeId,
        intDependencyWorkId: null,
        varShortDescription: form.varShortDescription,
        varLongDescription: form.varLongDescription || null,
        intCreatedBy: 1,
        intUserId: form.intUserId,

        details: {
          intPlatformId: null,
          intPriorityId: null,
          varDetails: null,
          varReferenceImageId: finalRef,
          varMOMId: finalMOM,
        },

        targets: [
          {
            dttTargetDate: formatDate(targetForm.dttTargetDate),
            intStatusId: targetForm.intStatusId,
            Comments: targetForm.Comments || null,
            intChangeStatusId: targetForm.intChangeStatusId,
            varReferenceAttachmentId: finalTarget,
          },
        ],
      };

      if (isCreate) {
        const res = await createWorkInfoDetailTarget(payload);

        if (res?.success) {
          alert("Task created successfully!");
          onSuccess?.();
          onClose?.();
        } else {
          throw new Error("Create failed");
        }
      }

      if (isEdit) {
  // Required by backend
  payload.workInfoId = workInfoId;

  // Use targetId returned by GET API
  payload.targets[0].targetId = targetForm.targetId || null;

  const res = await updateWorkInfoDetailTarget(payload);

  if (res?.success) {
    alert("Task updated successfully!");
    onSuccess?.();
    onClose?.();
  } else {
    throw new Error(res?.message || "Update failed");
  }
}

    } catch (err) {
      console.error("Submit error", err);
      setError(err.message);
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================================================================
  // RENDER
  // ================================================================
  return (
    <div className="modal fade show d-block" style={{ background: "#00000070" }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">
              {isCreate ? "Create Task" : isView ? "Task Details" : "Edit Task"}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {loadingMasters || loadingDetails ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                {/* SHORT DESCRIPTION */}
                <div className="mb-3">
                  <label className="form-label">Short Description</label>
                  <input
                    className="form-control"
                    name="varShortDescription"
                    value={form.varShortDescription}
                    disabled={disabled}
                    onChange={handleFormChange}
                  />
                </div>

                {/* LONG DESCRIPTION */}
                <div className="mb-3">
                  <label className="form-label">Long Description</label>
                  <textarea
                    className="form-control"
                    name="varLongDescription"
                    rows={3}
                    disabled={disabled}
                    value={form.varLongDescription}
                    onChange={handleFormChange}
                  />
                </div>

                {/* WORK TYPE + ASSIGN */}
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Work Type</label>
                    <select
                      className="form-select"
                      name="intWorkTypeId"
                      disabled={disabled}
                      value={form.intWorkTypeId}
                      onChange={handleFormChange}
                    >
                      <option value="">-- Select Work Type --</option>
                      {workTypes.map((w) => (
                        <option key={w.intId} value={w.intId}>
                          {w.varName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Assign To</label>
                    <select
                      className="form-select"
                      name="intUserId"
                      disabled={disabled}
                      value={form.intUserId}
                      onChange={handleFormChange}
                    >
                      <option value={1}>User 1</option>
                      <option value={2}>User 2</option>
                    </select>
                  </div>
                </div>

                <hr />

                {/* ATTACHMENTS */}
                <h6>Reference Images</h6>
                {existingRefs.length ? (
                  <ul className="list-group mb-2 small">
                    {existingRefs.map((fn) => (
                      <li
                        key={fn}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <a href={`/uploads/${fn}`} target="_blank">
                          {fn}
                        </a>
                        {!disabled && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              setExistingRefs((p) => p.filter((x) => x !== fn))
                            }
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted mb-2">No images</div>
                )}

                {!disabled && (
                  <>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => selectFiles(e.target.files, setNewRefs)}
                      className="form-control mb-2"
                    />
                    <div className="d-flex gap-2 flex-wrap">
                      {newRefs.map((f, i) => (
                        <div key={i} style={{ width: 120 }}>
                          <img
                            src={previews.refs[i]}
                            style={{
                              width: "100%",
                              height: 80,
                              borderRadius: 6,
                              objectFit: "cover",
                            }}
                          />
                          <div className="small">{f.name}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <hr />

                {/* MOM FILES */}
                <h6>MOM Files</h6>
                {existingMOMs.length ? (
                  <ul className="list-group mb-2 small">
                    {existingMOMs.map((fn) => (
                      <li
                        key={fn}
                        className="list-group-item d-flex justify-content-between"
                      >
                        <a href={`/uploads/${fn}`} target="_blank">
                          {fn}
                        </a>
                        {!disabled && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() =>
                              setExistingMOMs((p) => p.filter((x) => x !== fn))
                            }
                          >
                            Remove
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-muted mb-2">No MOM files</div>
                )}

                {!disabled && (
                  <>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => selectFiles(e.target.files, setNewMOMs)}
                      className="form-control mb-2"
                    />
                    {newMOMs.map((f, i) => (
                      <div key={i} className="small">
                        {f.name}
                      </div>
                    ))}
                  </>
                )}

                <hr />

                {/* TARGET INFO */}
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Target Date</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      disabled={disabled}
                      value={targetForm.dttTargetDate}
                      onChange={(e) =>
                        setTargetForm((s) => ({
                          ...s,
                          dttTargetDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      disabled={disabled}
                      value={targetForm.intStatusId || ""}
                      name="intStatusId"
                      onChange={handleTargetChange}
                    >
                      <option value="">-- Select Status --</option>
                      {statusList.map((s) => (
                        <option key={s.intId} value={s.intId}>
                          {s.varName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Change Status */}
<div className="mb-3">
  <label className="form-label">Change Status</label>

  {isView ? (
    <input
      className="form-control"
      disabled
      value={
        changeStatusList.find((cs) => cs.intId === targetForm.intChangeStatusId)?.varName ||
        "—"
      }
    />
  ) : (
    <select
      className="form-select"
      name="intChangeStatusId"
      value={targetForm.intChangeStatusId || ""}
      onChange={handleTargetChange}
    >
      <option value="">-- Select Change Status --</option>
      {changeStatusList.map((cs) => (
        <option key={cs.intId} value={cs.intId}>
          {cs.varName}
        </option>
      ))}
    </select>
  )}
</div>


                <div className="mb-3">
                  <label className="form-label">Comments</label>
                  <textarea
                    className="form-control"
                    disabled={disabled}
                    value={targetForm.Comments}
                    onChange={(e) =>
                      setTargetForm((s) => ({
                        ...s,
                        Comments: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>

            {isView && (
              <button
                className="btn btn-outline-primary"
                onClick={() => setMode("edit")}
              >
                Edit
              </button>
            )}

            {(isCreate || isEdit) && (
              <button
                className="btn btn-primary"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting
                  ? isCreate
                    ? "Creating..."
                    : "Updating..."
                  : isCreate
                  ? "Create Task"
                  : "Save Changes"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
