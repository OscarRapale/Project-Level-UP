import { useEffect, useState } from "react";
import useHttpRequest from "../hooks/useHttpRequest";
import { useParams } from "react-router-dom";

interface Habit {
  id: string;
  description: string;
  type: "preset" | "custom";
}

interface HabitList {
  id: string;
  name: string;
}

const HabitList: React.FC = () => {
  const { habitListId } = useParams<{ habitListId: string }>();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLists, setHabitLists] = useState<HabitList[]>([]);
  const [selectedHabitListId, setSelectedHabitListId] = useState<string | null>(
    habitListId || null
  );

  const {
    data: habitListData,
    loading: habitListLoading,
    error: habitListError,
    sendRequest: fetchHabitLists,
  } = useHttpRequest<HabitList[], unknown>({
    url: "http://127.0.0.1:5000/habit_lists/user",
    method: "GET",
  });

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
    url: "", // This will be dynamically set later
    method: "POST",
  });

  useEffect(() => {
    fetchHabitLists();
  }, [fetchHabitLists]);

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
    if (habitListData) {
      setHabitLists(habitListData);
    }
  }, [habitListData]);

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

  return (
    <div className="container">
      <h2 className="my-4">All Habits</h2>
      <div className="mb-3">
        <label htmlFor="habitListSelect" className="form-label">
          Select Habit List:
        </label>
        {habitListLoading && (
          <div className="alert alert-info">Loading lists...</div>
        )}
        {habitListError && (
          <div className="alert alert-danger">{habitListError}</div>
        )}
        {!habitListLoading && !habitListError && (
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
        )}
      </div>
      {(presetLoading || customLoading) && (
        <div className="alert alert-info">Loading...</div>
      )}
      {(presetError || customError) && (
        <div className="alert alert-danger">{presetError || customError}</div>
      )}
      <ul className="list-group">
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
    </div>
  );
};

export default HabitList;
