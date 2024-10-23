import React, { useEffect, useState } from "react";
import useHttpRequest from "../hooks/useHttpRequest";
import CustomHabitForm from "./ CustomHabitForm/CustomHabitForm";
import UserHabitContainer from "./CustomHabitList/CustomHabitList";

interface Habit {
  id: string;
  description: string;
}

const CustomHabitsContainer: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const { sendRequest: fetchHabits } = useHttpRequest<Habit[], unknown>({
    url: "http://127.0.0.1:5000/custom_habits/user_habits",
    method: "GET",
  });

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

  const handleHabitCreated = (habit: Habit) => {
    setHabits((prevHabits) => [...prevHabits, habit]);
  };

  return (
    <div>
      <CustomHabitForm onHabitCreated={handleHabitCreated} />
      <UserHabitContainer habits={habits} />
    </div>
  );
};

export default CustomHabitsContainer;
