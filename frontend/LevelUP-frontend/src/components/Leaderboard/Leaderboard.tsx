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

interface User {
  id: string;
  username: string;
  level: number;
  XP: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { data, loading, error, sendRequest } = useHttpRequest<User[], unknown>(
    {
      url: "http://127.0.0.1:5000/users/leaderboard",
      method: "GET",
    }
  );

  useEffect(() => {
    document.title = "Level-UP | Leaderboard";
  }, []);

  useEffect(() => {
    sendRequest();
  }, [sendRequest]);

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
      w="80%"
      h="auto"
      m="auto"
      mt="10rem"
      maxH="80vh"
      overflowY="auto"
      marginBottom="150px"
      className="leaderboard-container"
    >
      <Text
        fontSize="3xl"
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
        >
          <Flex alignItems="center">
            <Avatar name={user.username} size="md" mr={4} />
            <Box>
              <Text fontSize="xl" fontWeight="bold">
                {user.username}
              </Text>
              <Badge colorScheme="teal" fontSize="0.8em">
                Rank #{index + 1}
              </Badge>
            </Box>
          </Flex>
          <Text fontSize="xl">Level: {user.level}</Text>
          <Text fontSize="xl">XP: {user.XP}</Text>
        </Flex>
      ))}
    </Box>
  );
};

export default Leaderboard;
