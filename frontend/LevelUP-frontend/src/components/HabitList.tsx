import { useEffect, useState } from "react";
import useHttpRequest from "../hooks/useHttpRequest";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Habit, HabitList } from "./types";

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

  const {
    data: presetData,
    loading: presetLoading,
    error: presetError,
    sendRequest: sendPresetRequest,
  } = useHttpRequest<Habit[], unknown>({
    url: `http://127.0.0.1:5000/habit_lists/${selectedHabitListId}/habits`,
    method: "GET",
  });

  const {
    data: customData,
    loading: customLoading,
    error: customError,
    sendRequest: sendCustomRequest,
  } = useHttpRequest<Habit[], unknown>({
    url: `http://127.0.0.1:5000/habit_lists/${selectedHabitListId}/custom_habits`,
    method: "GET",
  });

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

  useEffect(() => {
    if (selectedHabitListId) {
      sendPresetRequest();
      sendCustomRequest();
    }
  }, [selectedHabitListId, sendPresetRequest, sendCustomRequest]);

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

  useEffect(() => {
    const socket = io("http://127.0.0.1:5000");

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

  const handleCompleteHabit = async (
    habitId: string,
    type: "preset" | "custom"
  ) => {
    const url = `http://127.0.0.1:5000/habit_lists/${selectedHabitListId}/${
      type === "preset" ? "habits" : "custom_habits"
    }/${habitId}/complete`;
    try {
      await completeHabitRequest({ url });
      setHabits(habits.filter((habit) => habit.id !== habitId));
    } catch (error) {
      console.error("Error completing habit:", error);
    }
  };

  const handleDeleteHabitList = async (habitListId: string) => {
    const url = `http://127.0.0.1:5000/habit_lists/${habitListId}`;
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
    <div className="container">
      <h2
        className="my-4"
        style={{ fontFamily: "'Orbitron', 'Exo 2', 'Lexend'" }}
      >
        All Habits
      </h2>
      <div className="mb-3">
        <label htmlFor="habitListSelect" className="form-label">
          Select Habit List:
        </label>
        <select
          id="habitListSelect"
          className="form-select"
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
        </select>
      </div>
      {(presetLoading || customLoading) && (
        <div className="alert alert-info">Loading...</div>
      )}
      {(presetError || customError) && (
        <div className="alert alert-danger">{presetError || customError}</div>
      )}
      <ul className="list-group" style={{ width: "130%", height: "auto" }}>
        {habits.length > 0 ? (
          habits.map((habit) => (
            <li
              key={habit.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <p className="mb-0">{habit.description}</p>
              <button
                className="btn btn-outline-success complete-button"
                onClick={() => handleCompleteHabit(habit.id, habit.type)}
              >
                Complete
              </button>
            </li>
          ))
        ) : (
          <li className="list-group-item">No habits found for this list.</li>
        )}
      </ul>
      <h3
        className="my-4"
        style={{ fontFamily: "'Orbitron', 'Exo 2', 'Lexend'" }}
      >
        Delete Habit Lists
      </h3>
      <ul className="list-group mt-3">
        {habitLists.map((list) => (
          <li
            key={list.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{list.name}</span>
            <button
              className="btn btn-outline-danger"
              onClick={() => handleDeleteHabitList(list.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HabitListComponent;
