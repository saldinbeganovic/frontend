import axios from "axios";

export async function getCompanies() {
  return (await axios.get("/api/companies")).data;
}

export async function getCompany(id) {
  return (await axios.get(`/api/companies/${id}`)).data;
}

export async function getCompanyMetadata() {
  return (await axios.get(`/api/companies/meta-data`)).data;
}

export async function createCompany(data) {
  return (await axios.post("/api/companies", data)).data;
}

export async function updateCompany(id, data) {
  return (await axios.put(`/api/companies/${id}`, data)).data;
}

export async function deleteCompany(id) {
  return (await axios.delete(`/api/companies/${id}`)).data;
}

export async function blockCompany(id) {
  return (await axios.post(`/api/companies/${id}/block`)).data;
}

export async function unblockCompany(id) {
  return (await axios.post(`/api/companies/${id}/unblock`)).data;
}

export async function getCompanyUsers(id) {
  return (await axios.get(`/api/companies/${id}/users`)).data;
}

export async function getCompanyStats() {
  return (await axios.get(`/api/companies/stats`)).data;
}

export async function getImportedUnits() {
  return (await axios.get(`/api/units/imported`)).data;
}

export async function getImportedUnitsOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/units/imported`)).data;
}

export async function getBatchesOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/batches`)).data;
}

export async function getBatches() {
  return (await axios.get(`/api/batches`)).data;
}

export async function getVideoSchedules(id, data) {
  return (
    await axios.get(`/api/companies/${id}/video-schedules`, {
      params: data
    })
  ).data;
}

/*
 * @param {Object} data
 * @param {Number} data.completed (values 1 for true or 0 for false)
 * @returns
 */
export async function getPrintingOrders(id, data) {
  return (
    await axios.get(`/api/companies/${id}/printing-orders`, {
      params: data
    })
  ).data;
}
/*
 * @param {Object} data
 * @param {Number} data.completed (values 1 for true or 0 for false)
 * @returns
 */
export async function getDecoratingOrders(id, data) {
  return (
    await axios.get(`/api/companies/${id}/decorating-orders`, {
      params: data
    })
  ).data;
}

export async function getVisualMaterials(companyId) {
  return (await axios.get(`/api/companies/${companyId}/visual-materials`)).data;
}
