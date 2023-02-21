import axios from "axios";

export async function getModems() {
  return (await axios.get(`/api/modems`)).data;
}

export async function getModem(id) {
  return (await axios.get(`/api/modems/${id}`)).data;
}

export async function getModemsOfPos(posId) {
  return (await axios.get(`/api/point-of-sale/${posId}/modems`)).data;
}

export async function getModemConfig(id) {
  return await axios.get(`/api/modems/${id}/config`, { responseType: "blob" });
}

export async function createModem(data) {
  return (await axios.post(`/api/modems`, data)).data;
}

export async function activateModem(id, data) {
  return (await axios.post(`/api/modems/${id}/activate`, data)).data;
}

export async function updateModem(id, data) {
  return (await axios.put(`/api/modems/${id}`, data)).data;
}

export async function deleteModem(id) {
  return (await axios.delete(`/api/modems/${id}`)).data;
}

export async function getModemMetadata() {
  return (await axios.get(`/api/modems/meta-data`)).data;
}
export async function getModemQrCode(id, type = "svg", config = {}) {
  return (await axios.get(`/api/modems/${id}/qr?type=${type}`, config)).data;
}

export async function removeModemFromPos(id) {
  return (await axios.post(`api/modems/${id}/remove`)).data;
}
