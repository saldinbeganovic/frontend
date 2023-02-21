import axios from "axios";

export async function getMaintenances() {
  return (await axios.get(`/api/service-requests`)).data;
}

export async function getMaintenancesOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/service-requests`)).data;
}

export async function getArchivedMaintenancesOfCompany(id) {
  return (await axios.get(`/api/companies/${id}/service-requests?completed=1`))
    .data;
}

export async function getArchivedMaintenances() {
  return (await axios.get(`/api/service-requests?completed=1`)).data;
}

export async function getMaintenance(id) {
  return (await axios.get(`/api/service-requests/${id}`)).data;
}

export async function createMaintenance(data) {
  return (await axios.post(`/api/service-requests`, data)).data;
}

export async function updateMaintenance(id, data) {
  return (await axios.post(`/api/service-requests/${id}/update-status`, data))
    .data;
}
