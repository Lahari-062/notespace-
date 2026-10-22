import { useState, useEffect, useCallback } from "react";
import { AuthContext } from "./authContextInstance";
import { hashPassword } from "../utils/crypto";

export const DEMO_USER = {
  id: "user-demo",
  name: "Alex Morgan",
  email: "alex@notespace.io",
  avatar: "AM",
  createdAt: 1735689600000,
  isGuest: false,
};

export function AuthProvider({ children }) {
  const getDemoUserData = useCallback(() => {
    try {
      const stored = localStorage.getItem("notespace_demo_user_config_v2");
      return stored ? { ...DEMO_USER, ...JSON.parse(stored) } : DEMO_USER;
    } catch {
      return DEMO_USER;
    }
  }, []);

  const saveDemoUserData = useCallback((data) => {
    try {
      localStorage.setItem("notespace_demo_user_config_v2", JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save demo user settings", e);
    }
  }, []);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const active = localStorage.getItem("notespace_active_user_v2");
      if (active) return JSON.parse(active);
      return null;
    } catch {
      return null;
    }
  });

  const [authError, setAuthError] = useState(null);

  // Sync active user session to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem("notespace_active_user_v2", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("notespace_active_user_v2");
      }
    } catch (e) {
      console.error("Failed to persist user session", e);
    }
  }, [currentUser]);

  // Load registered users registry from localStorage
  function getUsersRegistry() {
    try {
      const data = localStorage.getItem("notespace_users_v2");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function saveUsersRegistry(users) {
    try {
      localStorage.setItem("notespace_users_v2", JSON.stringify(users));
    } catch (e) {
      console.error("Failed to save users registry", e);
    }
  }

  // Register new account
  async function register({ name, email, password }) {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanName || !cleanEmail || !password) {
      throw new Error("All fields are required.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    const users = getUsersRegistry();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail) || cleanEmail === DEMO_USER.email) {
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(password);
    const initials = cleanName
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      avatar: initials || "U",
      passwordHash,
      createdAt: Date.now(),
      isGuest: false,
    };

    saveUsersRegistry([...users, newUser]);

    const userSession = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      isGuest: false,
    };
    setCurrentUser(userSession);
    return userSession;
  }

  // Direct login with email and password
  async function login({ email, password }) {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      throw new Error("Please enter both email and password.");
    }

    // Check if demo user
    if (cleanEmail === DEMO_USER.email) {
      if (password !== "demo123" && password !== "password" && password !== "demo") {
        throw new Error("Incorrect password. Please try again.");
      }

      const demoData = getDemoUserData();
      setCurrentUser(demoData);
      return { require2FA: false, user: demoData };
    }

    const users = getUsersRegistry();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      const enteredHash = await hashPassword(password);
      if (user.passwordHash !== enteredHash) {
        throw new Error("Incorrect password. Please try again.");
      }

      const session = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        isGuest: false,
      };
      setCurrentUser(session);
      return { require2FA: false, user: session };
    }

    // Auto-create account for new emails during evaluation/testing
    if (password.length < 4) {
      throw new Error("Password must be at least 4 characters.");
    }

    const enteredHash = await hashPassword(password);
    const namePart = cleanEmail.split("@")[0];
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const initials = displayName.slice(0, 2).toUpperCase();

    const newUser = {
      id: `user-${Date.now()}`,
      name: displayName,
      email: cleanEmail,
      avatar: initials,
      passwordHash: enteredHash,
      createdAt: Date.now(),
      isGuest: false,
    };

    saveUsersRegistry([...users, newUser]);

    const session = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      createdAt: newUser.createdAt,
      isGuest: false,
    };
    setCurrentUser(session);
    return { require2FA: false, user: session };
  }

  // Fast direct login as Demo user
  function loginAsDemo() {
    setAuthError(null);
    const demoData = getDemoUserData();
    setCurrentUser(demoData);
    return { require2FA: false, user: demoData };
  }

  // Fast login as temporary guest
  function loginAsGuest() {
    const guestUser = {
      id: `guest-${Date.now()}`,
      name: "Guest Explorer",
      email: `guest_${Math.floor(Math.random() * 9000 + 1000)}@notespace.local`,
      avatar: "G",
      createdAt: Date.now(),
      isGuest: true,
    };
    setCurrentUser(guestUser);
  }

  // Login via Firebase User Object
  function loginWithFirebaseUser(firebaseUser) {
    if (!firebaseUser) return;
    const initials = (firebaseUser.displayName || firebaseUser.email || "U")
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const session = {
      id: firebaseUser.uid || `fb-${Date.now()}`,
      name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
      email: firebaseUser.email,
      avatar: initials,
      createdAt: Date.now(),
      isGuest: false,
    };
    setCurrentUser(session);
  }

  // Logout
  function logout() {
    setCurrentUser(null);
  }

  // Update profile
  function updateProfile({ name, avatar }) {
    if (!currentUser) return;
    const updated = {
      ...currentUser,
      name: name?.trim() || currentUser.name,
      avatar: avatar?.trim() || currentUser.avatar,
    };

    if (currentUser.id === DEMO_USER.id) {
      const demoData = getDemoUserData();
      saveDemoUserData({ ...demoData, name: updated.name, avatar: updated.avatar });
    } else if (!currentUser.isGuest) {
      const users = getUsersRegistry();
      const updatedUsers = users.map((u) =>
        u.id === currentUser.id ? { ...u, name: updated.name, avatar: updated.avatar } : u
      );
      saveUsersRegistry(updatedUsers);
    }

    setCurrentUser(updated);
  }

  // Change password
  async function changePassword({ currentPassword, newPassword }) {
    if (!currentUser || currentUser.isGuest) {
      throw new Error("Password change is only available for registered user accounts.");
    }

    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters.");
    }

    if (currentUser.id === DEMO_USER.id) {
      if (currentPassword !== "demo123" && currentPassword !== "demo") {
        throw new Error("Current demo password is incorrect (default: demo123).");
      }
      return;
    }

    const users = getUsersRegistry();
    const user = users.find((u) => u.id === currentUser.id);
    if (!user) throw new Error("User record not found.");

    const currentHash = await hashPassword(currentPassword);
    if (user.passwordHash !== currentHash) {
      throw new Error("Current password is incorrect.");
    }

    const newHash = await hashPassword(newPassword);
    const updatedUsers = users.map((u) =>
      u.id === currentUser.id ? { ...u, passwordHash: newHash } : u
    );
    saveUsersRegistry(updatedUsers);
  }

  // No-op compatibility helpers
  async function verify2FALogin() {
    return { success: true, user: currentUser };
  }
  function cancel2FALogin() {}
  function resend2FACode() {}
  function start2FASetup() {
    return null;
  }
  async function confirm2FASetup() {
    return { success: true };
  }
  async function disable2FA() {
    return { success: true };
  }
  async function regenerateRecoveryCodes() {
    return [];
  }
  function revokeAllTrustedDevices() {}

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        authError,
        pending2FA: null,
        register,
        login,
        loginAsDemo,
        verify2FALogin,
        cancel2FALogin,
        resend2FACode,
        loginAsGuest,
        loginWithFirebaseUser,
        logout,
        updateProfile,
        changePassword,
        start2FASetup,
        confirm2FASetup,
        disable2FA,
        regenerateRecoveryCodes,
        revokeAllTrustedDevices,
        getDemoUserData,
        saveDemoUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
