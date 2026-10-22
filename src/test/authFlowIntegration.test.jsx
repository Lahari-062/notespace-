import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/useAuth";

describe("Direct Authentication Flow Integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function wrapper({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  it("should register a new account and log in directly", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        name: "Samantha Reed",
        email: "samantha@notespace.io",
        password: "securePassword123!",
      });
    });

    expect(result.current.currentUser).not.toBeNull();
    expect(result.current.currentUser.name).toBe("Samantha Reed");
    expect(result.current.currentUser.email).toBe("samantha@notespace.io");
  });

  it("should reject registration with existing email", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        name: "User One",
        email: "duplicate@notespace.io",
        password: "password123",
      });
    });

    await act(async () => {
      await expect(
        result.current.register({
          name: "User Two",
          email: "duplicate@notespace.io",
          password: "password456",
        })
      ).rejects.toThrow(/already exists/i);
    });
  });

  it("should log in directly with correct credentials and reject incorrect password", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // 1. Register
    await act(async () => {
      await result.current.register({
        name: "Elena Rostova",
        email: "elena@notespace.io",
        password: "mySecretPassword123",
      });
    });

    // 2. Logout
    act(() => {
      result.current.logout();
    });
    expect(result.current.currentUser).toBeNull();

    // 3. Attempt login with wrong password
    await act(async () => {
      await expect(
        result.current.login({
          email: "elena@notespace.io",
          password: "wrongpassword",
        })
      ).rejects.toThrow(/incorrect password/i);
    });
    expect(result.current.currentUser).toBeNull();

    // 4. Login with correct password -> directly logs in
    await act(async () => {
      const res = await result.current.login({
        email: "elena@notespace.io",
        password: "mySecretPassword123",
      });
      expect(res.user.email).toBe("elena@notespace.io");
    });

    expect(result.current.currentUser).not.toBeNull();
    expect(result.current.currentUser.email).toBe("elena@notespace.io");
  });

  it("should authenticate demo user directly", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      const res = await result.current.login({
        email: "alex@notespace.io",
        password: "demo",
      });
      expect(res.user.email).toBe("alex@notespace.io");
    });

    expect(result.current.currentUser).not.toBeNull();
    expect(result.current.currentUser.name).toBe("Alex Morgan");
  });

  it("should support guest login and logout", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.loginAsGuest();
    });

    expect(result.current.currentUser).not.toBeNull();
    expect(result.current.currentUser.isGuest).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.currentUser).toBeNull();
  });

  it("should support profile name updates and password changes", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.register({
        name: "Chloe Bennett",
        email: "chloe@notespace.io",
        password: "initialPassword123",
      });
    });

    // Update display name
    act(() => {
      result.current.updateProfile({ name: "Chloe B. Ward" });
    });
    expect(result.current.currentUser.name).toBe("Chloe B. Ward");

    // Change password
    await act(async () => {
      await result.current.changePassword({
        currentPassword: "initialPassword123",
        newPassword: "updatedPassword456",
      });
    });

    // Logout and log back in with new password
    act(() => {
      result.current.logout();
    });

    await act(async () => {
      await result.current.login({
        email: "chloe@notespace.io",
        password: "updatedPassword456",
      });
    });

    expect(result.current.currentUser).not.toBeNull();
    expect(result.current.currentUser.name).toBe("Chloe B. Ward");
  });
});
