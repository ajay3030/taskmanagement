import { useEffect, useState } from "react";
import { getMasterTypes,insertMasterDetail } from "../../api/api";

export default function MasterDetailForm() {
  const [masterTypes, setMasterTypes] = useState([]);
  const [form, setForm] = useState({
    masterId: "",
    varName: "",
    intActive: 1,
    intCreatedBy: 1,
    intMasterRecord:1
  });

  // Fetch Master Types on page load
  useEffect(() => {
  getMasterTypes()
    .then(({ success, data }) => {
      if (success) setMasterTypes(data);
    })
    .catch((err) => console.error("Error fetching master types:", err));
}, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.masterId) {
      alert("Please select Master Type");
      return;
    }

    if (!form.varName.trim()) {
      alert("Var Name is required");
      return;
    }

    const payload = {
      ...form,
      intMasterId: parseInt(form.masterId, 10),
      intActive: parseInt(form.intActive, 10),
      intCreatedBy: parseInt(form.intCreatedBy, 10),
      intMasterRecord:parseInt(form.intMasterRecord, 10)
    };

    try {
    const data = await insertMasterDetail(payload);
    console.log("API Response:", data);

    data.success
      ? alert("Master Detail added successfully!")
      : alert("Something wrong");

    // reset form
    setForm({
      masterId: "",
      varName: "",
      intActive: 1,
      intCreatedBy: 1,
      intMasterRecord: 1
    });
  } catch (err) {
    console.error("Error:", err);
    alert("Something went wrong.");
  }
  };

  return (
    <div className="row justify-content-center mt-4">
      <div className="col-xxl-4 col-xl-4 col-lg-6 col-md-8 col-sm-12">
        <div className="card custom-card bd">
          <div className="card-header custom-card-header">
            <h5 className="main-content-label mb-0">Add Master Detail</h5>
          </div>

          <div className="card-body">
            {/* MASTER TYPE DROPDOWN */}
            <div className="mb-3">
              <label className="form-label">
                Master Type <span className="text-danger">*</span>
              </label>

              <select
                className="form-select"
                name="masterId"
                value={form.masterId}
                onChange={handleChange}
              >
                <option value="">-- Select Master Type --</option>
                {masterTypes.map((m) => (
                  <option key={m.intId} value={m.intId}>
                    {m.varName}
                  </option>
                ))}
              </select>
            </div>

            {/* varName */}
            <div className="mb-3">
              <label className="form-label">
                Master Detail Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="varName"
                className="form-control"
                placeholder="Enter detail name"
                value={form.varName}
                onChange={handleChange}
              />
            </div>

            {/* intActive */}
            <div className="mb-3">
              <label className="form-label">
                Active Status <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                name="intActive"
                value={form.intActive}
                onChange={handleChange}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>

          <div className="card-footer d-flex justify-content-end">
            <button className="viewpro-btn3" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
