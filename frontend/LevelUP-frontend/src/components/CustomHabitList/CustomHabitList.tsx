import React, { useEffect, useState } from "react";
import "./CustomHabitList.css";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Checkbox,
  Button,
  Select,
  useColorMode
} from "@chakra-ui/react";
import useHttpRequest from "../../hooks/useHttpRequest";
import { HabitList } from "../types";
import { io } from "socket.io-client";

// Interface for Habit
interface Habit {
  id: string;
  description: string;
}

// Props interface for UserHabitContainer component
interface UserHabitContainerProps {
  habits: Habit[];
}

const UserHabitContainer: React.FC<UserHabitContainerProps> = ({ habits }) => {
  // State variables
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [habitLists, setHabitLists] = useState<HabitList[]>([]);
  const [selectedHabitListId, setSelectedHabitListId] = useState<string | null>(
    null
  );
  const [addHabitError, setAddHabitError] = useState<string | null>(null);
  const [addHabitSuccess, setAddHabitSuccess] = useState<boolean>(false);
  const [isFetchingHabits, setIsFetchingHabits] = useState<boolean>(false);

  // Fetch habit lists for the user
  const {
    data: habitListData,
    loading: habitListLoading,
    error: habitListError,
    sendRequest: fetchHabitLists,
  } = useHttpRequest<HabitList[], unknown>({
    url: "http://127.0.0.1:5000/habit_lists/user",
    method: "GET",
  });

  // Add selected habits to the selected habit list
  const { sendRequest: addHabitsRequest } = useHttpRequest({
    url: `http://127.0.0.1:5000/habit_lists/${selectedHabitListId}/custom_habits`,
    method: "POST",
    body: { custom_habit_ids: selectedHabits },
  });

  const { colorMode } = useColorMode(); // Get the current color mode

  // WebSocket connection to listen for habit list creation events
  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

    socket.on("habit_list_created", (habitList: HabitList) => {
      setHabitLists((prevHabitLists) => [...prevHabitLists, habitList]);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  // Fetch habit lists on component mount
  useEffect(() => {
    setIsFetchingHabits(true);
    fetchHabitLists();
  }, [fetchHabitLists]);

  // Update habit lists state when habit list data is fetched
  useEffect(() => {
    if (habitListData) {
      setHabitLists(habitListData);
      setIsFetchingHabits(false);
    }
  }, [habitListData]);

  // Handle checkbox change for selecting habits
  const handleCheckboxChange = (habitId: string) => {
    setSelectedHabits((prevSelected) =>
      prevSelected.includes(habitId)
        ? prevSelected.filter((id) => id !== habitId)
        : [...prevSelected, habitId]
    );
  };

  // Handle adding selected habits to the selected habit list
  const handleAddHabitsToList = async () => {
    if (!selectedHabitListId) {
      setAddHabitError("Please select a habit list first.");
      return;
    }

    try {
      await addHabitsRequest();
      setAddHabitSuccess(true);
      setAddHabitError(null);
    } catch {
      setAddHabitError("Failed to add habits to the list.");
      setAddHabitSuccess(false);
    }
  };

  return (
    <div>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box
               flex="1"
               textAlign="left"
               id="habits-box"
               fontSize="xl"
               className={`habits-box ${colorMode === 'dark' ? 'dark-mode' : 'light-mode'}`}
               >
                My Habits
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {isFetchingHabits && <div>Loading habits...</div>}
            <ul>
              {habits.map((habit) => (
                <li
                 key={habit.id}
                 id="habits-description"
                 className={`habits-description ${colorMode === 'dark' ? 'dark-mode' : 'light-mode'}`}
                 >
                  <Checkbox
                    isChecked={selectedHabits.includes(habit.id)}
                    onChange={() => handleCheckboxChange(habit.id)}
                  >
                    {habit.description}
                  </Checkbox>
                </li>
              ))}
            </ul>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <div id="list-select">
        <label htmlFor="habitListSelect">My Habit Lists:</label>
        {habitListLoading && <div>Loading lists...</div>}
        {habitListError && <div>{habitListError}</div>}
        {!habitListLoading && !habitListError && (
          <Select
            id="habitListSelect"
            value={selectedHabitListId || ""}
            onChange={(e) => setSelectedHabitListId(e.target.value)}
          >
            <option value="" disabled>
              Select a habit list
            </option>
            {habitLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </Select>
        )}
      </div>
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          onClick={handleAddHabitsToList}
          disabled={selectedHabits.length === 0}
          variant="outline"
          borderRadius="3xl"
          borderColor={colorMode === 'dark' ? '#22d3ee' : 'red.600'} // Change border color based on color mode
          color={colorMode === 'dark' ? '#22d3ee' : 'red.600'} // Change text color based on color mode
          _hover={{
            bg: colorMode === 'dark' ? '#22d3ee' : 'red.600',
            color: 'white',
          }}
        >
          Add Selected Habits to List
        </Button>
      </Box>
      {addHabitSuccess && (
        <div className="alert alert-success mt-3">
          Habits added successfully!
        </div>
      )}
      {addHabitError && (
        <div className="alert alert-danger mt-3">{addHabitError}</div>
      )}
    </div>
  );
};

export default UserHabitContainer;
