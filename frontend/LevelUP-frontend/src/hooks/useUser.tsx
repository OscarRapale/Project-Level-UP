import { useContext } from "react";
import { UserContext } from "../context/UserContext";

// Custom hook to access the UserContext
export const useUser = () => {
  // Get the context value
  const context = useContext(UserContext);

  // Throw an error if the hook is used outside of a UserProvider
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  // Return the context value
  return context;
};
