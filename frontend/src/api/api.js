import axios from "axios";

const API = "http://localhost:4000/api";

// GET masterdetails
export const getMasterDetails = async (typeId, masterId) => {
  const res = await axios.get(`${API}/master/get-master-details`, {
    params: { typeId, masterId }
  });
  return res.data;
};

// GET Work List (tasks)
export const getWorkList = async (params) => {
  const res = await axios.get(`${API}/workinfo/get-work-list`, { params });
  return res.data.data; // backend returns { success, data }
};

export const createModule = async (payload) => {
  const res = await fetch("http://localhost:4000/api/module/insert-module", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return res.json();
};


// GET all master types
export const getMasterTypes = async () => {
  const res = await axios.get(`${API}/master/get-master-types`);
  return res.data;               // { success, data }
};

// GET details for one master (typeId is hard-coded to 1 here)
export const getMasterDetailsById = async (masterId) => {
  const res = await axios.get(`${API}/master/get-master-details`, {
    params: { typeId: 1, masterId }
  });
  return res.data;               // { success, data }
};


// POST insert new master-detail
export const insertMasterDetail = async (payload) => {
  const res = await axios.post(`${API}/master/insert-master-detail`, payload);
  return res.data;               // { success, … }
};

// GET module tree for a project
export const getModuleTree = async (projectId) => {
  const res = await axios.get(`${API}/module/get-modules`, {
    params: { projectId, mode: "tree" }
  });
  return res.data.data || [];   // backend returns { success, data }
};

// POST create new work-info (task)
export const createWorkInfo = async (payload) => {
  const res = await axios.post(`${API}/workinfo/create-work-info`, payload);
  return res.data;          // { success, … }
};

// POST create new module
export const insertModule = async (payload) => {
  const res = await axios.post(`${API}/module/insert-module`, payload);
  return res.data;          // { success, … }
};


// GET flat module list for a project
export const getModuleList = async (projectId) => {
  const res = await axios.get(`${API}/module/get-modules`, {
    params: { projectId, mode: "list" }
  });
  return Array.isArray(res.data) ? res.data : res.data.data || [];
};
