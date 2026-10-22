// Keeps the logged-in user's tokens in localStorage
// and adds them to API requests.

import { API_URL, sendRequest } from "./api";

const STORAGE_KEY = "jobz-session";

// session looks like: { access: "...", refresh: "...", user: {...} }
export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

// The access token only lasts 2 hours. When it expires we use the
// refresh token to get a new one.
async function getNewAccessToken() {
  const session = getSession();
  if (!session) {
    return null;
  }
  try {
    const data = await sendRequest("/auth/refresh/", { method: "POST", body: { refresh: session.refresh } });
    saveSession({ ...session, access: data.access, refresh: data.refresh || session.refresh });
    return data.access;
  } catch (error) {
    // Refresh token expired too, so the user has to log in again
    clearSession();
    window.location.href = "/login";
    return null;
  }
}

// Same as sendRequest, but for logged-in users
export async function authRequest(path, options = {}) {
  const session = getSession();
  try {
    return await sendRequest(path, { ...options, token: session?.access });
  } catch (error) {
    if (error.status === 401 && session) {
      const newToken = await getNewAccessToken();
      return sendRequest(path, { ...options, token: newToken });
    }
    throw error;
  }
}

// For downloading files (CVs). Returns the raw response.
export async function authDownload(path) {
  let token = getSession()?.access;
  let response = await fetch(API_URL + path, { headers: { Authorization: "Bearer " + token } });

  if (response.status === 401) {
    token = await getNewAccessToken();
    response = await fetch(API_URL + path, { headers: { Authorization: "Bearer " + token } });
  }
  return response;
}
