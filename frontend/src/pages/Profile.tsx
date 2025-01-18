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
    Textarea,
  CloseButton,
  Table,
  Tbody, Td, Tr, Th,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { useNavigate } from 'react-router-dom';
import CustomModal from "../components/CustomModalProps";
import axios from 'axios';
import {User} from '../interfaces/User'
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Profile: React.FC = () => {
    //modal window variables
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalMessage, setModalMessage] = useState<string>('');
    const [backgroundColor, setBackgroundColor] = useState<string>('');
    const [headerColor, setHeaderColor] = useState<string>('');
    const [bodyColor, setBodyColor] = useState<string>('');


    const { user, setUserContext } = useContext(UserContext);
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

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const toggleOldPasswordVisibility = () => setShowOldPassword(!showOldPassword);
  const toggleNewPasswordVisibility = () => setShowNewPassword(!showNewPassword);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setBio(user.bio || '');
      setExistingAvatar(user.avatar || null);
    }
  }, [user]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxFileSizeMB = 5;

        if (!file) return;

        // Validate file size
        if (file.size > maxFileSizeMB * 1024 * 1024) {
            setModalTitle("Opozorilo");
            setModalMessage("Slika je lahko maksimalno 5MB velika!");
            setIsModalOpen(true);
            setBackgroundColor("red.200");
            setHeaderColor("blue.600");
            setBodyColor("blue.600");

            setTimeout(() => setIsModalOpen(false), 600);
            return;
        }

        // Validate file type
        if (!validImageTypes.includes(file.type)) {
            setModalTitle("Opozorilo");
            setModalMessage("Avatar je lahko samo v formatu .png, .jpg ali .gif");
            setIsModalOpen(true);
            setBackgroundColor("red.200");
            setHeaderColor("blue.600");
            setBodyColor("blue.600");

            setTimeout(() => setIsModalOpen(false), 600);
            return;
        }

        // Rename the file with a timestamp and set as new avatar
        const timestamp = Date.now();
        const newFileName = `${timestamp}-${file.name}`;
        const newFile = new File([file], newFileName, { type: file.type });

        setNewAvatar(newFile); // Replace the current avatar
        setExistingAvatar(null); // Clear existing avatar
  };

  const handleRemoveAvatar = () => {
    setExistingAvatar(null);
    setNewAvatar(null);
  };

  const handleUpdate = () => {
    if (!username || !email) {
      setModalTitle("Opozorilo");
            setModalMessage("Uporabniško ime in email sta obvezna");
            setIsModalOpen(true);
            setBackgroundColor("red.200");
            setHeaderColor("blue.600");
            setBodyColor("blue.600");
            setOldPassword('');
            setNewPassword('');

            setTimeout(() => {
                setIsModalOpen(false);
                return;
            }, 600);
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

        if (oldPassword) {
            formData.append('oldPassword', oldPassword);
        }
        if (newPassword) {
            /*if (!oldPassword || !newPassword) {
        toast({
          title: 'Both old and new passwords are required to change the password.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
            }*/
      if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30}$/.test(newPassword)) {
                setModalTitle("Ups");
                setModalMessage("Geslo mora biti dolgo vsaj 8 znakov in vsebovati vsaj eno veliko črko in eno številko!");
                setIsModalOpen(true);
                setBackgroundColor("red.200");
                setHeaderColor("blue.600");
                setBodyColor("blue.600");
                setOldPassword('');
                setNewPassword('');

                setTimeout(() => {
                    setIsModalOpen(false);
                    return;
                }, 600);
      }
      formData.append('newPassword', newPassword);
    }

    fetch(url, {
      method: 'PUT',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
                    return response.json().then((error) => {
                        throw new Error(error.message || "Napaka");
                    });
        }
        return response.json();
      })
      .then((data) => {
        const updatedUser = data.user;

        if (updatedUser) {
                    setModalTitle("Profil je bil uspešno posodobljen!");
                    setModalMessage(`Vaš profil je bil uspešno posodobljen.`);
                    setBackgroundColor("green.200");
                    setHeaderColor("blue.600");
                    setBodyColor("blue.600");
                    setIsModalOpen(true);

                    setTimeout(() => {

                        setIsModalOpen(false);
                        setUserContext(updatedUser);
                        onClose();

                    }, 2000);

        } else {
                    throw new Error(updatedUser.message);
        }
      })
      .catch((error) => {
        console.error('Error during profile update:', error);
                setModalTitle("Ups");
                setModalMessage(error.message);
                setIsModalOpen(true);
                setBackgroundColor("red.200");
                setHeaderColor("blue.600");
                setBodyColor("blue.600");
                setOldPassword('');
                setNewPassword('');

                setTimeout(() => {

                    setIsModalOpen(false);

                }, 600);
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
    <Box p={6} maxW="container.md" mx="auto" bg="gray.50" borderRadius="md" boxShadow="lg">
      <Heading as="h2" size="xl" mb={6} textAlign="center" color="blue.600">
        Profil uporabnika
      </Heading>
      <Stack spacing={6} mb={8}>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="gray.700">
            Avatar:
          </Text>
          <Image
            src={
              user.avatar?.imageUrl
                ? `http://localhost:3000${user.avatar.imageUrl}`
                : '/images/avatar_placeholder.png'
            }
            alt={user.avatar?.imageName || 'Placeholder Avatar'}
            boxSize="100px"
            objectFit="cover"
            borderRadius="full"
            border="2px solid"
            borderColor="blue.500"
          />
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="gray.700">
            Uporabniško ime:
          </Text>
          <Text fontSize="md" color="gray.600">{user.username}</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="gray.700">
            Opis:
          </Text>
          <Text fontSize="md" color="gray.600">{user.bio || 'Opis ni na voljo.'}</Text>
        </Box>
        <Box>
          <Text fontSize="lg" fontWeight="bold" color="gray.700">
            E-naslov:
          </Text>
          <Text fontSize="md" color="gray.600">{user.email}</Text>
        </Box>
      </Stack>
  
      {user.role === 'admin' && (
        <>
          <Heading as="h3" size="lg" mb={4} color="blue.600">
            Seznam uporabnikov
          </Heading>
          <Input
            placeholder="Iskanje po uporabniškem imenu"
            value={searchTerm}
            onChange={handleSearch}
            mb={4}
            focusBorderColor="blue.500"
          />
          <Table variant="striped" colorScheme="blue" size="sm">
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
  
      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="blue.600">Uredi profil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={6}>
              <Box>
                <FormLabel>Opis</FormLabel>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Dodajte kratek opis"
                  focusBorderColor="blue.500"
                />
              </Box>
              <Box>
                <FormLabel>Avatar</FormLabel>
                {(existingAvatar || newAvatar) && (
                  <HStack spacing={4}>
                    <Image
                      src={
                        newAvatar
                          ? URL.createObjectURL(newAvatar)
                          : `http://localhost:3000${existingAvatar!.imageUrl}`
                      }
                      alt={newAvatar ? newAvatar.name : existingAvatar!.imageName}
                      boxSize="50px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <CloseButton onClick={handleRemoveAvatar} />
                  </HStack>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  mt={2}
                  onChange={handleFileChange}
                  focusBorderColor="blue.500"
                />
              </Box>
              <Divider />
              <Text fontWeight="bold" color="gray.700">
                Nastavitve s trenutnim geslom
              </Text>
              <Stack spacing={4}>
                <Box>
                  <FormLabel>Uporabniško ime</FormLabel>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    focusBorderColor="blue.500"
                  />
                </Box>
                <Box>
                  <FormLabel>E-naslov</FormLabel>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    focusBorderColor="blue.500"
                  />
                </Box>
                <Box>
                  <FormLabel>Trenutno geslo</FormLabel>
                  <Box display="flex" alignItems="center">
                    <Input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      focusBorderColor="blue.500"
                    />
                    <IconButton
                      aria-label="Toggle old password visibility"
                      icon={showOldPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={toggleOldPasswordVisibility}
                      variant="link"
                      ml={2}
                    />
                  </Box>
                </Box>
                <Box>
                  <FormLabel>Novo geslo</FormLabel>
                  <Box display="flex" alignItems="center">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      focusBorderColor="blue.500"
                    />
                    <IconButton
                      aria-label="Toggle new password visibility"
                      icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={toggleNewPasswordVisibility}
                      variant="link"
                      ml={2}
                    />
                  </Box>
                </Box>
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleUpdate} mr={3}>
              Shrani
            </Button>
            <Button onClick={onClose}>Prekliči</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      {/* Custom Modal */}
      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        backgroundColor={backgroundColor}
        headerColor={headerColor}
        bodyColor={bodyColor}
        duration={1500}
      />
    </Box>
  );  
};

export default Profile;
