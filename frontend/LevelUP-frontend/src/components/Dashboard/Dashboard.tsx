import { Grid, GridItem, Box } from "@chakra-ui/react";
import React from "react";
import CategoryContainer from "../ CategoryContainer/CategoryContainer";
import UserHabitContainer from "../UserHabitContainer/UserHabitContainer";
import HabitList from "../HabitList";
import CreateHabitList from "../CreateHabitList/CreateHabitList";
import CustomHabitForm from "../ CustomHabitForm/CustomHabitForm";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const handleHabitListCreated = (id: string) => {
    console.log("Habit list created with ID:", id);
  };

  return (
    <Grid
      templateAreas={`
        "createHabitList createHabitList"
        "habitList category"
        "habitList customHabitForm"
        "habitList userHabits"
      `}
      gridTemplateColumns={"2fr 1fr"}
      gap={4}
      p={4}
      alignItems="start"
      justifyContent="center"
    >
      <GridItem area={"createHabitList"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="lg"
          boxShadow="lg"
          _hover={{ boxShadow: "lg" }}
          w="20%"
          h="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
          margin="0 auto"
        >
          <CreateHabitList onHabitListCreated={handleHabitListCreated} />
        </Box>
      </GridItem>
      <GridItem area={"habitList"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="lg"
          boxShadow="lg"
          _hover={{ boxShadow: "lg" }}
          w="70%"
          h="auto"
          maxH=""
          display="flex"
          alignItems="center"
          justifyContent="center"
          margin="0 auto"
          color="white"
          marginLeft="20rem"
        >
          <HabitList />
        </Box>
      </GridItem>
      <GridItem area={"category"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="md"
          boxShadow={"lg"}
          _hover={{ boxShadow: "lg" }}
          w="80%"
          h="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          marginBottom="50px"
        >
          <CategoryContainer />
        </Box>
      </GridItem>
      <GridItem area={"customHabitForm"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="md"
          boxShadow="lg"
          _hover={{ boxShadow: "lg" }}
          w="75%"
          h="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          marginBottom="50px"
        >
          <CustomHabitForm />
        </Box>
      </GridItem>
      <GridItem area={"userHabits"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="md"
          boxShadow="lg"
          _hover={{ boxShadow: "lg" }}
          w="75%"
          h="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
        >
          <UserHabitContainer />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default Dashboard;
