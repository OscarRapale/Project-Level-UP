import React, { useEffect, useState } from "react";
import useHttpRequest from "../hooks/useHttpRequest";
import CustomHabitForm from "./ CustomHabitForm/CustomHabitForm";
import UserHabitContainer from "./CustomHabitList/CustomHabitList";

// Interface for Habit
interface Habit {
  id: string;
  description: string;
}

const CustomHabitsContainer: React.FC = () => {
  // State variable to store the list of habits
  const [habits, setHabits] = useState<Habit[]>([]);

  // HTTP request hook for fetching user habits
  const { sendRequest: fetchHabits } = useHttpRequest<Habit[], unknown>({
    url: "https://level-up-backend-x0lt.onrender.com//custom_habits/user_habits",
    method: "GET",
  });

  // Fetch habits when the component mounts
  useEffect(() => {
    const loadHabits = async () => {
      try {
        const response = await fetchHabits();
        setHabits(response);
      } catch (error) {
        console.error("Failed to fetch habits:", error);
      }
    };

    loadHabits();
  }, [fetchHabits]);

  // Handle the creation of a new habit
  const handleHabitCreated = (habit: Habit) => {
    setHabits((prevHabits) => [...prevHabits, habit]);
  };

  return (
    <div>
      {/* CustomHabitForm component for creating new habits */}
      <CustomHabitForm onHabitCreated={handleHabitCreated} />
      {/* UserHabitContainer component for displaying the list of habits */}
      <UserHabitContainer habits={habits} />
    </div>
  );
};

export default CustomHabitsContainer;
