import axios from "axios";

export async function getUnitDocuments(unitId) {
  return (await axios.get(`/api/units/${unitId}/documentation`)).data;
}

export async function getUnitDocument(unitId, documentId) {
  return (await axios.get(`/api/units/${unitId}/documentation/${documentId}`))
    .data;
}

export async function createUnitDocumentation(unitId, data) {
  return (await axios.post(`/api/units/${unitId}/documentation`, data)).data;
}

export async function updateUnitDocumentation(unitId, docId, data) {
  return (await axios.put(`/api/units/${unitId}/documentation/${docId}`, data))
    .data;
}

export async function deleteUnitDocumentation(unitId, docsId) {
  return (await axios.delete(`/api/units/${unitId}/documentation/${docsId}`))
    .data;
}
