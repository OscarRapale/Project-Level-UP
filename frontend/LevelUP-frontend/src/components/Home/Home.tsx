import "./Home.css";
import landingPageSvg from "../../assets/landing-page1.svg";
import landingPageMobileSvg from "../../assets/Landing-page-mobile.svg";
import { useEffect } from "react";
import { Box, Text, Button, useBreakpointValue, useColorMode } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Home = () => {
  useEffect(() => {
    document.title = "Level-UP | Home";
  }, []);

  const { colorMode } = useColorMode();
  const backgroundImage = useBreakpointValue({
    base: landingPageMobileSvg,
    md: landingPageSvg,
  });

  // Determine display property based on screen size
  const displayTextBlock = useBreakpointValue({ base: "none", md: "block" });


  return (
    <Box
      className="home-container"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        width: "100%",
        height: "100vh",
        margin: "0 auto",
        zIndex: 1,
        marginTop: "3px",
        position: "relative",
      }}
    >
      {/* Block of text explaining the app */}
      <Box
        position="absolute"
        bottom="5px"
        left="70px"
        textAlign="left"
        bg={colorMode === "dark" ? "blackAlpha.700" : "#333"}
        color="white"
        p={6}
        borderRadius="2xl"
        maxW="400px"
        animation="float 3s ease-in-out infinite"
        display={displayTextBlock} // Hide on mobile
      >
        <Text textAlign="center" fontFamily="'Orbitron'" fontSize="2xl" fontWeight="bold" mb={4}>
          Welcome to Level-UP!
        </Text>
        <Text fontSize="lg">
          Level-UP is a gamified habit tracker that helps you build and maintain
          healthy habits. Track your progress, earn rewards, and level up as you
          complete your daily tasks. Join our community and start your journey
          to a better you!
        </Text>
      </Box>

      <Button
        fontFamily="'Orbitron'"
        fontSize="xl"
        marginTop="40rem"
        marginRight={{ base: "10px", md: "96px" }}
        marginBottom="25px"
        as={RouterLink}
        to="/dashboard"
        borderRadius="3xl"
        w="320px"
        backgroundColor={colorMode === "dark" ? "green.400" : "#22d3ee"}
        borderColor={colorMode === "dark" ? "green.400" : "#22d3ee"} // Change border color based on color mode
        color="white"
      >
        Explore
      </Button>

      <Button
        fontFamily="'Orbitron'"
        fontSize="xl"
        marginRight={{ base: "10px", md: "90px" }}
        as={RouterLink}
        to="/sign-up"
        borderRadius="3xl"
        w={{ base: "320px",  md: "298px" }}
        backgroundColor={colorMode === "dark" ? "green.400" : "#22d3ee"}
        borderColor={colorMode === "dark" ? "green.400" : "#22d3ee"} // Change border color based on color mode
        color="white"
      >
        SignUp
      </Button>
    </Box>
  );
};

export default Home;
