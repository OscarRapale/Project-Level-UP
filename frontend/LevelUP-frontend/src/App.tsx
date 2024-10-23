import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard/Dashboard";
import { UserProvider } from "./context/UserContext";
import NavBar from "./components/NavBar";
import Login from "./components/Login/Login";
import Signup from "./components/Signup/Signup";
import Leaderboard from "./components/Leaderboard";
import UserProfile from "./components/UserProfile";

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
