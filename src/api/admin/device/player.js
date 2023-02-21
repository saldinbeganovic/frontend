import axios from "axios";

export async function getPlayers() {
  return (await axios.get(`/api/players`)).data;
}

export async function getPlayer(id) {
  return (await axios.get(`/api/players/${id}`)).data;
}

export async function getPlayerScreenshots(id) {
  return (await axios.get(`/api/players/${id}/screenshots`)).data;
}

export async function getPlayerLogs(id) {
  return (await axios.get(`/api/players/${id}/logs`)).data;
}

export async function getPlayerSpeed(id) {
  return (await axios.get(`/api/players/${id}/speed`)).data;
}

export async function deletePlayerScreenshot(playerId, id) {
  return (await axios.delete(`/api/players/${playerId}/screenshots/${id}`))
    .data;
}

export async function deletePlayerLog(playerId, id) {
  return (await axios.delete(`/api/players/${playerId}/logs/${id}`)).data;
}

export async function deletePlayerSpeed(playerId, id) {
  return (await axios.delete(`/api/players/${playerId}/speed/${id}`)).data;
}

export async function takePlayerScreenshot(playerId) {
  return (await axios.get(`/api/players/${playerId}/screenshot`)).data;
}

export async function rebootPlayerRBPI(playerId) {
  return (await axios.get(`/api/players/${playerId}/reboot`)).data;
}

export async function sshPlayerRBPI(playerId) {
  return (await axios.get(`/api/players/${playerId}/ssh`)).data;
}


export async function updatePlayerRBPI(playerId) {
  return (await axios.get(`/api/players/${playerId}/update`)).data;
}

export async function checkSpeed(playerId) {
  return (await axios.get(`/api/players/${playerId}/checkspeed`)).data;
}

export async function takePlayerLog(playerId) {
  return (await axios.get(`/api/players/${playerId}/log`)).data;
}

export async function activatePlayer(playerActivationCode, data) {
  return (
    await axios.post(`/api/players/${playerActivationCode}/activate`, data)
  ).data;
}

export async function createPlayer(data) {
  return (await axios.post(`/api/players`, data)).data;
}

export async function updatePlayer(id, data) {
  return (await axios.put(`/api/players/${id}`, data)).data;
}

export async function attachVideo(playerId, videoId) {
  return (await axios.put(`/api/players/${playerId}/video/${videoId}`)).data;
}

export async function deletePlayer(id) {
  return (await axios.delete(`/api/players/${id}`)).data;
}

export async function getPlayersOfCompany(companyId) {
  return (await axios.get(`/api/companies/${companyId}/players`)).data;
}

export async function getPlayersOfUnit(unitId) {
  return (await axios.get(`/api/units/${unitId}/players`)).data;
}

export async function getPlayerQrCode(id, type = "svg", config = {}) {
  return (await axios.get(`/api/players/${id}/qr?type=${type}`, config)).data;
}

export async function scheduleVideo(data) {
  return (await axios.post(`/api/video-schedules`, data)).data;
}

export async function detachPlayer(id) {
  return (await axios.post(`/api/players/${id}/remove`)).data;
}
