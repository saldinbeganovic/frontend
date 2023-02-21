import axios from "axios";

export async function getUnitVisuals(id) {
  return (await axios.get(`/api/units/${id}/visuals`)).data;
}

export async function getVisualsOfCompany(id, posId, unitId) {
  const query = `${posId ? `pos_id=${posId}&` : ""}${
    posId ? `unit_id=${unitId}` : ""
  }`;
  return (await axios.get(`/api/companies/${id}/visuals?${query}`)).data;
}

export async function createUnitVisual(id, data) {
  return (await axios.post(`/api/units/${id}/visuals`, data)).data;
}

export async function updateUnitVisual(unitId, visualId, data) {
  return (await axios.put(`/api/units/${unitId}/visuals/${visualId}`, data))
    .data;
}

export async function getUnitVisual(id, visualId) {
  return (await axios.get(`/api/units/${id}/visuals/${visualId}`)).data;
}

export async function deleteUnitVisual(unitId, visualId) {
  return (await axios.delete(`/api/units/${unitId}/visuals/${visualId}`)).data;
}
