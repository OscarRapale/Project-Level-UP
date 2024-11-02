import { Link, useColorMode } from "@chakra-ui/react";
import { useUser } from "../hooks/useUser";
import { useNavigate } from "react-router-dom";

const Logout: React.FC = () => {
  const { setUserId } = useUser();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  const handleLogout = () => {
    setUserId(""); // Clears user ID from context and localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <Link
      onClick={handleLogout}
      color="white"
      _hover={{ color: colorMode === "dark" ? "#22d3ee" : "#DC143C" }}
    >
      Logout
    </Link>
  );
};

export default Logout;
