import React, { useState } from "react";
import useHttpRequest from "../../hooks/useHttpRequest";
import "./CreateHabitList.css";

interface CreateHabitListProps {
  onHabitListCreated: (id: string, name: string) => void;
}

const CreateHabitList: React.FC<CreateHabitListProps> = ({
  onHabitListCreated,
}) => {
  const [habitListName, setHabitListName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { sendRequest } = useHttpRequest<{ id: string }, { name: string }>({
    url: "http://127.0.0.1:5000/habit_lists",
    method: "POST",
    body: { name: habitListName },
  });

  const handleCreateHabitList = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await sendRequest();
      onHabitListCreated(response.id, habitListName);
      setHabitListName("");
      setError(null);
    } catch {
      setError("Failed to create habit list.");
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateHabitList}>
        <input
          id="list-name-input"
          type="text"
          value={habitListName}
          onChange={(e) => setHabitListName(e.target.value)}
          placeholder="Enter habit list name"
          required
        />
        <button 
          id="create-btn"
          type="submit"
          className="btn btn-outline-danger complete-button"
        >
          Create Habit List
        </button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default CreateHabitList;
