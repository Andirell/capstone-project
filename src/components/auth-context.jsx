"use client";

// Shares the logged-in user with every page.
// Use it in a component like this:
//   const { user, login, logout } = useAuth();

import { createContext, useContext, useEffect, useState } from "react";
import { sendRequest } from "@/lib/api";
import { authRequest, clearSession, getSession, saveSession } from "@/lib/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Slugs of the jobs this user saved, e.g. ["frontend-engineer-codebase-4"]
  const [savedJobs, setSavedJobs] = useState([]);

  // When the site first loads, check if someone is already logged in
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session.user);
      // Get the latest profile from the API
      authRequest("/auth/me/")
        .then((freshUser) => {
          setUser(freshUser);
          saveSession({ ...getSession(), user: freshUser });
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  // Load the user's saved jobs after they log in
  const userId = user ? user.id : null;
  const isSeeker = user ? user.role === "seeker" : false;
  useEffect(() => {
    if (!userId || !isSeeker) {
      setSavedJobs([]);
      return;
    }
    authRequest("/me/saved-jobs/?page_size=50")
      .then((data) => setSavedJobs(data.results.map((item) => item.job.slug)))
      .catch(() => {});
  }, [userId, isSeeker]);

  async function login(email, password) {
    const data = await sendRequest("/auth/login/", { method: "POST", body: { email, password } });
    saveSession(data);
    setUser(data.user);
  }

  async function register(formValues) {
    const data = await sendRequest("/auth/register/", { method: "POST", body: formValues });
    saveSession(data);
    setUser(data.user);
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  // Call this after the user edits their profile
  function updateUser(newUser) {
    saveSession({ ...getSession(), user: newUser });
    setUser(newUser);
  }

  async function toggleSavedJob(slug) {
    const oldList = savedJobs;
    const isSaved = savedJobs.includes(slug);

    // Update the screen straight away, then tell the API
    if (isSaved) {
      setSavedJobs(savedJobs.filter((s) => s !== slug));
    } else {
      setSavedJobs([...savedJobs, slug]);
    }

    try {
      await authRequest(`/jobs/${slug}/save/`, { method: isSaved ? "DELETE" : "POST" });
    } catch (error) {
      // It didn't work, so put the list back how it was
      setSavedJobs(oldList);
    }
  }

  const value = {
    user,
    loading,
    isEmployer: user ? user.role === "employer" : false,
    login,
    register,
    logout,
    updateUser,
    savedJobs,
    toggleSavedJob,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
