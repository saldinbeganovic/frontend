import axios from "axios";

export async function registerManufacturer(data) {
  return (await axios.post("/api/manufacturers", data)).data;
}

export async function getManufacturers() {
  return (await axios.get("/api/manufacturers")).data;
}

export async function getManufacturer() {
  return (await axios.get("/api/manufacturers")).data;
}

export async function getManufacturerUnits(query = "") {
  return (await axios.get(`/api/manufacturers/units?${query}`)).data;
}

export async function getManufacturerUnit(id) {
  return (await axios.get(`/api/manufacturers/units/${id}`)).data;
}

export async function getManufacturerBatches() {
  return (await axios.get(`/api/manufacturers/batches`)).data;
}

export async function createManufacturerBatch(data) {
  return (await axios.post(`/api/batches`, data)).data;
}

export async function updateManufacturerBatch(id, data) {
  return (await axios.put(`/api/batches/${id}`, data)).data;
}

export async function deleteManufacturerBatch(id) {
  return (await axios.delete(`/api/batches/${id}`)).data;
}

export async function deleteManufacturer(id) {
  return (await axios.delete(`/api/manufacturers/${id}`)).data;
}

export async function blockManufacturer(id) {
  return (await axios.post(`/api/manufacturers/${id}/block`)).data;
}

export async function unblockManufacturer(id) {
  return (await axios.post(`/api/manufacturers/${id}/unblock`)).data;
}
