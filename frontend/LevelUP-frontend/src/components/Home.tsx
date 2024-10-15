import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
	<div>
	  <h1>Welcome User</h1>
	  <button onClick={() => navigate("/signup")}>Sign Up</button>
	  <button onClick={() => navigate("/login")}>Login</button>
	  <button onClick={() => navigate("/create-habit")}>Create Habit</button>
	  <button onClick={() => navigate("/user-habits")}>View Habits</button>
	  <button onClick={() => navigate("/habit-list")}>Habit List</button>
	  <button onClick={() => navigate("/categories")}>Categories</button>
	  <button onClick={() => navigate("/dashboard")}>Dashboard</button>
	</div>
  );
};

export default Home;
