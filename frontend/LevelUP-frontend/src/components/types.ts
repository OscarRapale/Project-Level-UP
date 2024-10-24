export interface Habit {
    id: string;
    description: string;
    type: "preset" | "custom";
  }
  
  export interface HabitList {
    id: string;
    name: string;
    habits: Habit[];
  }
