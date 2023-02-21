import axios from "axios";

export async function getUser(id) {
  return (await axios.get(`/api/users/${id}`)).data;
}

export async function createUser(data) {
  return (await axios.post(`/api/users`, data)).data;
}

export async function updateUser(id, data) {
  return (await axios.put(`/api/users/${id}`, data)).data;
}
export async function changeGroup(userId, companyId) {
  return (await axios.put(`/api/users/${userId}/change-company/${companyId}`))
    .data;
}

export async function getUsersMetadata(companyId) {
  return (await axios.get(`/api/companies/${companyId}/users/meta-data`)).data;
}

export async function deleteUser(id) {
  return (await axios.delete(`/api/users/${id}`)).data;
}

export async function blockUser(id) {
  return (await axios.post(`/api/users/${id}/block`)).data;
}

export async function unblockUser(id) {
  return (await axios.post(`/api/users/${id}/unblock`)).data;
}

/*
 * @param {Object} data
 * @param {String} data.email
 * @returns
 */
export async function inviteUser(companyId, data) {
  return (await axios.post(`/api/companies/${companyId}/invite-user`, data))
    .data;
}

/*
 * @param {Number} companyId
 * @param {Object} data
 * @param {String} data.first_name
 * @param {String} data.last_name
 * @param {String} data.password
 * @param {String} data.password_confirmation
 * @param {String} data.token
 * @returns
 */
export async function confirmInviteUser(companyId, data) {
  return (
    await axios.post(
      `/api/public/companies/${companyId}/confirm-invite-user`,
      data
    )
  ).data;
}

/*
 * @param {Number} companyId
 * @param {Object} data
 * @param {String} data.token
 * @returns
 */
export async function confirmInviteExistingUser(companyId, data) {
  return (
    await axios.post(
      `/api/public/companies/${companyId}/confirm-invite-user`,
      data
    )
  ).data;
}
