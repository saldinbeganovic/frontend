import jwtDecode from "jwt-decode";
import axios from "axios";

let jwt = null;

// READ MORE ABOUT JWT:
// https://jwt.io/introduction
// https://tools.ietf.org/html/rfc7519#section-4.1

/**
 * EXAMPLE OF ACCESS TOKEN:
 {
  "iss": "http://localhost:8000/api/auth/login",
  "iat": 1611936128, (issued at)
  "exp": 1617120128, (expiration time)
  "nbf": 1611936128,
  "jti": "deGWq6zvGOa8C346",
  "is_admin": true,
  "sub": 2, (user id)
  "prv": "23bd5c8949f600adb39e701c400872db7a5976f7"
 }
 */

export function clearJwtCache() {
  jwt = null;
  localStorage.removeItem("monitor-access-token");
}

export function getAccessToken(decode = false) {
  if (!jwt) {
    jwt = localStorage.getItem("monitor-access-token");
  }
  if (decode) {
    return jwt ? jwtDecode(jwt) : {};
  } else {
    return jwt ? jwt : {};
  }
}

export function isAdmin() {
  return getAccessToken(true).is_admin;
}

export function getUserRole() {
  return getAccessToken(true).role;
}

export function getUserRoleName() {
  return getAccessToken(true).type.name;
}

export function getUserId() {
  return getAccessToken(true).sub;
}

export function getExpirationTime() {
  return getAccessToken(true).exp * 1000;
}

export function isLoggedIn() {
  return getAccessToken() && getAccessToken() !== {}
    ? Date.now() <= getExpirationTime()
    : false;
}

export async function refreshToken() {
  const authResponse = await axios.post("/api/auth/refresh");
  jwt = authResponse.data.access_token;
  postLoginTask();
}

export async function login(email, password, rememberMe) {
  const authResponse = await axios.post("/api/auth/login", {
    email,
    password,
    remember_me: rememberMe
  });
  jwt = authResponse.data.access_token;
  postLoginTask();
  return authResponse;
}

export async function logout() {
  await axios.post("/api/auth/logout", {});
  localStorage.removeItem("monitor-access-token");
  jwt = "";
}

export async function confirmLogin(user, secret) {
  const authResponse = await axios.post("/api/auth/callback", {
    secret,
    user
  });
  jwt = authResponse.data.access_token;
  postLoginTask();
}

export async function confirmResetPassword(data) {
  return axios.post("/api/auth/confirm-reset-password", data);
}

export async function confirmFirstPassword(data) {
  return axios.post("/api/auth/confirm-first-password", data);
}

export async function onPageLoad() {
  if (isLoggedIn()) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
    refreshToken();
  }
}

export async function setJwt(token) {
  jwt = token;
  return postLoginTask();
}

function postLoginTask() {
  // update local storage with new token
  localStorage.setItem("monitor-access-token", jwt);
  // skip refresh if user's session is expired
  if (!isLoggedIn()) return;
  // set global axios header
  axios.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
  // schedule token refresh callback
  // expires_in is given in minutes (convert to ms)
  setTimeout(() => {
    refreshToken();
  }, getExpirationTime() - Date.now() - 5000); // fetch 5s before expiration
}
