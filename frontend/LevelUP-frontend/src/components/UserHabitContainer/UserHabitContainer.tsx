import { useEffect, useState } from "react";
import useHttpRequest from "../../hooks/useHttpRequest";
import "./UserHabitContainer.css";
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
} from "@chakra-ui/react";

interface Habit {
  id: string;
  description: string;
}

interface HabitList {
  id: string;
  name: string;
}

const UserHabitContainer = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [habitLists, setHabitLists] = useState<HabitList[]>([]);
  const [selectedHabitListId, setSelectedHabitListId] = useState<string | null>(
    null
  );
  const [addHabitError, setAddHabitError] = useState<string | null>(null);
  const [addHabitSuccess, setAddHabitSuccess] = useState<boolean>(false);
  const [isFetchingHabits, setIsFetchingHabits] = useState<boolean>(false);

  const {
    data: habitData,
    loading: habitLoading,
    error: habitError,
    sendRequest: fetchHabits,
  } = useHttpRequest<Habit[], unknown>({
    url: "http://127.0.0.1:5000/custom_habits/user_habits",
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
    url: `http://127.0.0.1:5000/habit_lists/${selectedHabitListId}/custom_habits`,
    method: "POST",
    body: { custom_habit_ids: selectedHabits },
  });

  useEffect(() => {
    setIsFetchingHabits(true);
    fetchHabits();
    fetchHabitLists();
  }, [fetchHabits, fetchHabitLists]);

  useEffect(() => {
    if (habitData) {
      setHabits(habitData);
      setIsFetchingHabits(false);
    }
  }, [habitData]);

  useEffect(() => {
    if (habitListData) {
      setHabitLists(habitListData);
    }
  }, [habitListData]);

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
      {habitLoading && <div>Loading...</div>}
      {habitError && <div>{habitError}</div>}
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" id="habits-box">
                My Habits
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            {isFetchingHabits && <div>Loading habits...</div>}
            {habitError && <div>{habitError}</div>}
            <ul>
              {habits.map((habit) => (
                <li key={habit.id} id="habits-description">
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
          borderColor="red.800"
          borderRadius="50px"
          color="red.800"
          _hover={{
            bg: "red.800",
            color: "white"
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
