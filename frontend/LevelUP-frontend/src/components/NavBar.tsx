import {
  Box,
  Link,
  Flex,
  useDisclosure,
  IconButton,
  HStack,
  Stack,
  useColorMode,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import Logout from "./Logout";
import ColorModeSwitch from "./ColorModeSwitch";

const Links = [
  { name: "Home", path: "/" },
  { name: "Profile", path: "/profile" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "About_Us", path: "/about-us" },
  { name: "Leaderboard", path: "/leaderboard" },
];

const NavLink = ({
  children,
  to,
  colorMode,
}: {
  children: React.ReactNode;
  to: string;
  colorMode: string;
}) => (
  <RouterNavLink
    to={to}
    style={({ isActive }) => ({
      padding: "8px 16px",
      borderRadius: "md",
      textDecoration: "none",
      backgroundColor: isActive ? "gray.200" : "transparent",
      color: "inherit",
    })}
  >
    <Box
      _hover={{
        color: colorMode === "dark" ? "#22d3ee" : "#DC143C", // Conditional color based on color mode
      }}
    >
      {children}
    </Box>
  </RouterNavLink>
);

const NavBar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userId } = useUser(); // Access userId from context
  const { colorMode } = useColorMode();

  return (
    <Box
      bg="blackAlpha.800"
      color="white"
      px={4}
      fontFamily="'Orbitron', 'Exo 2', 'Lexend"
      fontSize="lg"
    >
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        {/* Logo for desktop view */}
        <Box display={{ base: "none", md: "flex" }}>
          <Box>Logo</Box>
        </Box>
        {/* IconButton for mobile view */}
        <Box display={{ base: "flex", md: "none" }}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            onClick={isOpen ? onClose : onOpen}
          />
        </Box>
        {/* Centered links */}
        <Box
          display={{ base: "none", md: "flex" }}
          flex={1}
          justifyContent={"center"}
        >
          <HStack as={"nav"} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.name} to={link.path} colorMode={colorMode}>
                {link.name}
              </NavLink>
            ))}
          </HStack>
        </Box>
        {/* Logo for mobile view */}
        <Box
          display={{ base: "flex", md: "none" }}
          flex={1}
          justifyContent={"center"}
        >
          <Box>Logo</Box>
        </Box>
        {/* Conditional Login/Logout link */}
        <Flex alignItems={"center"} fontSize="md">
          <Flex alignItems={"center"} fontSize="md" mr={12} mt={5}>
            <ColorModeSwitch />
          </Flex>
          {userId ? (
            <Logout /> // Renders the Logout button if user is logged in
          ) : (
            <Link
              as={RouterNavLink}
              to="/login"
              _hover={{ color: colorMode === "dark" ? "#22d3ee" : "#DC143C" }}
            >
              Login
            </Link> // Otherwise, renders Login link
          )}
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.name} to={link.path} colorMode={colorMode}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default NavBar;
