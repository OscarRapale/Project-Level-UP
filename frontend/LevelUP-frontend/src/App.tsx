import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Home from "./components/Home";
import CustomHabitForm from "./components/ CustomHabitForm/CustomHabitForm";
import CreateHabitList from "./components/CreateHabitList/CreateHabitList";
import UserHabitContainer from "./components/UserHabitContainer/UserHabitContainer";
import HabitList from "./components/HabitList";
import CategoryContainer from "./components/ CategoryContainer/CategoryContainer";
import Dashboard from "./components/Dashboard/Dashboard";

const App: React.FC = () => {
  const handleHabitListCreated = (id: string) => {
    console.log("Habit list created with ID:", id);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-habit" element={<CustomHabitForm />} />
        <Route path="/user-habits/" element={<UserHabitContainer />} />
        <Route
          path="/create-habit-list"
          element={
            <CreateHabitList onHabitListCreated={handleHabitListCreated} />
          }
        />
        <Route path="/habit-list/" element={<HabitList />} />
        <Route path="/categories" element={<CategoryContainer />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
