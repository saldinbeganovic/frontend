import axios from "axios";

export async function createPos(data) {
  return (await axios.post("/api/point-of-sale", data)).data;
}

export async function updatePos(id, data) {
  return (await axios.put(`/api/point-of-sale/${id}`, data)).data;
}

export async function getPos(id) {
  return (await axios.get(`/api/point-of-sale/${id}`)).data;
}

export async function deletePos(id) {
  return (await axios.delete(`/api/point-of-sale/${id}`)).data;
}

export async function getPosOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/points-of-sale`)).data;
}

export async function getPointsOfSale() {
  return (await axios.get(`/api/point-of-sale`)).data;
}

export async function getUnitsOfPos(id) {
  return (await axios.get(`/api/point-of-sale/${id}/units`)).data;
}

export async function getPosMetadata(companyId) {
  return (
    await axios.get(`/api/companies/${companyId}/point-of-sale/meta-data`)
  ).data;
}
