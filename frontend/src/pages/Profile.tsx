import React, { useContext, useEffect, useState } from 'react';
import { Box, Heading, Text, Button, Stack, Table, Tbody, Tr, Th, Td, Input } from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User } from '../interfaces/User'

const Profile: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    if (user?.role === 'admin') {
      // Fetch all users if the logged-in user is an admin
      axios
        .get<User[]>('http://localhost:3000/user')
        .then((response) => {
          setAllUsers(response.data);
          setFilteredUsers(response.data); // Initialize filtered users
        })
        .catch((error) => {
          console.error('Error fetching users:', error);
        });
    }
  }, [user]);

  const toggleBanStatus = (userId: string) => {
    axios
      .patch(`http://localhost:3000/user/toggle-ban/${userId}`)
      .then(() => {
        setAllUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === userId ? { ...u, isBanned: !u.isBanned } : u
          )
        );
        // Update filtered users
        setFilteredUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === userId ? { ...u, isBanned: !u.isBanned } : u
          )
        );
      })
      .catch((error) => {
        console.error('Error toggling ban status:', error);
      });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilteredUsers(
      allUsers.filter((user) =>
        user.username.includes(value)
      )
    );
  };

  if (!user) {
    return (
      <Box p={6} textAlign="center">
        <Heading as="h2" size="xl" mb={6}>
          Profil uporabnika
        </Heading>
        <Text>Za ogled profila se morate prijaviti.</Text>
        <Button mt={4} colorScheme="teal" onClick={() => navigate('/login')}>
          Prijava
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="container.md" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Profil uporabnika
      </Heading>
      <Stack spacing={4} mb={8}>
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Ime:
          </Text>
          <Text fontSize="md">{user.username}</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            E-pošta:
          </Text>
          <Text fontSize="md">{user.email}</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold">
            Datum registracije:
          </Text>
          <Text fontSize="md">
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </Box>
      </Stack>

      {user.role === 'admin' && (
        <>
          <Heading as="h3" size="lg" mb={4}>
            Seznam uporabnikov
          </Heading>
          <Input
            placeholder="Iskanje po uporabniškem imenu"
            value={searchTerm}
            onChange={handleSearch}
            mb={4}
          />
          <Table variant="simple" size="sm">
            <Tbody>
              {filteredUsers.map((u) => (
                <Tr key={u._id}>
                  <Td>{u.username}</Td>
                  <Td>{u.email}</Td>
                  <Td>{u.isBanned ? 'Prepovedano' : 'Aktivno'}</Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme={u.isBanned ? 'green' : 'red'}
                      onClick={() => toggleBanStatus(u._id)}
                    >
                      {u.isBanned ? 'Aktiviraj' : 'Prepovej'}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}

      <Button mt={6} colorScheme="teal" onClick={() => navigate('/')}>
        Domov
      </Button>
    </Box>
  );
};

export default Profile;
