// frontend/LevelUP-frontend/src/hooks/useUser.tsx
import { useContext } from "react";
import { UserContext } from "../context/UserContext";

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
