import axios from "axios";

export async function getUnitDisplays(id) {
  return (await axios.get(`/api/units/${id}/displays`)).data;
}

export async function getUnitDisplay(unitId, displayId) {
  return (await axios.get(`/api/units/${unitId}/displays/${displayId}`)).data;
}

export async function createUnitDisplay(id, data) {
  return (await axios.post(`/api/units/${id}/displays`, data)).data;
}

export async function updateUnitDisplay(unitId, displayId, data) {
  return (await axios.put(`/api/units/${unitId}/displays/${displayId}`, data))
    .data;
}

export async function deleteUnitDisplay(unitId, displayId) {
  return (await axios.delete(`/api/units/${unitId}/displays/${displayId}`))
    .data;
}
