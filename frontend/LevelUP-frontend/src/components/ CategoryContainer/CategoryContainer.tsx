import React, { useEffect, useState } from "react";
import useHttpRequest from "../../hooks/useHttpRequest";
import { io } from "socket.io-client";
import "./CategoryContainer.css";
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
  useColorMode,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Flex,
} from "@chakra-ui/react";

// Interface for Category
interface Category {
  name: string;
}

// Interface for PresetHabit
interface PresetHabit {
  id: string;
  description: string;
}

// Interface for HabitList
interface HabitList {
  id: string;
  name: string;
}

const CategoryContainer: React.FC = () => {
  // State variables
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [presetHabits, setPresetHabits] = useState<PresetHabit[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [habitLists, setHabitLists] = useState<HabitList[]>([]);
  const [selectedHabitListId, setSelectedHabitListId] = useState<string | null>(
    null
  );
  const [addHabitError, setAddHabitError] = useState<string | null>(null);
  const [addHabitSuccess, setAddHabitSuccess] = useState<boolean>(false);
  const [isFetchingHabits, setIsFetchingHabits] = useState<boolean>(false);

  // Fetch categories
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
    sendRequest: fetchCategories,
  } = useHttpRequest<Category[], unknown>({
    url: "http://127.0.0.1:5000/categories/",
    method: "GET",
  });

  // Fetch preset habits for the selected category
  const {
    data: presetHabitData,
    error: presetHabitError,
    sendRequest: fetchPresetHabits,
  } = useHttpRequest<PresetHabit[], unknown>({
    url: `http://127.0.0.1:5000/categories/${selectedCategory}/preset_habits`,
    method: "GET",
  });

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
    url: `http://127.0.0.1:5000/habit_lists/${selectedHabitListId}/habits`,
    method: "POST",
    body: { preset_habit_ids: selectedHabits },
  });

  const { colorMode } = useColorMode();

  // WebSocket connection to listen for habit list creation events
  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

    socket.on("habit_list_created", (habitList: HabitList) => {
      setHabitLists((prevHabitLists) => [...prevHabitLists, habitList]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch categories and habit lists on component mount
  useEffect(() => {
    fetchCategories();
    fetchHabitLists();
  }, [fetchCategories, fetchHabitLists]);

  // Update categories state when category data is fetched
  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData);
    }
  }, [categoryData]);

  // Fetch preset habits when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      setIsFetchingHabits(true);
      fetchPresetHabits();
    }
  }, [selectedCategory, fetchPresetHabits]);

  // Update preset habits state when preset habit data is fetched
  useEffect(() => {
    if (presetHabitData) {
      setPresetHabits(presetHabitData);
      setIsFetchingHabits(false);
    }
  }, [presetHabitData]);

  // Update habit lists state when habit list data is fetched
  useEffect(() => {
    if (habitListData) {
      setHabitLists(habitListData);
    }
  }, [habitListData]);

  // Handle category click
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setPresetHabits([]); // Clear the previous habits
  };

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
    <Box p={4}>
      <Heading as="h2" mb={4} fontFamily="'Orbitron', 'Exo 2', 'Lexend'">
        Categories
      </Heading>
      {categoryLoading && (
        <Alert status="info" mb={4}>
          <AlertIcon />
          Loading...
        </Alert>
      )}
      {categoryError && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {categoryError}
        </Alert>
      )}
      <Accordion allowToggle>
        {categories.map((category) => (
          <AccordionItem key={category.name}>
            <h2>
              <AccordionButton
                onClick={() => handleCategoryClick(category.name)}
              >
                <Box
                  flex="1"
                  textAlign="left"
                  fontSize="xl"
                  className={`category-name ${
                    colorMode === "dark" ? "dark-mode" : "light-mode"
                  }`}
                >
                  {category.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {isFetchingHabits && (
                <Flex justifyContent="center" mb={4}>
                  <Spinner />
                  <Text ml={2}>Loading habits...</Text>
                </Flex>
              )}
              {presetHabitError && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  {presetHabitError}
                </Alert>
              )}
              <ul>
                {presetHabits.map((habit) => (
                  <li
                    key={habit.id}
                    className={`habit-description ${
                      colorMode === "dark" ? "dark-mode" : "light-mode"
                    }`}
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
        ))}
      </Accordion>
      <Box mt={4}>
        <Text mb={2}>My Habit Lists:</Text>
        {habitListLoading && (
          <Alert status="info" mb={4}>
            <AlertIcon />
            Loading lists...
          </Alert>
        )}
        {habitListError && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {habitListError}
          </Alert>
        )}
        {!habitListLoading && !habitListError && (
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
        )}
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          onClick={handleAddHabitsToList}
          disabled={selectedHabits.length === 0}
          variant="outline"
          borderRadius="3xl"
          borderColor={colorMode === "dark" ? "#22d3ee" : "red.600"} // Change border color based on color mode
          color={colorMode === "dark" ? "#22d3ee" : "red.600"} // Change text color based on color mode
          _hover={{
            bg: colorMode === "dark" ? "#22d3ee" : "red.600",
            color: "white",
          }}
        >
          Add Selected Habits to List
        </Button>
      </Box>
      {addHabitSuccess && (
        <Alert status="success" mt={4} bg="green.400" borderRadius="lg">
          <AlertIcon />
          Habits added successfully!
        </Alert>
      )}
      {addHabitError && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {addHabitError}
        </Alert>
      )}
    </Box>
  );
};

export default CategoryContainer;
