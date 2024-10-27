import { Box, Text, Stack, Link, Button, useColorMode } from "@chakra-ui/react";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer = () => {
  const { colorMode } = useColorMode();

  return (
    <Box as="footer" bg="black" color="white" py={10}>
      {/* Upper section */}
      <Box bg={colorMode === 'dark' ? 'cyan.700' : 'red.800'} py={8}>
        <Stack
          direction={["column", "row"]}
          justify="space-between"
          align="center"
          px={8}
        
        >
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              2024
            </Text>
            <Text fontSize="sm">Year Founded</Text>
          </Box>
          <Box>
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
          direction={["column", "row"]}
          justify="space-between"
          spacing={10}
        >
          {/* Contact Information */}
          <Box>
            <Text fontWeight="bold">Get in touch</Text>
            <Link href="mailto:oscarrapale17@gmail.com">
                oscarrapale17@gmail.com
            </Link>
            <br />
            <Link href="mailto:saul.vera787@gmail.com">
            saul.vera787@gmail.com
            </Link>
            <br />
            <Link href="mailt0:julio.1515.pr@gmail.com">
            julio.1515.pr@gmail.com
            </Link>
          </Box>

          {/* Social Media Links */}
          <Box>
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
          <Box>
            <Text fontWeight="bold">Design Services</Text>
            <Text>Level-UP Design Services</Text>
            <Text>San Juan, Puerto Rico</Text>
          </Box>

          {/* Ventures */}
          <Box>
            <Text fontWeight="bold">Ventures</Text>
            <Text>Level-UP Ventures</Text>
            <Text>San Juan, Puerto Rico</Text>
          </Box>
        </Stack>

        {/* Bottom navigation */}
        <Box textAlign="center" mt={10}>
        <Link href="/profile">
          <Button variant="outline" colorScheme="whiteAlpha" mx={2}>
            Profile
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" colorScheme="whiteAlpha" mx={2}>
            Dashboard
          </Button>
        </Link>
        <Link href="/about-us">
          <Button variant="outline" colorScheme="whiteAlpha" mx={2}>
            About Us
          </Button>
        </Link>
        <Link href="/leaderboard">
          <Button variant="outline" colorScheme="whiteAlpha" mx={2}>
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
