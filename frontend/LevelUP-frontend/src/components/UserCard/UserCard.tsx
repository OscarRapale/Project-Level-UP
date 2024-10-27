import { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser";
import useHttpRequest from "../../hooks/useHttpRequest";
import { io } from "socket.io-client";
import "./UserCard.css"
import {
  Alert,
  AlertIcon,
  Box,
  Spinner,
  Text,
  Progress,
  useColorMode,
  Link,
} from "@chakra-ui/react";
import {
  HeartFill,
  Fire,
  LightningChargeFill,
  ChevronDoubleUp,
  CheckCircleFill,
} from "react-bootstrap-icons";

interface User {
  id: string;
  username: string;
  level: number;
  hp: number;
  max_hp: number;
  current_xp: number;
  xp_to_next_level: number;
  streak: number;
  habits_completed: number;
}

const UserCard: React.FC = () => {
  const { userId } = useUser();
  const [user, setUser] = useState<User | null>(null);

  const {
    data: userData,
    loading: userLoading,
    error: userError,
    sendRequest: fetchUser,
  } = useHttpRequest<User, unknown>({
    url: `http://127.0.0.1:5000/users/${userId}`,
    method: "GET",
  });

  const { colorMode } = useColorMode()

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [fetchUser, userId]);

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("user_update", (data: { user_id: string; user_data: User }) => {
      if (data.user_id === userId) {
        setUser(data.user_data);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="2xl"
      bg="#333"
      p={4}
      boxShadow="2xl"
      textAlign="center"
      color="white"
      w="80%"
      marginBottom="50px"
      marginTop="10rem"
      _hover={{ boxShadow: "2xl", transform: "scale(1.05)" }}
      animation="float 3s ease-in-out infinite"
    >
      {userLoading && <Spinner />}
      {userError && (
        <Alert status="error">
          <AlertIcon />
          {userError}
        </Alert>
      )}
      {user && (
        <>
          <Link
            href="/profile"
            fontSize="2xl"
            fontWeight="bold"
            fontFamily="'Orbitron', 'Exo 2', 'Lexend'" 
            _hover={{
              color: colorMode === 'dark' ? '#22d3ee' : '#DC143C',
            }}
          >
            {user.username}
          </Link>
          <Box display="flex" alignItems="center" justifyContent="center">
            <ChevronDoubleUp
              style={{
                color: "#7DF9FF",
                marginRight: "7px",
                marginBottom: "13px",
              }}
              size={"28px"}
            />
            <Text fontSize="xl">Level {user.level}</Text>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Fire
              style={{
                color: "orange",
                marginRight: "4px",
                marginBottom: "17px",
              }}
              size={"25px"}
            />
            <Text fontSize="xl">Daily Streak {user.streak}</Text>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center">
            <HeartFill
              style={{ color: "red", marginRight: "7px", marginBottom: "13px" }}
              size={"25px"}
            />
            <Text fontSize="xl">
              HP {user.hp}/{user.max_hp}
            </Text>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center">
            <CheckCircleFill
              style={{
                color: "#7FFFD4",
                marginRight: "7px",
                marginBottom: "13px",
              }}
              size={"25px"}
            />
            <Text fontSize="xl">
              Total Habits Completed {user.habits_completed}
            </Text>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              mb={2}
            >
              <LightningChargeFill
                style={{
                  color: "gold",
                  marginRight: "7px",
                  marginBottom: "13px",
                }}
                size={"25px"}
              />
              <Text fontSize="xl">XP :</Text>
            </Box>
            <Progress
              value={(user.current_xp / user.xp_to_next_level) * 100}
              size="md"
              colorScheme="green"
              width="80%"
            />
            <Text fontSize="lg">
              {user.current_xp}/{user.xp_to_next_level}
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
};

export default UserCard;
