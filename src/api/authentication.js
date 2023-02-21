import axios from "axios";

export async function getAuthUser() {
  return (await axios.post("/api/auth/me")).data;
}

export async function enable2fa() {
  return (await axios.post("/api/users/2fa/generate-secret-key")).data;
}

export async function disable2fa(secret) {
  return (await axios.post("/api/users/2fa/disable", { secret })).data;
}

export async function confirm2fa(secret) {
  return (await axios.post("/api/users/2fa/confirm-new-secret-key", { secret }))
    .data;
}

export async function resetPassword(data) {
  return (await axios.post("/api/auth/reset-password", data)).data;
}

export async function confirmPasswordReset(data) {
  return (await axios.post("/api/auth/confirm-reset-password", data)).data;
}
