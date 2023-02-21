import axios from "axios";

export async function getDecoratingHousesOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/decorating-houses`)).data;
}

export async function getDecoratingHouse(id) {
  return (await axios.get(`/api/decorating-houses/${id}`)).data;
}

export async function createDecoratingHouse(data) {
  return (await axios.post(`/api/decorating-houses`, data)).data;
}

export async function updateDecoratingHouse(id, data) {
  return (await axios.put(`/api/decorating-houses/${id}`, data)).data;
}

export async function deleteDecoratingHouse(id) {
  return (await axios.delete(`/api/decorating-houses/${id}`)).data;
}
