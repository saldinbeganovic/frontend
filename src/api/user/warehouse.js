import axios from "axios";

export async function getWarehousesOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/warehouses`)).data;
}

export async function getWarehouse(id) {
  return (await axios.get(`/api/warehouses/${id}`)).data;
}

export async function createWarehouse(data) {
  return (await axios.post(`/api/warehouses`, data)).data;
}

export async function updateWarehouse(id, data) {
  return (await axios.put(`/api/warehouses/${id}`, data)).data;
}

export async function deleteWarehouse(id, data) {
  return (await axios.delete(`/api/warehouses/${id}`, data)).data;
}
