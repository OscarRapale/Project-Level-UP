import React, { useEffect, useState } from "react";
import { z } from "zod";
import circuitSvg from "../../assets/circuit.svg";
import useHttpRequest from "../../hooks/useHttpRequest";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../hooks/useUser";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Alert,
  AlertIcon,
  useColorMode,
  Stack,
  Text,
  Link,
  Flex,
  Card,
  CardBody,
  CardHeader,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon } from "@chakra-ui/icons";
import "./Login.css";

// Zod schema for login form validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Invalid password"),
});

type LoginData = z.infer<typeof loginSchema>;

const Login = () => {
  // State variables for form data and validation errors
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // HTTP request hook for login
  const { data, loading, error, sendRequest } = useHttpRequest<
    { access_token: string; user_id: string },
    LoginData
  >({
    url: "http://127.0.0.1:5000/login",
    method: "POST",
    body: formData,
  });

  const navigate = useNavigate();
  const { setUserId } = useUser();
  const { colorMode } = useColorMode();

  // Set the document title when the component mounts
  useEffect(() => {
    document.title = "Level-UP | Login";
  }, []);

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate form data using Zod schema
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    // Send login request
    await sendRequest();
  };

  // Set user ID and navigate to dashboard on successful login
  useEffect(() => {
    if (data) {
      localStorage.setItem("token", data.access_token);
      setUserId(data.user_id); // Set the user ID in the context and localStorage
      navigate("/dashboard");
    }
  }, [data, navigate, setUserId]);

  return (
    <Flex
      align="center"
      justify="center"
      height="100vh"
      bg={colorMode === "dark" ? "gray.800" : "gray.100"}
      backgroundImage={{ base: "none", md: `url(${circuitSvg})` }}
      backgroundSize="150% 130%"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
    >
      <Card
        width={{ base: "90%", md: "60%", lg: "40%" }}
        p={8}
        borderRadius="md"
        boxShadow="lg"
      >
        <CardHeader>
          <Box
            as="h2"
            fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
            fontSize={{ base: "2xl", md: "5xl" }}
            mb={5}
            textAlign="center"
          >
            Login
          </Box>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <EmailIcon
                    color={colorMode === "dark" ? "gray.300" : "gray.500"}
                  />
                </InputLeftElement>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockIcon
                    color={colorMode === "dark" ? "gray.300" : "gray.500"}
                  />
                </InputLeftElement>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
              <Button
                type="submit"
                fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
                fontSize="lg"
                isLoading={loading}
                borderRadius="3xl"
                w="100%"
                backgroundColor={colorMode === "dark" ? "#22d3ee" : "red.600"}
                borderColor={colorMode === "dark" ? "#22d3ee" : "red.600"} // Change border color based on color mode
                color="white"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Text textAlign="center">
                Don't have an account?{" "}
                <Link
                  _hover={{
                    color: colorMode === "dark" ? "#22d3ee" : "red.600",
                    textDecoration: "underline",
                  }}
                  href="/sign-up"
                >
                  SignUp
                </Link>
              </Text>
            </Stack>
          </form>
          {validationErrors.length > 0 && (
            <Alert status="error" mt={3}>
              <AlertIcon />
              <ul>
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          {error && (
            <Alert status="error" mt={3}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          {data && (
            <Alert status="success" mt={3}>
              Login successful!
            </Alert>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
};

export default Login;
