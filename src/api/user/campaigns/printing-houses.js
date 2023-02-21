import axios from "axios";

export async function getPrintingHousesOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/printing-houses`)).data;
}

export async function getPrintingHouse(id) {
  return (await axios.get(`/api/printing-houses/${id}`)).data;
}

export async function createPrintingHouse(data) {
  return (await axios.post(`/api/printing-houses`, data)).data;
}

export async function updatePrintingHouse(id, data) {
  return (await axios.put(`/api/printing-houses/${id}`, data)).data;
}

export async function deletePrintingHouse(id) {
  return (await axios.delete(`/api/printing-houses/${id}`)).data;
}
