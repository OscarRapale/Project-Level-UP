import React, { useState, useEffect } from "react";
import CreateHabitList from "./CreateHabitList/CreateHabitList";
import HabitListComponent from "./HabitList";
import useHttpRequest from "../hooks/useHttpRequest";
import { HabitList } from "./types";

const HabitListContainer: React.FC = () => {
  const [habitLists, setHabitLists] = useState<HabitList[]>([]);
  const { sendRequest: fetchHabitLists } = useHttpRequest<HabitList[], unknown>({
    url: "http://127.0.0.1:5000/habit_lists/user",
    method: "GET",
  });

  useEffect(() => {
    const loadHabitLists = async () => {
      try {
        const response = await fetchHabitLists();
        setHabitLists(response);
      } catch (error) {
        console.error("Failed to fetch habit lists:", error);
      }
    };

    loadHabitLists();
  }, [fetchHabitLists]);

  const handleHabitListCreated = (id: string, name: string) => {
    setHabitLists((prevLists) => [...prevLists, { id, name, habits: [] }]);
  };

  const handleHabitListDeleted = (id: string) => {
    setHabitLists((prevLists) => prevLists.filter((list) => list.id !== id));
  };

  return (
    <div>
      <CreateHabitList onHabitListCreated={handleHabitListCreated} />
      <HabitListComponent
        habitLists={habitLists}
        setHabitLists={setHabitLists}
        onHabitListDeleted={handleHabitListDeleted}
      />
    </div>
  );
};

export default HabitListContainer;
