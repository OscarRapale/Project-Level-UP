import { useUser } from "../hooks/useUser";
import useHttpRequest from "../hooks/useHttpRequest";
import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
  Flex,
  Avatar,
  Badge,
  Grid,
  GridItem,
  Stack,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import {
  Fire,
  CheckCircleFill,
  LightningChargeFill,
} from "react-bootstrap-icons";

interface User {
  id: string;
  username: string;
  email: string;
  level: number;
  hp: number;
  max_hp: number;
  current_xp: number;
  xp_to_next_level: number;
  streak: number;
  habits_completed: number;
  strenght: number;
  vitality: number;
  dexterity: number;
  intelligence: number;
  luck: number;
}

const UserProfile: React.FC = () => {
  const { userId } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<
    Partial<
      User & {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      }
    >
  >({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const toast = useToast();

  const {
    data: userData,
    loading: userLoading,
    error: userError,
    sendRequest: fetchUser,
  } = useHttpRequest<User, unknown>({
    url: `http://127.0.0.1:5000/users/${userId}`,
    method: "GET",
  });

  const {
    sendRequest: updateUser,
    loading: updateLoading,
    error: updateError,
  } = useHttpRequest<
    User,
    Partial<
      User & {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      }
    >
  >({
    url: `http://127.0.0.1:5000/users/${userId}`,
    method: "PUT",
  });

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [fetchUser, userId]);

  useEffect(() => {
    if (userData) {
      setUser(userData);
      setFormData(userData);
    }
  }, [userData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    try {
      const updatedUser = await updateUser({ body: formData });
      setUser(updatedUser);
      toast({
        title: "Profile updated successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Update failed",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <Grid
      templateAreas={`
        "userBasics userBasics"
        "hpCard hpCard"
        "strCard vitCard"
        "dxtCard intCard"
        "luckCard luckCard"
      `}
      gridTemplateColumns={"1fr 1fr"}
      gap={4}
      p={4}
      alignItems="start"
      justifyContent="center"
    >
      <GridItem area={"userBasics"}>
        <Box
          bg="#333"
          p={20}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w="50%"
          h="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          color="white"
          margin="0 auto"
          marginTop="10rem"
          animation="float 3s ease-in-out infinite"
          fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
        >
          {userLoading && <Spinner />}
          {userError && (
            <Alert status="error">
              <AlertIcon />
              {userError}
            </Alert>
          )}
          {user && (
            <Stack spacing={4} align="center" w="100%">
              <Avatar name={user.username} size="2xl" mb={4} />
              <Text fontSize="3xl" fontWeight="bold" mb={4}>
                {user.username}
              </Text>
              <Text fontSize="2xl" mb={4}>
                Email: {user.email}
              </Text>
              <Badge colorScheme="teal" fontSize="1.5rem">
                Level {user.level}
              </Badge>
              <Flex w="100%" justifyContent="center" mt={4}>
                <Box>
                  <Flex alignItems="center" mb={4}>
                    <Fire
                      style={{
                        color: "orange",
                        marginLeft: "40px",
                        marginRight: "5px",
                        marginBottom: "16px",
                      }}
                      size={"25px"}
                    />
                    <Text fontSize="2xl">Daily Streak: {user.streak}</Text>
                  </Flex>
                  <Flex alignItems="center" mb={4}>
                    <CheckCircleFill
                      style={{
                        color: "#7FFFD4",
                        marginRight: "8px",
                        marginBottom: "13px",
                      }}
                      size={"25px"}
                    />
                    <Text fontSize="2xl">
                      Habits Completed: {user.habits_completed}
                    </Text>
                  </Flex>
                </Box>
              </Flex>
              <Box w="100%" mt={4} textAlign="center">
                <Flex alignItems="center" justifyContent="center" mb={4}>
                  <LightningChargeFill
                    style={{
                      color: "gold",
                      marginRight: "8px",
                      marginBottom: "13px",
                    }}
                    size={"25px"}
                  />
                  <Text fontSize="xl">
                    XP: {user.current_xp}/{user.xp_to_next_level}
                  </Text>
                </Flex>
                <Progress
                  value={(user.current_xp / user.xp_to_next_level) * 100}
                  size="md"
                  colorScheme="green"
                  mb={4}
                />
              </Box>
              <Button
                onClick={toggleFormVisibility}
                mb={4}
                variant="outline"
                borderColor="gold"
                borderRadius="50px"
                color="gold"
                _hover={{
                  bg: "#FFBF00",
                  color: "white",
                }}
              >
                {isFormVisible ? "Hide" : "Show"}
              </Button>
              {isFormVisible && (
                <form onSubmit={handleSubmit}>
                  <h2>Edit Profile</h2>
                  <Stack spacing={4} align="center" w="100%">
                    <FormControl id="username">
                      <FormLabel>Username</FormLabel>
                      <Input
                        name="username"
                        value={formData.username || ""}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    <FormControl id="email">
                      <FormLabel>Email</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email || ""}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    <FormControl id="currentPassword">
                      <FormLabel>Current Password</FormLabel>
                      <Input
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword || ""}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    <FormControl id="newPassword">
                      <FormLabel>New Password</FormLabel>
                      <Input
                        name="newPassword"
                        type="password"
                        value={formData.newPassword || ""}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    <FormControl id="confirmPassword">
                      <FormLabel>Confirm New Password</FormLabel>
                      <Input
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword || ""}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      variant="outline"
                      borderColor="gold"
                      borderRadius="50px"
                      color="gold"
                      _hover={{
                        bg: "#FFBF00",
                        color: "white"
                      }}
                      isLoading={updateLoading}
                    >
                      Edit Profile
                    </Button>
                    {updateError && (
                      <Alert status="error">
                        <AlertIcon />
                        {updateError}
                      </Alert>
                    )}
                  </Stack>
                </form>
              )}
            </Stack>
          )}
        </Box>
      </GridItem>

      {user && (
        <>
          <GridItem area={"hpCard"}>
            <Box
              bg="#333"
              p={20}
              borderRadius="2xl"
              boxShadow="2xl"
              _hover={{
                boxShadow: "2xl",
                color: "#DC143C",
              }}
              w="20%"
              h="auto"
              color="white"
              margin="0 auto"
              textAlign="center"
              fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
              animation="float 3s ease-in-out infinite"
            >
              <Text fontSize="3xl" fontWeight="bold" mb={7}>
                HP
              </Text>
              <Text fontSize="3xl">
                {user.hp}/{user.max_hp}
              </Text>
            </Box>
          </GridItem>

          <GridItem area={"strCard"}>
            <Box
              bg="#333"
              p={20}
              borderRadius="2xl"
              boxShadow="2xl"
              _hover={{
                boxShadow: "2xl",
                color: "#7DF9FF",
              }}
              w="40%"
              h="auto"
              color="white"
              margin="0 auto"
              mr="43px"
              fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
              textAlign="center"
              animation="float 3s ease-in-out infinite"
            >
              <Text fontSize="3xl" fontWeight="bold" mb={7}>
                Strength
              </Text>
              <Text fontSize="3xl">{user.strenght}</Text>
            </Box>
          </GridItem>

          <GridItem area={"vitCard"}>
            <Box
              bg="#333"
              p={20}
              borderRadius="2xl"
              boxShadow="2xl"
              _hover={{
                boxShadow: "2xl",
                color: "#7FFFD4",
              }}
              w="40%"
              h="auto"
              color="white"
              margin="0 auto"
              ml="43px"
              fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
              textAlign="center"
              animation="float 3s ease-in-out infinite"
            >
              <Text fontSize="3xl" fontWeight="bold" mb={7}>
                Vitality
              </Text>
              <Text fontSize="3xl">{user.vitality}</Text>
            </Box>
          </GridItem>

          <GridItem area={"dxtCard"}>
            <Box
              bg="#333"
              p={20}
              borderRadius="2xl"
              boxShadow="2xl"
              _hover={{
                boxShadow: "2xl",
                color: "#FF5F1F",
              }}
              w="40%"
              h="auto"
              color="white"
              margin="0 auto"
              mr="43px"
              fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
              textAlign="center"
              animation="float 3s ease-in-out infinite"
            >
              <Text fontSize="3xl" fontWeight="bold" mb={7}>
                Dexterity
              </Text>
              <Text fontSize="3xl">{user.dexterity}</Text>
            </Box>
          </GridItem>

          <GridItem area={"intCard"}>
            <Box
              bg="#333"
              p={20}
              borderRadius="2xl"
              boxShadow="2xl"
              _hover={{
                boxShadow: "2xl",
                color: "gold",
              }}
              w="40%"
              h="auto"
              color="white"
              margin="0 auto"
              ml="43px"
              fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
              textAlign="center"
              animation="float 3s ease-in-out infinite"
            >
              <Text fontSize="3xl" fontWeight="bold" mb={7}>
                Intelligence
              </Text>
              <Text fontSize="3xl">{user.intelligence}</Text>
            </Box>
          </GridItem>

          <GridItem area={"luckCard"}>
            <Box
              bg="#333"
              p={20}
              borderRadius="2xl"
              boxShadow="2xl"
              _hover={{
                boxShadow: "2xl",
                color: "#FF69B4",
              }}
              w="20%"
              h="auto"
              color="white"
              margin="0 auto"
              fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
              textAlign="center"
              animation="float 3s ease-in-out infinite"
            >
              <Text fontSize="3xl" fontWeight="bold" mb={7}>
                Luck
              </Text>
              <Text fontSize="3xl">{user.luck}</Text>
            </Box>
          </GridItem>
        </>
      )}
    </Grid>
  );
};

export default UserProfile;
