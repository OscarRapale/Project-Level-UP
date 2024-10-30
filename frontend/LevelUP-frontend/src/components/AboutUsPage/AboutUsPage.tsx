import { Box, Grid, GridItem, HStack, Link, Text, Heading } from "@chakra-ui/react";
import { Github, Linkedin } from "react-bootstrap-icons";
import './AboutUsPage.css';
import { useEffect } from "react";

const AboutUsPage = () => {
  // Set the document title when the component mounts
  useEffect(() => {
    document.title = "Level-UP | About Us";
  }, []);

  return (
    <Grid
      templateAreas={{
        base: `
          "mainCard"
          "firstMemberCard"
          "secondMemberCard"
          "thirdMemberCard"
        `,
        md: `
          "mainCard mainCard mainCard"
          "firstMemberCard secondMemberCard thirdMemberCard"
        `,
      }}
      gridTemplateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
      gap={4}
      p={4}
      alignItems="start"
      justifyContent="center"
      marginBottom="80px"
      className="about-us-container"
    >
      {/* Main Card */}
      <GridItem area={"mainCard"}>
        <Box
          bg="#333"
          p={{ base: 10, md: 20 }}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w={{ base: "100%", md: "80%" }}
          h="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          color="white"
          margin="0 auto"
          marginTop={{ base: "2rem", md: "10rem" }}
          fontSize={{ base: "lg", md: "2xl" }}
          fontFamily="'Exo 2', 'Lexend'"
        >
          <Heading as="h2" fontFamily="'Orbitron', 'Exo 2', 'Lexend'" mb={4}>
            About Us
          </Heading>
          <Text mb={4}>
            Welcome to <strong>Level-UP</strong>, your daily habit tracker with
            a twist! Our app helps you build healthy routines by turning your
            daily tasks into a game where you gain experience points (XP) as you
            complete your habits.
          </Text>
          <Text mb={4}>
            But there's a challenge—complete your habits before the daily
            deadline or face the consequences! If you miss your habits for a
            day, you'll lose HP (Health Points), but don't worry—you can recover
            by staying on track the next day and continuing to conquer your
            habits!
          </Text>
          <Text mb={4}>
            <strong>Level-UP</strong> is developed by a group of students from{" "}
            <strong>Holberton Coding School Puerto Rico</strong>. We're
            passionate about using technology to help people improve their
            lives, one habit at a time.
          </Text>
          <Text mb={4}>
            As a team, we've combined our skills in coding, design, and
            gamification to make habit tracking fun and rewarding. Every day is
            a new adventure as you level up, and master your routines!
          </Text>
        </Box>
      </GridItem>

      {/* First Member Card */}
      <GridItem area={"firstMemberCard"}>
        <Box
          bg="#333"
          p={{ base: 10, md: 20 }}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w="100%"
          h="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          color="white"
          margin="0 auto"
          marginTop="2rem"
          fontSize={{ base: "lg", md: "2xl" }}
          fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
          animation="float 3s ease-in-out infinite"
        >
          <Heading
           as="h2"
           mb={4}
           fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
           >
            Oscar Rapale
          </Heading>
          <Text mb={2}>Gamification Logic</Text>
          <Text mb={2}>Front-end Development</Text>
          <Text mb={2}>UI/UX Design</Text>
          <HStack spacing={4} mt={4}>
            <Link href="https://github.com/OscarRapale" isExternal>
              <Github size="2em" />
            </Link>
            <Link href="https://www.linkedin.com/in/oscar-rapale/" isExternal>
              <Linkedin size="2em" />
            </Link>
          </HStack>
        </Box>
      </GridItem>

      {/* Second Member Card */}
      <GridItem area={"secondMemberCard"}>
        <Box
          bg="#333"
          p={{ base: 10, md: 20 }}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w="100%"
          h="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          color="white"
          margin="0 auto"
          marginTop="2rem"
          fontSize={{ base: "lg", md: "2xl" }}
          fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
          animation="float 3s ease-in-out infinite"
        >
          <Heading
           as="h2"
           mb={4}
           fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
           >
            Julio Pérez
          </Heading>
          <Text mb={2}>Back-end Developer</Text>
          <Text mb={2}>CRUD Operations</Text>
          <Text mb={2}>Dev-Ops</Text>
          <HStack spacing={4} mt={4}>
            <Link href="https://github.com/julioperez15" isExternal>
              <Github size="2em" />
            </Link>
            <Link href="https://www.linkedin.com/in/julio-p%C3%A9rez-a90802330/" isExternal>
              <Linkedin size="2em" />
            </Link>
          </HStack>
        </Box>
      </GridItem>

      {/* Third Member Card */}
      <GridItem area={"thirdMemberCard"}>
        <Box
          bg="#333"
          p={{ base: 10, md: 20 }}
          borderRadius="2xl"
          boxShadow="2xl"
          _hover={{ boxShadow: "2xl" }}
          w="100%"
          h="auto"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          color="white"
          margin="0 auto"
          marginTop="2rem"
          fontSize={{ base: "lg", md: "2xl" }}
          fontFamily="'Orbitron', 'Exo 2', 'Lexend'"
          animation="float 3s ease-in-out infinite"
        >
          <Heading
           as="h2"
           mb={4}
           fontFamily="'Orbitron', 'Exo 2', 'Lexend'" 
           >
            Saul Vera
          </Heading>
          <Text mb={2}>Back-end Developer</Text>
          <Text mb={2}>Database</Text>
          <Text mb={2}>Dev-Ops</Text>
          <HStack spacing={4} mt={4}>
            <Link href="https://github.com/allthatgroove89" isExternal>
              <Github size="2em" />
            </Link>
            <Link href="https://www.linkedin.com/in/saul-vera-9014bbb0/" isExternal>
              <Linkedin size="2em" />
            </Link>
          </HStack>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default AboutUsPage;
