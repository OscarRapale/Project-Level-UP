import "./Home.css";
import landingPageSvg from "../../assets/landing-page1.svg";
import landingPageMobileSvg from "../../assets/Landing-page-mobile.svg";
import { useEffect } from "react";
import { Box, Button, useBreakpointValue, useColorMode } from "@chakra-ui/react";
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
