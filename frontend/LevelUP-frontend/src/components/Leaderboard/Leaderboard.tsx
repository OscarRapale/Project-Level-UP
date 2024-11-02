import React, { useEffect, useState } from "react";
import useHttpRequest from "../../hooks/useHttpRequest";
import './Leaderboard.css';
import {
  Box,
  Flex,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Avatar,
  Badge,
} from "@chakra-ui/react";

// Interface for User
interface User {
  id: string;
  username: string;
  level: number;
  XP: number;
}

const Leaderboard: React.FC = () => {
  // State variables
  const [users, setUsers] = useState<User[]>([]);
  
  // HTTP request hook for fetching leaderboard data
  const { data, loading, error, sendRequest } = useHttpRequest<User[], unknown>(
    {
      url: "http://127.0.0.1:5000/users/leaderboard",
      method: "GET",
    }
  );

  // Set the document title when the component mounts
  useEffect(() => {
    document.title = "Level-UP | Leaderboard";
  }, []);

  // Fetch leaderboard data when the component mounts
  useEffect(() => {
    sendRequest();
  }, [sendRequest]);

  // Update users state when leaderboard data is fetched
  useEffect(() => {
    if (data) {
      console.log("Received data:", data);
      setUsers(data);
    }
  }, [data]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      bg="#333"
      color="white"
      borderRadius="md"
      boxShadow="lg"
      w={{ base: "100%", md: "80%" }}
      h="auto"
      m="auto"
      mt={{ base: "2rem", md: "10rem" }}
      maxH="80vh"
      overflowY="auto"
      marginBottom="150px"
      className="leaderboard-container"
    >
      <Text
        fontSize={{ base: "2xl", md: "3xl" }}
        fontWeight="bold"
        fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
        mb={4}
      >
        Leaderboard
      </Text>
      {loading && <Spinner />}
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}
      {users.map((user, index) => (
        <Flex
          key={user.id}
          w="100%"
          p={4}
          bg="#34495e"
          borderRadius="md"
          mb={4}
          alignItems="center"
          justifyContent="space-between"
          boxShadow="md"
          _hover={{ boxShadow: "xl", transform: "scale(1.02)" }}
          transition="all 0.2s"
          flexDirection={{ base: "column", md: "row" }}
        >
          <Flex alignItems="center" mb={{ base: 2, md: 0 }}>
            <Avatar name={user.username} size="md" mr={4} />
            <Box textAlign={{ base: "center", md: "left" }}>
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                {user.username}
              </Text>
              <Badge colorScheme="teal" fontSize="0.8em">
                Rank #{index + 1}
              </Badge>
            </Box>
          </Flex>
          <Text fontSize={{ base: "lg", md: "xl" }}>Level: {user.level}</Text>
          <Text fontSize={{ base: "lg", md: "xl" }}>XP: {user.XP}</Text>
        </Flex>
      ))}
    </Box>
  );
};

export default Leaderboard;
