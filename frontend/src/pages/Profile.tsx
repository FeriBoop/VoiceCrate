import React, {useContext, useState, useEffect} from 'react';
import {
  Box,
  Heading,
  Button,
  Stack,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
  HStack,
  Image,
  CloseButton,
  Table,
  Tbody, Td, Tr, Th
} from '@chakra-ui/react';
import {UserContext} from '../userContext';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import {User} from '../interfaces/User'

const Profile: React.FC = () => {
  const {user, setUserContext} = useContext(UserContext);
  const navigate = useNavigate();
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [existingAvatar, setExistingAvatar] = useState<{
    imageName: string;
    imageUrl: string;
  } | null>(null);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const toast = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);


  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setBio(user.bio || '');
      setExistingAvatar(user.avatar || null);
    }
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxFileSizeMB = 5;

    if (selectedFiles.length > 1) {
      toast({
        title: 'Too many files',
        description: 'You can only select up to 1 file!!',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return; // Exit early if more than 2 files are selected
    }

    for (const file of selectedFiles) {
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 5MB size limit.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        continue;
      }
      if (!validImageTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported image format.`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        continue;
      }
      const timestamp = Date.now();
      const newFileName = `${timestamp}-${file.name}`;
      const newFile = new File([file], newFileName, {type: file.type});
      setNewAvatar(newFile);
    }
  };

  const handleRemoveAvatar = () => {
    setExistingAvatar(null);
    setNewAvatar(null);
  };

  const handleUpdate = () => {
    if (!username || !email) {
      toast({title: 'Username and email are required', status: 'error'});
      return;
    }

    const url = `http://localhost:3000/user/${user?._id}`;
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('bio', bio);

    if (newAvatar) {
      formData.append('newAvatar', newAvatar);
    } else if (!existingAvatar) {
      formData.append('avatar', '');
    }

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        toast({
          title: 'Both old and new passwords are required to change the password.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30}$/.test(newPassword)) {
        toast({
          title: 'Invalid password',
          description: 'New password must be 8-30 characters long and include at least one uppercase letter, one lowercase letter, and one digit.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      formData.append('oldPassword', oldPassword);
      formData.append('newPassword', newPassword);
    }

    fetch(url, {
      method: 'PUT',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Access the user from the response data
        const updatedUser = data.user;

        if (updatedUser) {
          toast({
            title: 'Profile updated successfully',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          // Update the user context with the new user data
          setUserContext(updatedUser);
          onClose();
        } else {
          throw new Error('No user data returned from the server');
        }
      })
      .catch((error) => {
        console.error('Error during profile update:', error);
        toast({
          title: 'Failed to update profile',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };

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
            u._id === userId ? {...u, isBanned: !u.isBanned} : u
          )
        );
        // Update filtered users
        setFilteredUsers((prevUsers) =>
          prevUsers.map((u) =>
            u._id === userId ? {...u, isBanned: !u.isBanned} : u
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

      <Button mt={6} colorScheme="blue" onClick={onOpen}>
        Uredi profil
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Uredi profil</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Uporabniško ime</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>E-pošta</FormLabel>
              <Input value={email} onChange={(e) => setEmail(e.target.value)}/>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Opis</FormLabel>
              <Input value={bio} onChange={(e) => setBio(e.target.value)}/>
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Avatar</FormLabel>
              {existingAvatar && (
                <HStack>
                  <Image
                    src={'http://localhost:3000' + existingAvatar.imageUrl}
                    alt={existingAvatar.imageName}
                    boxSize="50px"
                    borderRadius="md"
                  />
                  <CloseButton onClick={handleRemoveAvatar}/>
                </HStack>
              )}
              {newAvatar && (
                <HStack>
                  <Image
                    src={URL.createObjectURL(newAvatar)}
                    alt={newAvatar.name}
                    boxSize="50px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <CloseButton onClick={() => setNewAvatar(null)}/>
                </HStack>
              )}
              <Input
                type="file"
                accept="image/*"
                mt={2}
                onChange={handleFileChange}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Trenutno geslo</FormLabel>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Nova geslo</FormLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpdate}>
              Shrani
            </Button>
            <Button onClick={onClose}>Prekliči</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;
