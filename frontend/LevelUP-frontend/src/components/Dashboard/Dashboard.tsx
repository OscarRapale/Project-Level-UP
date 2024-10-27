import { Grid, GridItem, Box } from "@chakra-ui/react";
import React, { useEffect } from "react";
import CategoryContainer from "../ CategoryContainer/CategoryContainer";
import UserCard from "../UserCard/UserCard";
import "./Dashboard.css";
import HabitListContainer from "../HabitListContainer";
import CustomHabitsContainer from "../CustomHabitsContainer";

const Dashboard: React.FC = () => {
  useEffect(() => {
    document.title = "Level-UP | Dashboard";
  }, []);
  
  return (
    <Grid
      templateAreas={`
        "createHabitList createHabitList"
        "habitList userCard"
        "habitList category"
        "habitList customHabitForm"
      `}
      gridTemplateColumns={"2fr 1fr"}
      gap={4}
      p={4}
      alignItems="start"
      justifyContent="center"
      marginBottom="30px"
      className="dashboard-container"
    >
      <GridItem area={"habitList"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w="70%"
          h="auto"
          maxH=""
          display="flex"
          alignItems="center"
          justifyContent="center"
          margin="0 auto"
          color="white"
          marginLeft="20rem"
          marginTop="10rem"
        >
          <HabitListContainer />
        </Box>
      </GridItem>
      <GridItem area="userCard">
        <UserCard />
      </GridItem>
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
        >
          <CategoryContainer />
        </Box>
      </GridItem>
      <GridItem area={"customHabitForm"}>
        <Box
          bg="#333"
          p={4}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w="75%"
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
