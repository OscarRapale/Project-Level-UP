import { useEffect, useState } from "react";
import useHttpRequest from "../hooks/useHttpRequest";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Habit, HabitList } from "./types";
import {
  Box,
  Heading,
  Select,
  Alert,
  AlertIcon,
  List,
  ListItem,
  Button,
  Text,
  Flex,
} from "@chakra-ui/react";

// Props interface for HabitListComponent
interface HabitListComponentProps {
  habitLists: HabitList[];
  setHabitLists: React.Dispatch<React.SetStateAction<HabitList[]>>;
  onHabitListDeleted: (id: string) => void;
}

const HabitListComponent: React.FC<HabitListComponentProps> = ({
  habitLists,
  setHabitLists,
  onHabitListDeleted,
}) => {
  const { habitListId } = useParams<{ habitListId: string }>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitListId, setSelectedHabitListId] = useState<string | null>(
    habitListId || null
  );

  // HTTP request hooks for fetching preset and custom habits
  const {
    data: presetData,
    loading: presetLoading,
    error: presetError,
    sendRequest: sendPresetRequest,
  } = useHttpRequest<Habit[], unknown>({
    url: `https://level-up-backend-x0lt.onrender.com//habit_lists/${selectedHabitListId}/habits`,
    method: "GET",
  });

  const {
    data: customData,
    loading: customLoading,
    error: customError,
    sendRequest: sendCustomRequest,
  } = useHttpRequest<Habit[], unknown>({
    url: `https://level-up-backend-x0lt.onrender.com//habit_lists/${selectedHabitListId}/custom_habits`,
    method: "GET",
  });

  // HTTP request hooks for completing and deleting habits
  const { sendRequest: completeHabitRequest } = useHttpRequest<
    unknown,
    unknown
  >({
    url: "", // This will be dynamically set
    method: "POST",
  });

  const { sendRequest: deleteHabitListRequest } = useHttpRequest<
    unknown,
    unknown
  >({
    url: "", // This will be dynamically set
    method: "DELETE",
  });

  // Fetch habits when the selected habit list changes
  useEffect(() => {
    if (selectedHabitListId) {
      sendPresetRequest();
      sendCustomRequest();
    }
  }, [selectedHabitListId, sendPresetRequest, sendCustomRequest]);

  // Update habits state when preset or custom habit data is fetched
  useEffect(() => {
    if (presetData || customData) {
      const presetHabits: Habit[] = (presetData || []).map((habit) => ({
        ...habit,
        type: "preset",
      }));
      const customHabits: Habit[] = (customData || []).map((habit) => ({
        ...habit,
        type: "custom",
      }));
      setHabits([...presetHabits, ...customHabits]);
    }
  }, [presetData, customData]);

  // WebSocket connection to listen for habit list updates
  useEffect(() => {
    const socket = io("https://level-up-backend-x0lt.onrender.com/");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("habit_list_update", (data: { habit_list_id: string; habit_list_data: HabitList }) => {
      console.log("Received habit_list_update event", data);
      if (data.habit_list_id === selectedHabitListId) {
        setHabitLists((prevLists) =>
          prevLists.map((list) =>
            list.id === data.habit_list_id ? data.habit_list_data : list
          )
        );
        console.log("Updated habit list data:", data.habit_list_data.habits);
        setHabits(data.habit_list_data.habits || []);
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedHabitListId, setHabitLists]);

  // Handle completing a habit
  const handleCompleteHabit = async (
    habitId: string,
    type: "preset" | "custom"
  ) => {
    const url = `https://level-up-backend-x0lt.onrender.com//habit_lists/${selectedHabitListId}/${
      type === "preset" ? "habits" : "custom_habits"
    }/${habitId}/complete`;
    try {
      console.log("Completing habit:", { habitId, type, url });
      await completeHabitRequest({ url });
      setHabits(habits.filter((habit) => habit.id !== habitId));
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  // Handle deleting a habit list
  const handleDeleteHabitList = async (habitListId: string) => {
    const url = `https://level-up-backend-x0lt.onrender.com//habit_lists/${habitListId}`;
    try {
      await deleteHabitListRequest({ url });
      onHabitListDeleted(habitListId);
      if (selectedHabitListId === habitListId) {
        setSelectedHabitListId(null);
        setHabits([]);
      }
    } catch (error) {
      console.error("Error deleting habit list:", error);
    }
  };

  return (
    <Box p={4}>
      <Heading as="h2" mb={4} fontFamily="'Orbitron', 'Exo 2', 'Lexend'">
        Today's Habits
      </Heading>
      <Box mb={3}>
        <Text mb={2}>Select Habit List:</Text>
        <Select
          placeholder="Select a habit list"
          value={selectedHabitListId || ""}
          onChange={(e) => setSelectedHabitListId(e.target.value)}
        >
          {habitLists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </Select>
      </Box>
      {(presetLoading || customLoading) && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          Loading...
        </Alert>
      )}
      {(presetError || customError) && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {presetError || customError}
        </Alert>
      )}
      <List spacing={3} mb={4}>
        {habits.length > 0 ? (
          habits.map((habit) => (
            <ListItem
              className="habit-description"
              key={habit.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={3}
              bg="white"
              color="black"
              borderRadius="md"
              boxShadow="md"
              fontSize={{ base: "md", md: "xl" }}
              h="auto"
              flexDirection={{ base: "column", md: "row" }}
            >
              <Text>{habit.description}</Text>
              <Button
                variant="outline"
                color="green.400"
                borderColor="green.400"
                _hover={{
                  borderColor: "green.500",
                  backgroundColor: "green.500",
                  color: "white",
                  textDecoration: "none",
                }}
                mt={{ base: 2, md: 0 }}
                ml={{ base: 0, md: 4 }} 
                onClick={() => handleCompleteHabit(habit.id, habit.type)}
              >
                Complete
              </Button>
            </ListItem>
          ))
        ) : (
          <ListItem>No habits found for this list.</ListItem>
        )}
      </List>
      <Heading
        as="h3"
        textAlign="center"
        mt={10}
        mb={4}
        fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
      >
        Delete Habit Lists
      </Heading>
      <Flex direction="column" alignItems="center">
        <List spacing={3} w="100%" maxW="600px">
          {habitLists.map((list) => (
            <ListItem
              key={list.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              p={3}
              bg="white"
              color="black"
              borderRadius="md"
              boxShadow="md"
              h="auto"
              fontSize={{ base: "md", md: "xl" }}
              flexDirection={{ base: "column", md: "row" }}
            >
              <Text>{list.name}</Text>
              <Button
                variant="outline"
                borderColor="red.500"
                color="red.500"
                _hover={{
                  borderColor: "red.600",
                  backgroundColor: "red.600",
                  color: "white",
                }}
                mt={{ base: 2, md: 0 }}
                onClick={() => handleDeleteHabitList(list.id)}
              >
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
      </Flex>
    </Box>
  );
};

export default HabitListComponent;
