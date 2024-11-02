import { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser";
import useHttpRequest from "../../hooks/useHttpRequest";
import { io } from "socket.io-client";
import "./UserCard.css";
import {
  Alert,
  AlertIcon,
  Box,
  Spinner,
  Text,
  Progress,
  useColorMode,
  Link,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import {
  HeartFill,
  Fire,
  LightningChargeFill,
  ChevronDoubleUp,
  CheckCircleFill,
} from "react-bootstrap-icons";

// Interface for User
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
  const [notification, setNotification] = useState<string | null>(null);
  const [isLevelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [isHpLossModalOpen, setHpLossModalOpen] = useState(false);

  // HTTP request hook for fetching user data
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    sendRequest: fetchUser,
  } = useHttpRequest<User, unknown>({
    url: `http://127.0.0.1:5000/users/${userId}`,
    method: "GET",
  });

  const { colorMode } = useColorMode();

  // Fetch user data when userId changes
  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [fetchUser, userId]);

  // Update user state when userData is fetched
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // WebSocket connection to listen for user updates
  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("user_update", (data: { user_id: string; user_data: User }) => {
      if (data.user_id === userId) {
        if (data.user_data.level > (user?.level || 0)) {
          setLevelUpModalOpen(true);
        } else if (data.user_data.hp < (user?.hp || 0)) {
          setHpLossModalOpen(true);
        } else if (data.user_data.hp > (user?.hp || 0)) {
          setNotification("HP restored!");
        }
        setUser(data.user_data);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, user]);

  // Clear notification after 7 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Handle closing the level-up modal
  const handleCloseLevelUpModal = () => {
    setLevelUpModalOpen(false);
    setNotification(null);
  };

  // Handle closing the HP loss modal
  const handleCloseHpLossModal = () => {
    setHpLossModalOpen(false);
    setNotification(null);
  };

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
      w={{ base: "100%", md: "80%" }}
      marginBottom="50px"
      marginTop={{ base: "2rem", md: "10rem" }}
      _hover={{ boxShadow: "2xl", transform: "scale(1.05)" }}
      animation="float 3s ease-in-out infinite"
    >
      {notification && (
        <Alert status="success" mb={4} bg="green.300">
          <AlertIcon />
          {notification}
        </Alert>
      )}
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
            fontSize={{ base: "xl", md: "2xl" }}
            fontWeight="bold"
            fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
            _hover={{
              color: colorMode === "dark" ? "#22d3ee" : "#DC143C",
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
            <Text fontSize={{ base: "lg", md: "xl" }}>Level {user.level}</Text>
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
            <Text fontSize={{ base: "lg", md: "xl" }}>
              Daily Streak {user.streak}
            </Text>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center">
            <HeartFill
              style={{ color: "red", marginRight: "7px", marginBottom: "13px" }}
              size={"25px"}
            />
            <Text fontSize={{ base: "lg", md: "xl" }}>
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
            <Text fontSize={{ base: "lg", md: "xl" }}>
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
              <Text fontSize={{ base: "lg", md: "xl" }}>XP :</Text>
            </Box>
            <Progress
              value={(user.current_xp / user.xp_to_next_level) * 100}
              size="md"
              colorScheme="green"
              width="80%"
            />
            <Text fontSize={{ base: "md", md: "lg" }}>
              {user.current_xp}/{user.xp_to_next_level}
            </Text>
          </Box>
        </>
      )}
      {/* Level-Up Modal */}
      <Modal isOpen={isLevelUpModalOpen} onClose={handleCloseLevelUpModal}>
        <ModalOverlay />
        <ModalContent
          backgroundColor="#1A202C"
          color="white"
          borderRadius="2xl"
        >
          <ModalHeader
            fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
            textAlign="center"
            fontSize="2xl"
            color="yellow.300"
          >
            🎉 Level Up! 🎉
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="xl" textAlign="center" mb={4}>
              Congratulations, {user?.username}! You’ve reached Level{" "}
              {user?.level}.
            </Text>
            <Text fontSize="xl" textAlign="center">
              Keep up the great work!
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="cyan" onClick={handleCloseLevelUpModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* HP Loss Modal */}
      <Modal isOpen={isHpLossModalOpen} onClose={handleCloseHpLossModal}>
        <ModalOverlay />
        <ModalContent
          backgroundColor="#1A202C"
          color="white"
          borderRadius="2xl"
        >
          <ModalHeader
            fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
            textAlign="center"
            fontSize="2xl"
            color="red.500"
          >
            ⚠️ HP Loss! ⚠️
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text fontSize="xl" textAlign="center" mb={4}>
              {user?.username}, you missed some habits yesterday, and made you
              lose some HP. Stay on track and keep up with your habits to
              restore your health!
            </Text>
            <Text fontSize="xl" textAlign="center" mb={4}>
              Don't let your HP drop to 0, or you might end-up losing your XP!
            </Text>
            <Text fontSize="xl" textAlign="center">
              Keep up the great work, and don't lose focus!
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="cyan" onClick={handleCloseLevelUpModal}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserCard;
