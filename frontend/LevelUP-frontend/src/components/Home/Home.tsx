import "./Home.css";
import landingPageSvg from "../../assets/landing-page3.svg";
import { useEffect } from "react";
import { Box } from "@chakra-ui/react";

const Home = () => {
  useEffect(() => {
    document.title = "Level-UP | Home";
  }, []);

  return (
    <Box
    className="home-container"
    style={{
      backgroundImage: `url(${landingPageSvg})`,
      width: "1390px",
      height: "950px",
      margin: "0 auto",
      zIndex: 1,
      marginTop: "30px",
      position: "relative",
    }}
  >
  </Box>
  );
};

export default Home;
