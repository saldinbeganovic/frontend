import axios from "axios";

export async function getVisualMaterial(id) {
  return (await axios.get(`/api/visual-materials/${id}`)).data;
}

export async function createVisualMaterial(data) {
  return (await axios.post(`/api/visual-materials`, data)).data;
}

/*
 *
 * @param {Number} id
 * @param {Object} data
 * @param {String} data.name
 * @param {String} data.notes
 * @param {Number} data.company_id
 * @returns
 */
export async function updateVisualMaterial(id, data) {
  return (await axios.put(`/api/visual-materials/${id}`, data)).data;
}

export async function deleteVisualMaterial(id) {
  return (await axios.delete(`/api/visual-materials/${id}`)).data;
}
