/**
 * Authentication Service
 *
 * This module handles all authentication concerns in one place:
 * token storage, profile management, and authentication checks.
 *
 * WHY localStorage (not sessionStorage):
 * localStorage persists across browser sessions, so the user doesn't
 * need to log in every time they open the app. For a personal academic
 * todo app, this is the right trade-off between convenience and security.
 *
 * WHY separate from components:
 * Auth logic (reading/writing tokens, parsing JWTs) is a data concern.
 * Keeping it here means components only call simple functions like
 * `isAuthenticated()` without knowing how tokens are stored.
 */

import { jwtDecode } from 'jwt-decode';

const AUTH_TOKEN_KEY = 'taskmanager_auth_token';
const AUTH_PROFILE_KEY = 'taskmanager_user_profile';

// ─── Token Management ────────────────────────────────────────────

/**
 * Saves the Google credential (JWT token) to localStorage.
 */
export function saveAccessToken(credential) {
  localStorage.setItem(AUTH_TOKEN_KEY, credential);
}

/**
 * Retrieves the stored credential token.
 * Returns null if no token exists.
 */
export function getAccessToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

// ─── User Profile ────────────────────────────────────────────────

/**
 * Extracts and saves user profile data from the Google JWT credential.
 * The JWT contains name, email, and profile picture URL.
 *
 * @param {string} credential  - The JWT token from Google Sign-In
 * @returns {object}           - { name, email, picture }
 */
export function saveUserProfile(credential) {
  try {
    const decodedToken = jwtDecode(credential);

    const userProfile = {
      name: decodedToken.name || 'User',
      email: decodedToken.email || '',
      picture: decodedToken.picture || '',
    };

    localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(userProfile));
    return userProfile;
  } catch (error) {
    console.error('Failed to decode Google credential:', error);
    return { name: 'User', email: '', picture: '' };
  }
}

/**
 * Retrieves the saved user profile from localStorage.
 * Returns a default profile if none exists.
 */
export function getUserProfile() {
  try {
    const storedProfile = localStorage.getItem(AUTH_PROFILE_KEY);
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
  } catch (error) {
    console.error('Failed to parse stored profile:', error);
  }

  return { name: 'User', email: '', picture: '' };
}

// ─── Auth State ──────────────────────────────────────────────────

/**
 * Checks if the user is currently authenticated.
 * Returns true if a valid token exists in storage.
 */
export function isAuthenticated() {
  const token = getAccessToken();
  return token !== null && token !== '';
}

/**
 * Clears all auth data — used for logout.
 */
export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
}
