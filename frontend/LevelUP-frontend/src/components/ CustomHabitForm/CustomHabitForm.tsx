import useHttpRequest from "../../hooks/useHttpRequest";
import { z } from "zod";
import { useState } from "react";
import { useColorMode, Button, Box, Text, Alert, AlertIcon, Input } from "@chakra-ui/react";
import "./CustomHabitForm.css";

// Zod schema for validating habit description
const habitSchema = z.object({
  description: z
    .string()
    .min(1, "Habit description is required")
    .max(200, "Habit description must be at most 200 characters"),
});

// Props interface for CustomHabitForm component
interface CustomHabitFormProps {
  onHabitCreated: (habit: { id: string; description: string }) => void;
}

const CustomHabitForm: React.FC<CustomHabitFormProps> = ({ onHabitCreated }) => {
  // State variables
  const [habitDescription, setHabitDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // HTTP request hook for creating a new custom habit
  const { data, loading, error, sendRequest } = useHttpRequest<
    { id: string; description: string },
    { description: string }
  >({
    url: "https://level-up-backend-x0lt.onrender.com//custom_habits",
    method: "POST",
  });

  const { colorMode } = useColorMode(); // Get the current color mode

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate habit description using Zod schema
    const result = habitSchema.safeParse({ description: habitDescription });

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    // Send request to create a new custom habit
    const response = await sendRequest({ body: { description: habitDescription } });
    if (response) {
      onHabitCreated(response); // Call the onHabitCreated callback with the new habit
      setHabitDescription(""); // Clear the input field
    }
  };

  return (
    <Box
      className="container mt-2"
      p={4}
      borderRadius="2xl"
      boxShadow="2xl"
     
      w={{ base: "100%", md: "80%" }}
      margin="0 auto"
      mt={{ base: "2rem", md: "4rem" }}
    >
      <Text as="h2" id="new-habit-header" fontSize={{ base: "xl", md: "2xl" }} mb={4}>
        Create a New Habit
      </Text>
      <form onSubmit={handleSubmit}>
        <Box className="form-group" mb={4}>
          <Input
            type="text"
            id="habitDescription"
            className="form-control"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
            required
            size={{ base: "md", md: "lg" }}
          />
        </Box>
        <Button
          type="submit"
          id="create-habit-btn"
          className="complete-button"
          isLoading={loading}
          borderRadius="3xl"
          w={{ base: "100%", md: "300px" }}
          variant="outline"
          borderColor={colorMode === 'dark' ? '#22d3ee' : 'red.600'} // Change border color based on color mode
          color={colorMode === 'dark' ? '#22d3ee' : 'red.600'} // Change text color based on color mode
          _hover={{
            bg: colorMode === 'dark' ? '#22d3ee' : 'red.600',
            color: 'white',
          }}
        >
          {loading ? "Creating..." : "Create Habit"}
        </Button>
      </form>
      {validationErrors.length > 0 && (
        <Alert status="error" mt={3}>
          <AlertIcon />
          <ul className="mb-0">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      {error && <Alert status="error" mt={3}><AlertIcon />{error}</Alert>}
      {data && <Alert status="success" bg="green.300" mt={3}>Habit created successfully!</Alert>}
    </Box>
  );
};

export default CustomHabitForm;
