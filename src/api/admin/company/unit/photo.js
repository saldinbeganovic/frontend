import axios from "axios";

export async function getUnitPhotos(unitId) {
  return (await axios.get(`/api/units/${unitId}/photos`)).data;
}

export async function getUnitPhoto(unitId, photoId) {
  return (await axios.get(`/api/units/${unitId}/photos/${photoId}`)).data;
}

export async function createUnitPhoto(unitId, data) {
  return (await axios.post(`/api/units/${unitId}/photos`, data)).data;
}

export async function updateUnitPhoto(unitId, photoId, data) {
  return (await axios.put(`/api/units/${unitId}/photos/${photoId}`, data)).data;
}

export async function deleteUnitPhoto(unitId, photoId) {
  return (await axios.delete(`/api/units/${unitId}/photos/${photoId}`)).data;
}
