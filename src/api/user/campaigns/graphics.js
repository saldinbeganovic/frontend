import axios from "axios";

/*
 *
 * @param {*} id
 * @param {Object} data
 * @param {Number} data.is_archived (values 1|0 for true|false)
 * @returns
 */
export async function getGraphicsOfCompany(id, data) {
  return (
    await axios.get(`/api/companies/${id}/graphic-files`, { params: data })
  ).data;
}

export async function getGraphic(id) {
  return (await axios.get(`/api/graphic-files/${id}`)).data;
}

export async function getGraphicFile(id) {
  return await axios.get(`/api/graphic-files/${id}/download`, {
    responseType: "blob"
  });
}

export async function createGraphic(data) {
  return (await axios.post(`/api/graphic-files`, data)).data;
}

export async function updateGraphic(id, data) {
  return (await axios.put(`/api/graphic-files/${id}`, data)).data;
}

export async function deleteGraphic(id) {
  return (await axios.delete(`/api/graphic-files/${id}`)).data;
}
