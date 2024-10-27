import useHttpRequest from "../../hooks/useHttpRequest";
import { z } from "zod";
import { useState } from "react";
import { useColorMode, Button, Box, Text, Alert, AlertIcon, Input } from "@chakra-ui/react";
import "./CustomHabitForm.css";

const habitSchema = z.object({
  description: z
    .string()
    .min(1, "Habit description is required")
    .max(200, "Habit description must be at most 200 characters"),
});

interface CustomHabitFormProps {
  onHabitCreated: (habit: { id: string; description: string }) => void;
}

const CustomHabitForm: React.FC<CustomHabitFormProps> = ({ onHabitCreated }) => {
  const [habitDescription, setHabitDescription] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { data, loading, error, sendRequest } = useHttpRequest<
    { id: string; description: string },
    { description: string }
  >({
    url: "http://127.0.0.1:5000/custom_habits",
    method: "POST",
  });

  const { colorMode } = useColorMode(); // Get the current color mode

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = habitSchema.safeParse({ description: habitDescription });

    if (!result.success) {
      const errors = result.error.errors.map((err) => err.message);
      setValidationErrors(errors);
      return;
    }

    setValidationErrors([]);

    const response = await sendRequest({ body: { description: habitDescription } });
    if (response) {
      onHabitCreated(response);
      setHabitDescription("");
    }
  };

  return (
    <Box className="container mt-2">
      <Text as="h2" id="new-habit-header">Create a New Habit</Text>
      <form onSubmit={handleSubmit}>
        <Box className="form-group">
          <Input
            type="text"
            id="habitDescription"
            className="form-control"
            value={habitDescription}
            onChange={(e) => setHabitDescription(e.target.value)}
            required
          />
        </Box>
        <Button
          type="submit"
          id="create-habit-btn"
          className="complete-button"
          isLoading={loading}
          borderRadius="3xl"
          w="300px"
          variant="outline"
          borderColor={colorMode === 'dark' ? '#22d3ee' : '#DC143C'} // Change border color based on color mode
          color={colorMode === 'dark' ? '#22d3ee' : '#DC143C'} // Change text color based on color mode
          _hover={{
            bg: colorMode === 'dark' ? '#22d3ee' : '#DC143C',
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
      {data && <Alert status="success" mt={3}>Habit created successfully!</Alert>}
    </Box>
  );
};

export default CustomHabitForm;
