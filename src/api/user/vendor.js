import axios from "axios";

export async function getVendors() {
  return (await axios.get(`/api/vendors`)).data;
}

export async function getVendorsOfCompany(companyId) {
  return (await axios.get(`/api/companies/${companyId}/vendors`)).data;
}

export async function getVendor(id) {
  return (await axios.get(`/api/vendors/${id}`)).data;
}

export async function createVendor(data) {
  return (await axios.post(`/api/vendors`, data)).data;
}

export async function updateVendor(id, data) {
  return (await axios.put(`/api/vendors/${id}`, data)).data;
}

export async function deleteVendor(id) {
  return (await axios.delete(`/api/vendors/${id}`)).data;
}
