import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Box, Flex, HStack, Text, Button } from '@chakra-ui/react';
import { publicRoutes, protectedRoutes } from '../routes';
import { UserContext } from '../userContext';

interface RouteType {
  name: string;
  to: string;
  visible: boolean;
  element: React.ReactNode;
}

const Header: React.FC = () => {
  const { user } = useContext(UserContext); // Retrieve user state from context

  // Determine routes to display based on login status
  const routesToShow = user ? protectedRoutes : publicRoutes;

  return (
    <Box as="header" bg="gray.800" color="white" py={4} px={8} shadow="sm">
      <Flex
        maxW="1200px"
        mx="auto"
        align="center"
        justify="space-between"
        flexWrap="wrap"
      >
        {/* Brand Name */}
        <Link to="/">
          <Text fontSize="2xl" fontWeight="bold" letterSpacing="wide">
            Your Voice
          </Text>
        </Link>

        {/* Navigation Links */}
        <HStack as="nav" spacing={6}>
          {routesToShow
            .filter((route) => route.visible)
            .map((route: RouteType) => (
              <NavLink key={route.to} to={route.to}>
                {({ isActive }) => (
                  <Button
                    variant={isActive ? 'solid' : 'ghost'}
                    colorScheme={isActive ? 'teal' : 'whiteAlpha'}
                    size="md"
                  >
                    {route.name}
                  </Button>
                )}
              </NavLink>
            ))}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
