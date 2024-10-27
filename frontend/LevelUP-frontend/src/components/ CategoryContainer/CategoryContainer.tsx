import React, { useEffect, useState } from "react";
import useHttpRequest from "../../hooks/useHttpRequest";
import "./CategoryContainer.css";
import { io } from "socket.io-client";
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

interface Category {
  name: string;
}

interface PresetHabit {
  id: string;
  description: string;
}

interface HabitList {
  id: string;
  name: string;
}

const CategoryContainer: React.FC = () => {
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

  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
    sendRequest: fetchCategories,
  } = useHttpRequest<Category[], unknown>({
    url: "http://127.0.0.1:5000/categories/",
    method: "GET",
  });

  const {
    data: presetHabitData,
    error: presetHabitError,
    sendRequest: fetchPresetHabits,
  } = useHttpRequest<PresetHabit[], unknown>({
    url: `http://127.0.0.1:5000/categories/${selectedCategory}/preset_habits`,
    method: "GET",
  });

  const {
    data: habitListData,
    loading: habitListLoading,
    error: habitListError,
    sendRequest: fetchHabitLists,
  } = useHttpRequest<HabitList[], unknown>({
    url: "http://127.0.0.1:5000/habit_lists/user",
    method: "GET",
  });

  const { sendRequest: addHabitsRequest } = useHttpRequest({
    url: `http://127.0.0.1:5000/habit_lists/${selectedHabitListId}/habits`,
    method: "POST",
    body: { preset_habit_ids: selectedHabits },
  });

  const { colorMode } = useColorMode();

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

    socket.on("habit_list_created", (habitList: HabitList) => {
      setHabitLists((prevHabitLists) => [...prevHabitLists, habitList]);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchHabitLists();
  }, [fetchCategories, fetchHabitLists]);

  useEffect(() => {
    if (categoryData) {
      setCategories(categoryData);
    }
  }, [categoryData]);

  useEffect(() => {
    if (selectedCategory) {
      setIsFetchingHabits(true);
      fetchPresetHabits();
    }
  }, [selectedCategory, fetchPresetHabits]);

  useEffect(() => {
    if (presetHabitData) {
      setPresetHabits(presetHabitData);
      setIsFetchingHabits(false);
    }
  }, [presetHabitData]);

  useEffect(() => {
    if (habitListData) {
      setHabitLists(habitListData);
    }
  }, [habitListData]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setPresetHabits([]); // Clear the previous habits
  };

  const handleCheckboxChange = (habitId: string) => {
    setSelectedHabits((prevSelected) =>
      prevSelected.includes(habitId)
        ? prevSelected.filter((id) => id !== habitId)
        : [...prevSelected, habitId]
    );
  };

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
      <h2 id="category-title">Categories</h2>
      {categoryLoading && <div>Loading...</div>}
      {categoryError && <div>{categoryError}</div>}
      <Accordion allowToggle id="category-accordion">
        {categories.map((category) => (
          <AccordionItem key={category.name}>
            <h2>
              <AccordionButton
                onClick={() => handleCategoryClick(category.name)}
              >
                <Box
                 flex="1"
                  textAlign="left"
                  id="category-name"
                  className={`category-name ${colorMode === 'dark' ? 'dark-mode' : 'light-mode'}`}
                  >
                  {category.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {isFetchingHabits && <div>Loading habits...</div>}
              {presetHabitError && <div>{presetHabitError}</div>}
              <ul>
                {presetHabits.map((habit) => (
                  <li 
                    key={habit.id}
                    id="habit-description"
                    className={`habit-description ${colorMode === 'dark' ? 'dark-mode' : 'light-mode'}`}
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
          borderColor={colorMode === 'dark' ? '#22d3ee' : 'red.800'} // Change border color based on color mode
          color={colorMode === 'dark' ? '#22d3ee' : 'red.800'} // Change text color based on color mode
          _hover={{
            bg: colorMode === 'dark' ? '#22d3ee' : '#red800',
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

export default CategoryContainer;
