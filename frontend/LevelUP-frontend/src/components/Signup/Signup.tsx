import React, { useEffect, useState } from "react";
import { z } from "zod";
import "./Signup.css";
import circuitSvg from "../../assets/circuit.svg";
import useHttpRequest from "../../hooks/useHttpRequest";
import { useNavigate } from "react-router-dom";
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
import { EmailIcon, LockIcon, AtSignIcon } from "@chakra-ui/icons";

// Zod schema for signup form validation
const signupSchema = z.object({
  username: z.string().min(3, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

type SignupData = z.infer<typeof signupSchema>;

const Signup = () => {
  // State variables for form data and validation errors
  const [formData, setFormData] = useState<SignupData>({
    username: "",
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // HTTP request hook for signup
  const { data, loading, error, sendRequest } = useHttpRequest<
    { message: string },
    SignupData
  >({
    url: "https://level-up-backend-x0lt.onrender.com//users",
    method: "POST",
    body: formData,
  });

  const navigate = useNavigate();
  const { colorMode } = useColorMode();

  // Set the document title when the component mounts
  useEffect(() => {
    document.title = "Level-UP | SignUp";
  }, []);

  // Navigate to login page on successful signup
  useEffect(() => {
    if (data) {
      navigate("/login");
    }
  }, [data, navigate]);

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
    const result = signupSchema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    // Send signup request
    await sendRequest();
  };

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
            SignUp
          </Box>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <AtSignIcon
                    color={colorMode === "dark" ? "gray.300" : "gray.500"}
                  />
                </InputLeftElement>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
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
                isLoading={loading}
                fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
                fontSize="lg"
                borderRadius="3xl"
                w="100%"
                backgroundColor={colorMode === "dark" ? "#22d3ee" : "red.600"}
                borderColor={colorMode === "dark" ? "#22d3ee" : "red.600"} // Change border color based on color mode
                color="white"
              >
                {loading ? "Signing up..." : "SignUp"}
              </Button>
              <Text textAlign="center">
                Already have an account?{" "}
                <Link
                  _hover={{
                    color: colorMode === "dark" ? "#22d3ee" : "red.600",
                    textDecoration: "underline",
                  }}
                  href="/login"
                >
                  Login
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
              Signup successful!
            </Alert>
          )}
        </CardBody>
      </Card>
    </Flex>
  );
};

export default Signup;
