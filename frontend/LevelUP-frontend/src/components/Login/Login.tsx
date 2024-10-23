import React, { useEffect, useState } from "react";
import { z } from "zod";
import useHttpRequest from "../../hooks/useHttpRequest";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import "./Login.css";

// Zod schema for login form
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Invalid password"),
});

type LoginData = z.infer<typeof loginSchema>;

const Login = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { data, loading, error, sendRequest } = useHttpRequest<
    { access_token: string, user_id: string },
    LoginData
  >({
    url: "http://127.0.0.1:5000/login",
    method: "POST",
    body: formData,
  });

  const navigate = useNavigate();
  const { setUserId } = useUser();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    await sendRequest();
  };

  useEffect(() => {
    if (data) {
      localStorage.setItem("token", data.access_token);
      setUserId(data.user_id); // Set the user ID in the context and localStorage
      navigate("/");
    }
  }, [data, navigate, setUserId]);

  return (
    <div className="login-wrapper">
      <div className="container mt-5">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
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
        {data && <div className="alert alert-success mt-3">Login successful!</div>}
      </div>
    </div>
  );
};

export default Login;
