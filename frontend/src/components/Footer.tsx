import { Box, Flex, Text, Link, Icon } from "@chakra-ui/react";
import { FaTwitter, FaInstagram, FaFacebook } from "react-icons/fa";

function Footer() {
  return (
    <Box as="footer" bg="gray.800" color="gray.200" py={6} borderTop="1px" borderColor="gray.700">
      <Flex
        direction={{ base: "column", md: "row" }}
        align="center"
        justify="space-between"
        maxW="6xl"
        mx="auto"
        px={4}
      >
        {/* Footer text section */}
        <Flex direction="column" align={{ base: "center", md: "flex-start" }} mb={{ base: 4, md: 0 }}>
          <Text fontSize="sm" mb={1}>
            <strong>v0.0.2 Beta © 2025</strong> by Podpečan, Porekar, Žerdoner
          </Text>
          <Text fontSize="sm">
            Projekt Your Voice, Fakulteta za elektrotehniko, računalništvo in informatiko Maribor
          </Text>
        </Flex>

        {/* Social icons section */}
        <Flex gap={6}>
          <Link href="https://twitter.com/" isExternal>
            <Icon as={FaTwitter} w={6} h={6} _hover={{ color: "blue.400" }} />
          </Link>
          <Link href="https://www.instagram.com/" isExternal>
            <Icon as={FaInstagram} w={6} h={6} _hover={{ color: "pink.400" }} />
          </Link>
          <Link href="https://www.facebook.com/" isExternal>
            <Icon as={FaFacebook} w={6} h={6} _hover={{ color: "blue.600" }} />
          </Link>
        </Flex>
      </Flex>
    </Box>
  );
}

export default Footer;
