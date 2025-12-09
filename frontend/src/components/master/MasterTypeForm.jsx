import { useState } from "react";

export default function MasterTypeForm() {
  const [form, setForm] = useState({
    varName: "",
    intActive: 1,
    intCreatedBy: 1,
    intMasterRecord:1
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.varName.trim()) {
      alert("Var Name is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/master/insert-master-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      console.log("API Response:", data);

      data.success?alert("Master Type added successfully!"):alert("something wrong")

      // reset after success
      setForm({
        varName: "",
        intActive: 1,
        intCreatedBy: 1,
        intMasterRecord:1
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

          {/* HEADER */}
          <div className="card-header custom-card-header">
            <h5 className="main-content-label mb-0">Add Master Type</h5>
          </div>

          <div className="card-body">
            {/* varName */}
            <div className="mb-3">
              <label className="form-label">
                Master Type Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="varName"
                className="form-control"
                placeholder="Enter master type"
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

            {/* intCreatedBy (hidden) */}
            <input type="hidden" name="intCreatedBy" value={form.intCreatedBy} />
          </div>

          {/* SUBMIT BUTTON */}
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
