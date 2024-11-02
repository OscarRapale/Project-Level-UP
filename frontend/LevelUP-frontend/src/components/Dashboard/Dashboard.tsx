import { Grid, GridItem, Box } from "@chakra-ui/react";
import React, { useEffect } from "react";
import CategoryContainer from "../ CategoryContainer/CategoryContainer";
import UserCard from "../UserCard/UserCard";
import "./Dashboard.css";
import HabitListContainer from "../HabitListContainer";
import CustomHabitsContainer from "../CustomHabitsContainer";

const Dashboard: React.FC = () => {
  // Set the document title when the component mounts
  useEffect(() => {
    document.title = "Level-UP | Dashboard";
  }, []);
  
  return (
    <Grid
      templateAreas={{
        base: `
          "habitList"
          "userCard"
          "category"
          "customHabitForm"
        `,
        md: `
        "habitList userCard"
        "habitList category"
        "habitList customHabitForm"
        `
      }}
      gridTemplateColumns={{ base: "1fr", md: "2fr 1fr" }}
      gap={4}
      p={4}
      alignItems="start"
      justifyContent="center"
      marginBottom="30px"
      className="dashboard-container"
    >
      {/* Habit List Container */}
      <GridItem area={"habitList"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w={{ base: "100%", md: "70%"  }}
          h="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
          margin="0 auto"
          color="white"
          marginLeft={{ base: "0rem", md: "20rem" }}
          marginTop="10rem"
        >
          <HabitListContainer />
        </Box>
      </GridItem>

      {/* User Card */}
      <GridItem area="userCard">
        <UserCard />
      </GridItem>

      {/* Category Container */}
      <GridItem area={"category"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="2xl"
          boxShadow={"2xl"}
          _hover={{ boxShadow: "2xl" }}
          w="80%"
          h="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          marginBottom="50px"
          marginLeft={{ base: "45px", md: "0" }}
        >
          <CategoryContainer />
        </Box>
      </GridItem>

      {/* Custom Habits Container */}
      <GridItem area={"customHabitForm"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w={{ base: "100%", md: "75%" }}
          h="auto"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="white"
          marginBottom="50px"
        >
          <CustomHabitsContainer />
        </Box>
      </GridItem>
    </Grid>
  );
};

export default Dashboard;
