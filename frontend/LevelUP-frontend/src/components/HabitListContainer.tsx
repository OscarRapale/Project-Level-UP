import React, { useState, useEffect } from "react";
import CreateHabitList from "./CreateHabitList/CreateHabitList";
import HabitListComponent from "./HabitList";
import useHttpRequest from "../hooks/useHttpRequest";
import { HabitList } from "./types";

const HabitListContainer: React.FC = () => {
  // State variable to store the list of habit lists
  const [habitLists, setHabitLists] = useState<HabitList[]>([]);

  // HTTP request hook for fetching habit lists
  const { sendRequest: fetchHabitLists } = useHttpRequest<HabitList[], unknown>({
    url: "http://127.0.0.1:5000/habit_lists/user",
    method: "GET",
  });

  // Fetch habit lists when the component mounts
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

  // Handle the creation of a new habit list
  const handleHabitListCreated = (id: string, name: string) => {
    setHabitLists((prevLists) => [...prevLists, { id, name, habits: [] }]);
  };

  // Handle the deletion of a habit list
  const handleHabitListDeleted = (id: string) => {
    setHabitLists((prevLists) => prevLists.filter((list) => list.id !== id));
  };

  return (
    <div>
      {/* CreateHabitList component for creating new habit lists */}
      <CreateHabitList onHabitListCreated={handleHabitListCreated} />
      {/* HabitListComponent component for displaying and managing habit lists */}
      <HabitListComponent
        habitLists={habitLists}
        setHabitLists={setHabitLists}
        onHabitListDeleted={handleHabitListDeleted}
      />
    </div>
  );
};

export default HabitListContainer;
