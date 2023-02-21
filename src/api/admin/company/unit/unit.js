import axios from "axios";

export async function createUnit(data) {
  return (await axios.post("/api/units", data)).data;
}

export async function createUnitPublic(data) {
  return (await axios.post("/api/public/units", data)).data;
}

export async function getUnit(id) {
  return (await axios.get(`/api/units/${id}`)).data;
}

export async function getUnitOfManufacturer(id) {
  return (await axios.get(`/api/manufacturers/units/${id}`)).data;
}
/*
 * @param {*} id
 * @param {Object} data
 * @param {Number} data.is_archived (values 1 for true or 0 for false)
 * @param {Number} data.without_units (values 1 for true or 0 for false)
 * @returns
 */
export async function getPosUnitsOfCompany(id, data) {
  return (
    await axios.get(`/api/companies/${id}/points-of-sale`, { params: data })
  ).data;
}
/*
 * @param {Object} data
 * @param {Number} data.is_archived (values 1 for true or 0 for false)
 * @param {Number} data.without_units (values 1 for true or 0 for false)
 * @returns
 */
export async function getPosUnits(data) {
  return (await axios.get(`/api/point-of-sale`, { params: data })).data;
}

export async function getUnitsOfCompany(id, archived) {
  return (
    await axios.get(
      `/api/companies/${id}/units${archived ? "?is_archived=1" : ""}`
    )
  ).data;
}

export async function getUnits(archived = false) {
  return (await axios.get(`/api/units${archived ? "?is_archived=1" : ""}`))
    .data;
}

export async function getUnitMetadata(companyId) {
  return (await axios.get(`/api/companies/${companyId}/units/meta-data`)).data;
}

export async function getPublicUnitMetadata() {
  return (await axios.get(`/api/public/units/meta-data`)).data;
}

export async function updateUnit(id, data) {
  return (await axios.put(`/api/units/${id}`, data)).data;
}

export async function archiveUnit(id, data) {
  return (await axios.put(`/api/units/${id}/archive`, data)).data;
}

export async function unarchiveUnit(id) {
  return (await axios.put(`/api/units/${id}/unarchive`)).data;
}

export async function deleteUnit(id, data) {
  return (await axios.delete(`/api/units/${id}`, data)).data;
}

export async function getBatch(id) {
  return (await axios.get(`/api/batches/${id}`)).data;
}

export async function getBatchPreview(code) {
  return (await axios.get(`/api/batches/${code}/preview`)).data;
}

export async function activateBatch(id, data) {
  return (await axios.post(`/api/batches/${id}/activate`, data)).data;
}

export async function assignToPos(data) {
  return (await axios.post(`/api/units/assign`, data)).data;
}

export async function assignToSpecificPos(id, data) {
  return (await axios.put(`api/units/${id}/unarchive `, data)).data;
}

export async function requestProducerData(data) {
  return (await axios.post(`/api/units/request`, data)).data;
}

export async function sendDocsAndPhotos(id, data) {
  return (await axios.post(`/api/units/${id}/send-docs-and-photos`, data)).data;
}
