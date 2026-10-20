import { useState } from "react";
import AuthContext from "./AuthContextValue";

function readStoredUser() {
  try {
    const savedUser = localStorage.getItem("currentUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Failed to read current user:", error);
    localStorage.removeItem("currentUser");
    return null;
  }
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem("users") || "[]");
  } catch (error) {
    console.error("Failed to read users:", error);
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const signup = (userData) => {
    const existingUsers = readUsers();
    const normalizedEmail = userData.email.trim().toLowerCase();

    const userExists = existingUsers.some(
      (existingUser) =>
        existingUser.email?.trim().toLowerCase() === normalizedEmail
    );

    if (userExists) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    const newUser = {
      id: Date.now(),
      name: userData.name.trim(),
      email: normalizedEmail,
      password: userData.password,
    };

    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser(newUser);

    return { success: true };
  };

  const login = (email, password) => {
    const existingUsers = readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const foundUser = existingUsers.find(
      (existingUser) =>
        existingUser.email?.trim().toLowerCase() === normalizedEmail &&
        existingUser.password === password
    );

    if (!foundUser) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    localStorage.setItem("currentUser", JSON.stringify(foundUser));
    setUser(foundUser);

    return { success: true };
  };

  const updateUser = (updates) => {
    if (!user) {
      return { success: false, message: "No user is signed in." };
    }

    const updatedUser = { ...user, ...updates };
    const existingUsers = readUsers();
    const updatedUsers = existingUsers.map((existingUser) =>
      existingUser.id === user.id ? updatedUser : existingUser
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);

    return { success: true, user: updatedUser };
  };

  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        signup,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

