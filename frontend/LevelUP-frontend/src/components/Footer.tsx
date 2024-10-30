import { Box, Text, Stack, Link, Button, useColorMode } from "@chakra-ui/react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  const { colorMode } = useColorMode();

  return (
    <Box
     as="footer"
     bg="black"
     color="white"
     py={10}
     >
      {/* Upper section */}
      <Box bg={colorMode === 'dark' ? 'cyan.700' : 'red.800'} py={8}>
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          px={8}
        >
          <Box textAlign={{ base: "center", md: "left" }} mb={{ base: 4, md: 0 }}>
            <Text fontSize="2xl" fontWeight="bold">
              2024
            </Text>
            <Text fontSize="sm">Year Founded</Text>
          </Box>
          <Box textAlign={{ base: "center", md: "left" }} mb={{ base: 4, md: 0 }}>
            <Text fontSize="2xl" fontWeight="bold">
              San Juan, Puerto Rico
            </Text>
            <Text fontSize="sm">Location</Text>
          </Box>
        </Stack>
      </Box>

      {/* Lower section */}
      <Box mt={8} px={8}>
        <Stack
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          spacing={10}
        >
          {/* Contact Information */}
          <Box textAlign={{ base: "center", md: "left" }} mb={{ base: 4, md: 0 }}>
            <Text fontWeight="bold">Get in touch</Text>
            <Link href="mailto:oscarrapale17@gmail.com">
              oscarrapale17@gmail.com
            </Link>
            <br />
            <Link href="mailto:saul.vera787@gmail.com">
              saul.vera787@gmail.com
            </Link>
            <br />
            <Link href="mailto:julio.1515.pr@gmail.com">
              julio.1515.pr@gmail.com
            </Link>
          </Box>

          {/* Social Media Links */}
          <Box textAlign={{ base: "center", md: "left" }} mb={{ base: 4, md: 0 }}>
            <Text fontWeight="bold">Connect</Text>
            <Link href="https://www.linkedin.com/in/oscar-rapale/" isExternal>
              Oscar Rapale
            </Link>
            <br />
            <Link href="https://www.linkedin.com/in/saul-vera-9014bbb0/" isExternal>
              Saul Vera
            </Link>
            <br />
            <Link href="https://www.linkedin.com/in/julio-p%C3%A9rez-a90802330/" isExternal>
              Julio Pérez
            </Link>
          </Box>

          {/* Design Services */}
          <Box textAlign={{ base: "center", md: "left" }} mb={{ base: 4, md: 0 }}>
            <Text fontWeight="bold">Design Services</Text>
            <Text>Level-UP Design Services</Text>
            <Text>San Juan, Puerto Rico</Text>
          </Box>

          {/* Ventures */}
          <Box textAlign={{ base: "center", md: "left" }} mb={{ base: 4, md: 0 }}>
            <Text fontWeight="bold">Ventures</Text>
            <Text>Level-UP Ventures</Text>
            <Text>San Juan, Puerto Rico</Text>
          </Box>
        </Stack>

        {/* Bottom navigation */}
        <Box textAlign="center" mt={10}>
          <Link href="/profile">
            <Button
             variant="outline" 
             borderColor={colorMode === "dark" ? "white": "whiteAlpha"}
             color={colorMode === "dark" ? "white": "whiteAlpha"}
             mx={2} 
             mb={{ base: 2, md: 0 }}
             >
              Profile
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button 
              variant="outline" 
              borderColor={colorMode === "dark" ? "white": "whiteAlpha"}
              color={colorMode === "dark" ? "white": "whiteAlpha"}
              mx={2} 
              mb={{ base: 2, md: 0 }}
              >
              Dashboard
            </Button>
          </Link>
          <Link href="/about-us">
            <Button 
             variant="outline" 
             borderColor={colorMode === "dark" ? "white": "whiteAlpha"}
             color={colorMode === "dark" ? "white": "whiteAlpha"}
             mx={2} 
             mb={{ base: 2, md: 0 }}
             >
              About Us
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button 
             variant="outline" 
             borderColor={colorMode === "dark" ? "white": "whiteAlpha"}
             color={colorMode === "dark" ? "white": "whiteAlpha"}
             mx={2} 
             mb={{ base: 2, md: 0 }}>
              Leaderboard
            </Button>
          </Link>
        </Box>

        {/* Footer Legal Info */}
        <Box textAlign="center" mt={8}>
          <Text>Team Level-UP © 2024</Text>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
