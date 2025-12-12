// src/components/taskList/CreateTaskModal.jsx
import { useEffect, useState, useMemo } from "react";
import {
  getMasterDetails,
  createWorkInfoDetailTarget,
  uploadMultipleFiles,
} from "../../api/api";

/**
 * CreateTaskModal
 *
 * Props:
 *  - moduleId (number)
 *  - onClose (fn)
 *  - onSuccess (fn) called after successful create/update
 *  - editData (object|null) optional: when provided modal works as "edit"
 *
 * Notes:
 *  - ChangeStatus dropdown is disabled during create (intChangeStatusId should remain null).
 *  - For edit mode, editData may include:
 *      editData.details.varReferenceImageId (comma-separated filenames)
 *      editData.details.varMOMId
 *      editData.targets[0].varReferenceAttachmentId
 *    These are treated as already-uploaded filenames and displayed in the uploaded lists.
 */
export default function CreateTaskModal({
  moduleId,
  onClose,
  onSuccess,
  editData = null,
}) {
  const isEdit = Boolean(editData);

  // --- Form state ---
  const [form, setForm] = useState({
    varShortDescription: editData?.varShortDescription || "",
    varLongDescription: editData?.varLongDescription || "",
    intWorkTypeId: editData?.intWorkTypeId || "",
    intUserId: editData?.intUserId || 1,
  });

  // target form: single target row for now (targets array will contain this object)
  const [targetForm, setTargetForm] = useState({
    dttTargetDate: editData?.targets?.[0]?.dttTargetDate || "", // expect ISO-friendly or "YYYY-MM-DD HH:MM:SS"
    intStatusId: editData?.targets?.[0]?.intStatusId || "",
    Comments: editData?.targets?.[0]?.Comments || "",
    intChangeStatusId: editData?.targets?.[0]?.intChangeStatusId ?? null,
  });

  // --- Masters ---
  const [workTypes, setWorkTypes] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [changeStatusList, setChangeStatusList] = useState([]);

  // --- Local file selections (before upload) ---
  const [referenceImages, setReferenceImages] = useState([]); // File[]
  const [momFiles, setMomFiles] = useState([]); // File[]
  const [targetAttachments, setTargetAttachments] = useState([]); // File[]

  // --- Already uploaded filenames (strings) from editData OR after uploading in this session ---
  const [uploadedRefs, setUploadedRefs] = useState(() =>
    editData?.details?.varReferenceImageId
      ? editData.details.varReferenceImageId.split(",").filter(Boolean)
      : []
  );
  const [uploadedMOMs, setUploadedMOMs] = useState(() =>
    editData?.details?.varMOMId
      ? editData.details.varMOMId.split(",").filter(Boolean)
      : []
  );
  const [uploadedTargetAtts, setUploadedTargetAtts] = useState(() =>
    editData?.targets?.[0]?.varReferenceAttachmentId
      ? editData.targets[0].varReferenceAttachmentId.split(",").filter(Boolean)
      : []
  );

  // --- Previews for selected files (object URLs) ---
  const [previews, setPreviews] = useState({ refs: [], moms: [], targets: [] });

  // --- UI state ---
  const [loadingMasters, setLoadingMasters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- Load masters (workTypes, status, changeStatus) ---
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingMasters(true);
      try {
        const wt = await getMasterDetails(1, 6); // WorkType
        const st = await getMasterDetails(1, 9); // Status
        const cs = await getMasterDetails(1, 10); // Change Status
        if (!mounted) return;
        setWorkTypes(wt.data || []);
        setStatusList(st.data || []);
        setChangeStatusList(cs.data || []);
      } catch (err) {
        console.error("Error loading masters:", err);
        if (mounted) setError("Failed to load master data.");
      } finally {
        if (mounted) setLoadingMasters(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // --- Build previews when user selects files ---
  useEffect(() => {
    // cleanup old object URLs
    const revoke = (items) => items.forEach((u) => URL.revokeObjectURL(u));
    const newRefs = referenceImages.map((f) => URL.createObjectURL(f));
    const newMoms = momFiles.map((f) => URL.createObjectURL(f));
    const newTargets = targetAttachments.map((f) => URL.createObjectURL(f));

    // release previous
    revoke(previews.refs);
    revoke(previews.moms);
    revoke(previews.targets);

    setPreviews({ refs: newRefs, moms: newMoms, targets: newTargets });

    return () => {
      revoke(newRefs);
      revoke(newMoms);
      revoke(newTargets);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceImages, momFiles, targetAttachments]);

  // --- Helpers ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const parsed = ["intWorkTypeId", "intUserId"].includes(name)
      ? Number(value)
      : value;
    setForm((s) => ({ ...s, [name]: parsed }));
  };

  const handleTargetChange = (e) => {
    const { name, value } = e.target;
    const parsed = ["intStatusId", "intChangeStatusId"].includes(name)
      ? value
        ? Number(value)
        : null
      : value;
    setTargetForm((s) => ({ ...s, [name]: parsed }));
  };

  // file selection handlers
  const handleSelectReferenceImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // append to existing selection
    setReferenceImages((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const handleSelectMOMFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setMomFiles((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  const handleSelectTargetAttachments = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setTargetAttachments((prev) => [...prev, ...files]);
    e.target.value = null;
  };

  // remove selected (not yet uploaded) files by index
  const removeSelectedRef = (index) =>
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  const removeSelectedMOM = (index) =>
    setMomFiles((prev) => prev.filter((_, i) => i !== index));
  const removeSelectedTarget = (index) =>
    setTargetAttachments((prev) => prev.filter((_, i) => i !== index));

  // remove already-uploaded filename (edit mode or after upload)
  const removeUploadedRef = (fileName) =>
    setUploadedRefs((prev) => prev.filter((f) => f !== fileName));
  const removeUploadedMOM = (fileName) =>
    setUploadedMOMs((prev) => prev.filter((f) => f !== fileName));
  const removeUploadedTarget = (fileName) =>
    setUploadedTargetAtts((prev) => prev.filter((f) => f !== fileName));

  // helper to format datetime-local to "YYYY-MM-DD HH:MM:SS"
  const formatTargetDate = (localValue) => {
    if (!localValue) return null;
    // localValue can be "2025-12-31T10:30" or "2025-12-31 10:30:00"
    const normalized = localValue.includes("T")
      ? localValue
      : localValue.replace(" ", "T");
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, "0");
    const YYYY = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const DD = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds() || 0);
    return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
  };

  // Convert editData's target date (if present) to datetime-local compatible string for input value
  const initialTargetInputValue = useMemo(() => {
    // if targetForm.dttTargetDate already provided (edit), try to convert "YYYY-MM-DD HH:MM:SS" => "YYYY-MM-DDTHH:MM"
    const raw = targetForm.dttTargetDate;
    if (!raw) return "";
    // if includes 'T' assume OK
    if (raw.includes("T")) {
      // trim seconds if present
      return raw.split(":").slice(0, 2).join(":").replace(" ", "T");
    }
    // replace space with 'T' and drop seconds
    const cleaned = raw.replace(" ", "T");
    return cleaned.split(":").slice(0, 2).join(":");
  }, [targetForm.dttTargetDate]);

  // --- Submit handler: upload files first (if any), then create API payload ---
  const handleSubmit = async () => {
    setError(null);

    if (!form.varShortDescription || !form.varShortDescription.trim()) {
      setError("Short description is required.");
      return;
    }
    if (!form.intWorkTypeId) {
      setError("Please select Work Type.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare FormData only if we have any files to upload
      let uploadResponse = null;
      const hasAnyFiles =
        referenceImages.length || momFiles.length || targetAttachments.length;

      if (hasAnyFiles) {
        const formData = new FormData();
        referenceImages.forEach((f) => formData.append("referenceImages", f));
        momFiles.forEach((f) => formData.append("momFiles", f));
        targetAttachments.forEach((f) =>
          formData.append("targetAttachments", f)
        );

        uploadResponse = await uploadMultipleFiles(formData);

        if (!uploadResponse || !uploadResponse.success) {
          throw new Error("File upload failed");
        }
      }

      // --------------------------------------------
      // BUILD FILE NAME LISTS (DO NOT USE STATE HERE)
      // --------------------------------------------
      const newRefNames =
        uploadResponse?.files?.referenceImages?.map((f) => f.fileName) || [];

      const newMomNames =
        uploadResponse?.files?.momFiles?.map((f) => f.fileName) || [];

      const newTargetNames =
        uploadResponse?.files?.targetAttachments?.map((f) => f.fileName) || [];

      // Merge NEW uploaded files with EXISTING (edit mode)
      const finalRefCsv =
        [...uploadedRefs, ...newRefNames].filter(Boolean).join(",") || null;

      const finalMomCsv =
        [...uploadedMOMs, ...newMomNames].filter(Boolean).join(",") || null;

      const finalTargetCsv =
        [...uploadedTargetAtts, ...newTargetNames].filter(Boolean).join(",") ||
        null;

      // --------------------------------------------
      // UPDATE UI STATE (safe, after payload is ready)
      // --------------------------------------------
      if (newRefNames.length) {
        setUploadedRefs((prev) => [...prev, ...newRefNames]);
      }
      if (newMomNames.length) {
        setUploadedMOMs((prev) => [...prev, ...newMomNames]);
      }
      if (newTargetNames.length) {
        setUploadedTargetAtts((prev) => [...prev, ...newTargetNames]);
      }

      // --------------------------------------------
      // BUILD FINAL PAYLOAD FOR BACKEND
      // --------------------------------------------
      const payload = {
        intModuleId: moduleId,
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
          varReferenceImageId: finalRefCsv,
          varMOMId: finalMomCsv,
        },

        targets: [
          {
            dttTargetDate: formatTargetDate(targetForm.dttTargetDate) || null,
            intStatusId: targetForm.intStatusId || null,
            Comments: targetForm.Comments || null,
            intChangeStatusId: targetForm.intChangeStatusId || null,
            varReferenceAttachmentId: finalTargetCsv,
          },
        ],
      };

      // --------------------------------------------
      // CALL CREATE API
      // --------------------------------------------
      const res = await createWorkInfoDetailTarget(payload);

      if (res && res.success) {
        alert(
          isEdit ? "Task updated successfully!" : "Task created successfully!"
        );
        onSuccess && onSuccess();
      } else {
        throw new Error(res?.message || "Failed to save task");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message || "Something went wrong during save.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ background: "#00000070" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {isEdit ? "Edit Task" : "Create Task"}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}

            {/* Short Description */}
            <div className="mb-3">
              <label className="form-label">Short Description</label>
              <input
                type="text"
                className="form-control"
                name="varShortDescription"
                value={form.varShortDescription}
                onChange={handleFormChange}
                placeholder="Enter short description"
              />
            </div>

            {/* Long Description */}
            <div className="mb-3">
              <label className="form-label">Long Description</label>
              <textarea
                className="form-control"
                name="varLongDescription"
                value={form.varLongDescription}
                onChange={handleFormChange}
                rows="3"
                placeholder="Enter long description"
              />
            </div>

            {/* Work Type */}
            <div className="mb-3">
              <label className="form-label">Work Type</label>
              <select
                className="form-select"
                name="intWorkTypeId"
                value={form.intWorkTypeId}
                onChange={handleFormChange}
                disabled={loadingMasters}
              >
                <option value="">-- Select Work Type --</option>
                {workTypes.map((wt) => (
                  <option key={wt.intId} value={wt.intId}>
                    {wt.varName}
                  </option>
                ))}
              </select>
            </div>

            {/* Assign User */}
            <div className="mb-3">
              <label className="form-label">Assign To (User)</label>
              <select
                className="form-select"
                name="intUserId"
                value={form.intUserId}
                onChange={handleFormChange}
              >
                <option value={1}>User 1</option>
                <option value={2}>User 2</option>
              </select>
            </div>

            <hr />

            {/* --- Attachments Section --- */}

            {/* Reference Images (multiple) */}
            <div className="mb-3">
              <label className="form-label">Reference Images (multiple)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSelectReferenceImages}
                className="form-control mb-2"
              />
              {/* Previews for newly selected images */}
              <div className="d-flex flex-wrap gap-2 mb-2">
                {referenceImages.map((f, idx) => (
                  <div key={idx} style={{ width: 120 }}>
                    <div style={{ position: "relative" }}>
                      <img
                        src={previews.refs[idx]}
                        alt={f.name}
                        style={{
                          width: "100%",
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                      <button
                        className="btn btn-sm btn-danger position-absolute"
                        style={{ top: 4, right: 4 }}
                        onClick={() => removeSelectedRef(idx)}
                      >
                        x
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {f.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Already uploaded refs (from edit or prior upload) */}
              {uploadedRefs.length > 0 && (
                <>
                  <div className="small mb-1">Uploaded Reference Images</div>
                  <ul className="list-group mb-2">
                    {uploadedRefs.map((fn) => (
                      <li
                        key={fn}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {fn}
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeUploadedRef(fn)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* MOM Files (multiple) */}
            <div className="mb-3">
              <label className="form-label">MOM Files (multiple)</label>
              <input
                type="file"
                multiple
                onChange={handleSelectMOMFiles}
                className="form-control mb-2"
              />
              <div className="mb-2">
                {momFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center justify-content-between mb-1"
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {f.name}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeSelectedMOM(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {uploadedMOMs.length > 0 && (
                <>
                  <div className="small mb-1">Uploaded MOM Files</div>
                  <ul className="list-group mb-2">
                    {uploadedMOMs.map((fn) => (
                      <li
                        key={fn}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {fn}
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeUploadedMOM(fn)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Target Attachments (multiple) */}
            <div className="mb-3">
              <label className="form-label">
                Target Attachments (multiple)
              </label>
              <input
                type="file"
                multiple
                onChange={handleSelectTargetAttachments}
                className="form-control mb-2"
              />
              <div className="mb-2">
                {targetAttachments.map((f, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center justify-content-between mb-1"
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {f.name}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeSelectedTarget(idx)}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {uploadedTargetAtts.length > 0 && (
                <>
                  <div className="small mb-1">Uploaded Target Attachments</div>
                  <ul className="list-group mb-2">
                    {uploadedTargetAtts.map((fn) => (
                      <li
                        key={fn}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {fn}
                        </div>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeUploadedTarget(fn)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <hr />

            {/* Target Date */}
            <div className="mb-3">
              <label className="form-label">Target Date</label>
              <input
                type="datetime-local"
                className="form-control"
                name="dttTargetDate"
                value={initialTargetInputValue}
                onChange={(e) =>
                  handleTargetChange({
                    target: { name: "dttTargetDate", value: e.target.value },
                  })
                }
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="intStatusId"
                value={targetForm.intStatusId || ""}
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

            {/* Change Status */}
            <div className="mb-3">
              <label className="form-label">Change Status</label>
              <select
                className="form-select"
                name="intChangeStatusId"
                value={targetForm.intChangeStatusId ?? ""}
                onChange={handleTargetChange}
                disabled={!isEdit}
              >
                <option value="">-- No Option --</option>
                {changeStatusList.map((c) => (
                  <option key={c.intId} value={c.intId}>
                    {c.varName}
                  </option>
                ))}
              </select>
            </div>

            {/* Comments */}
            <div className="mb-3">
              <label className="form-label">Comments</label>
              <textarea
                className="form-control"
                name="Comments"
                rows="2"
                value={targetForm.Comments || ""}
                onChange={handleTargetChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="viewpro-btn3"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEdit
                  ? "Updating..."
                  : "Saving..."
                : isEdit
                ? "Update Task"
                : "Save Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
