import { Box, Button, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Box p={8} bgGradient="linear(to-r, blue.50, blue.100)">
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={12}
        align="center"
        justify="space-between"
        maxW="container.xl"
        mx="auto"
        py={12}
      >
        {/* Left Column */}
        <Box flex={1} textAlign={{ base: 'center', md: 'left' }} px={{ base: 4, md: 8 }}>
          <Heading as="h1" size="2xl" mb={6} color="blue.700" fontWeight="extrabold">
            Forum YourVoice
          </Heading>
          <Text fontSize="lg" color="gray.700" mb={8} lineHeight="taller">
            YourVoice je interaktivni forum, zasnovan za izmenjavo informacij in povezovanje uporabnikov.
            Prijavljeni uporabniki lahko objavljajo svoje vsebine, komentirajo, ocenjujejo objave drugih ter
            urejajo svoj profil. Neprijavljeni uporabniki lahko brskajo po objavah brez možnosti interakcije.
            Napredne funkcionalnosti vključujejo filtriranje, sortiranje, napredno iskanje in posebne pravice
            za moderatorje ter administratorje. Razvit z MERN skladom.
          </Text>
  
          <Box mt={8} textAlign={{ base: 'center', md: 'left' }}>
            <Heading as="h3" size="lg" mb={4} color="blue.600" fontWeight="semibold">
              Pridruži se zdaj
            </Heading>
            <Button
              as={RouterLink}
              to="/posts"
              size="lg"
              colorScheme="blue"
              bg="blue.600"
              rounded="full"
              px={8}
              py={6}
              rightIcon={<FontAwesomeIcon icon={faDoorOpen} />}
              _hover={{ bg: 'blue.500' }}
              boxShadow="xl"
            >
              Vstopi
            </Button>
          </Box>
        </Box>
  
        {/* Right Column */}
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <Image
            src="images/default.png"
            alt="YourVoice logo"
            boxSize="100%"
            maxW="400px"
            borderRadius="xl"
            boxShadow="lg"
          />
        </Box>
      </Stack>
    </Box>
  );  
};

export default Home;
