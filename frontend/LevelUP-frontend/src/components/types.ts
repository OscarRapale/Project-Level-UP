// Interface representing a habit
export interface Habit {
  id: string; // Unique identifier for the habit
  description: string; // Description of the habit
  type: "preset" | "custom"; // Type of the habit, either preset or custom
}

// Interface representing a habit list
export interface HabitList {
  id: string; // Unique identifier for the habit list
  name: string; // Name of the habit list
  habits: Habit[]; // Array of habits associated with the habit list
}
