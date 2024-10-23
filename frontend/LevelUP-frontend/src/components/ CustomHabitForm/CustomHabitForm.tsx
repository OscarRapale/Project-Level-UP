import useHttpRequest from "../../hooks/useHttpRequest";
import { z } from "zod";
import { useState } from "react";
import "./CustomHabitForm.css";

const habitSchema = z.object({
  description: z
    .string()
    .min(1, "Habit description is required")
    .max(200, "Habit description must be at most 200 characters"),
});

interface CustomHabitFormProps {
  onHabitCreated: (habit: { id: string; description: string }) => void;
}

const CustomHabitForm: React.FC<CustomHabitFormProps> = ({ onHabitCreated }) => {
  const [habitDescription, setHabitDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { data, loading, error, sendRequest } = useHttpRequest<
    { id: string; description: string },
    { description: string }
  >({
    url: "http://127.0.0.1:5000/custom_habits",
    method: "POST",
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = habitSchema.safeParse({ description: habitDescription });

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const response = await sendRequest({ body: { description: habitDescription } });
    if (response) {
      onHabitCreated(response);
      setHabitDescription("");
    }
  };

  return (
    <div className="container mt-2">
      <h2 id="new-habit-header">Create a New Habit</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="habitDescription"
            className="form-control"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          id="create-habit-btn"
          className="btn btn-outline-danger complete-button"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Habit"}
        </button>
      </form>
      {validationErrors.length > 0 && (
        <div className="alert alert-danger mt-3">
          <ul className="mb-0">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {data && (
        <div className="alert alert-success mt-3">
          Habit created successfully!
        </div>
      )}
    </div>
  );
};

export default CustomHabitForm;
