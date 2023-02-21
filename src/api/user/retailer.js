import axios from "axios";

export async function getRetailersOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/retailers`)).data;
}

export async function getRetailer(id) {
  return (await axios.get(`/api/retailers/${id}`)).data;
}

export async function createRetailer(data) {
  return (await axios.post(`/api/retailers`, data)).data;
}

export async function updateRetailer(id, data) {
  return (await axios.put(`/api/retailers/${id}`, data)).data;
}

export async function deleteRetailer(id, data) {
  return (await axios.delete(`/api/retailers/${id}`, data)).data;
}
