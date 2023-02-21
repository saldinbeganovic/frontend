import axios from "axios";

export async function getBrandsOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/brands`)).data;
}

export async function getBrand(id) {
  return (await axios.get(`/api/brands/${id}`)).data;
}

export async function createBrand(data) {
  return (await axios.post(`/api/brands`, data)).data;
}

export async function updateBrand(id, data) {
  return (await axios.put(`/api/brands/${id}`, data)).data;
}

export async function deleteBrand(id, data) {
  return (await axios.delete(`/api/brands/${id}`, data)).data;
}
