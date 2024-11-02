import React, { createContext, useState, useEffect, ReactNode } from "react";

// Interface for UserContext
interface UserContextType {
  userId: string | null; // User ID, can be null if not set
  setUserId: (id: string) => void; // Function to set the User ID
}

// Create UserContext with default value as undefined
export const UserContext = createContext<UserContextType | undefined>(undefined);

// UserProvider component to provide UserContext to its children
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State variable to store the User ID, initialized from localStorage
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem("userId");
  });

  // Effect to update localStorage whenever the User ID changes
  useEffect(() => {
    if (userId) {
      localStorage.setItem("userId", userId);
    } else {
      localStorage.removeItem("userId");
    }
  }, [userId]);

  return (
    // Provide the User ID and setUserId function to the context
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};
