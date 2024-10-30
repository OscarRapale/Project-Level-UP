import React, { useState } from "react";
import useHttpRequest from "../../hooks/useHttpRequest";
import "./CreateHabitList.css";
import { Box, FormControl, useColorMode, FormLabel, Input, Button, Alert, AlertIcon } from "@chakra-ui/react";

// Props interface for CreateHabitList component
interface CreateHabitListProps {
  onHabitListCreated: (id: string, name: string) => void;
}

const CreateHabitList: React.FC<CreateHabitListProps> = ({
  onHabitListCreated,
}) => {
  // State variables
  const [habitListName, setHabitListName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  
  // HTTP request hook for creating a new habit list
  const { sendRequest } = useHttpRequest<{ id: string }, { name: string }>({
    url: "http://127.0.0.1:5000/habit_lists",
    method: "POST",
    body: { name: habitListName },
  });

  const { colorMode } = useColorMode(); // Get the current color mode

  // Handle form submission
  const handleCreateHabitList = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await sendRequest();
      onHabitListCreated(response.id, habitListName); // Call the onHabitListCreated callback with the new habit list
      setHabitListName(""); // Clear the input field
      setError(null); // Clear any previous errors
    } catch {
      setError("Failed to create habit list."); // Set error message if request fails
    }
  };

  return (
    <Box>
      <form onSubmit={handleCreateHabitList}>
        <FormControl id="list-name-input" isRequired>
          <FormLabel textAlign="center">Enter habit list name</FormLabel>
          <Input
            type="text"
            value={habitListName}
            onChange={(e) => setHabitListName(e.target.value)}
            placeholder="Enter habit list name"
          />
        </FormControl>
        <Button
          id="create-btn"
          type="submit"
          variant="outline"
          borderRadius="3xl"
          w="300px"
          borderColor={colorMode === 'dark' ? '#22d3ee' : 'red.600'} // Change border color based on color mode
          color={colorMode === 'dark' ? '#22d3ee' : 'red.600'} // Change text color based on color mode
          _hover={{
            bg: colorMode === 'dark' ? '#22d3ee' : 'red.600',
            color: 'white',
          }}
          mt={4}
        >
          Create Habit List
        </Button>
      </form>
      {error && (
        <Alert status="error" mt={3}>
          <AlertIcon />
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default CreateHabitList;
