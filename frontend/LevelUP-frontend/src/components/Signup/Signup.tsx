import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import useHttpRequest from "../../hooks/useHttpRequest";

// Zod schema for signup form
const signupSchema = z.object({
  username: z.string().min(3, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignupData = z.infer<typeof signupSchema>;

const Signup = () => {
  const [formData, setFormData] = useState<SignupData>({
    username: "",
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { data, loading, error, sendRequest } = useHttpRequest<
    { message: string },
    SignupData
  >({
    url: "http://127.0.0.1:5000/users",
    method: "POST",
    body: formData,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      navigate("/login");
    }
  }, [data, navigate]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    await sendRequest();
  };

  return (
    <div className="container mt-5">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            className="form-control"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
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
          {loading ? "Signing up..." : "Signup"}
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
      {data && <div className="alert alert-success mt-3">Signup successful!</div>}
    </div>
  );
};

export default Signup;
