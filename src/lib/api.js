// Helpers for talking to the Django API (the code in /backend)

// On my laptop the API runs at localhost:8000.
// On Vercel it uses the live API on Render (unless NEXT_PUBLIC_API_URL is set).
const LIVE_API_URL = "https://jobz-api-a22m.onrender.com/api";
const LOCAL_API_URL = "http://localhost:8000/api";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? LIVE_API_URL : LOCAL_API_URL);

// Used by server pages to load data.
// If something goes wrong it returns `fallback` instead of crashing the page.
export async function getData(path, fallback = null) {
  try {
    const response = await fetch(API_URL + path, { next: { revalidate: 60 } });
    if (!response.ok) {
      return fallback;
    }
    return await response.json();
  } catch (error) {
    console.log("Could not load " + path, error.message);
    return fallback;
  }
}

// Used in the browser to send requests (log in, apply, post a job...).
// If the request fails it throws an error with:
//   error.message -> a message to show the user
//   error.fields  -> errors for each form field, e.g. { email: "Already used" }
//   error.status  -> the HTTP status code
export async function sendRequest(path, { method = "GET", body, formData, token } = {}) {
  const headers = {};
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  let requestBody;
  if (formData) {
    // For file uploads. The browser sets the Content-Type for us.
    requestBody = formData;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(API_URL + path, { method, headers, body: requestBody });
  } catch (networkError) {
    const error = new Error("Can't reach JobZ right now. Check your internet and try again.");
    error.status = 0;
    error.fields = {};
    throw error;
  }

  // Some responses (like DELETE) have no body
  let data = null;
  if (response.status !== 204) {
    data = await response.json().catch(() => null);
  }

  if (!response.ok) {
    const error = new Error(getErrorMessage(data, response.status));
    error.status = response.status;
    error.fields = getFieldErrors(data);
    throw error;
  }

  return data;
}

// Django REST Framework sends errors like { "detail": "..." } or { "email": ["..."] }
function getErrorMessage(data, status) {
  if (status === 429) {
    return "Too many tries. Please wait a while and try again.";
  }
  if (data && data.detail) {
    return data.detail;
  }
  if (data && data.non_field_errors) {
    return data.non_field_errors.join(" ");
  }
  return "Something went wrong. Please try again.";
}

function getFieldErrors(data) {
  const fields = {};
  if (!data || typeof data !== "object") {
    return fields;
  }
  for (const key in data) {
    if (key === "detail" || key === "non_field_errors") continue;
    const value = data[key];
    fields[key] = Array.isArray(value) ? value.join(" ") : String(value);
  }
  return fields;
}
