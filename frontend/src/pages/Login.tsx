import React, { useContext, useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  Image,
  Heading,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { UserContext, UserContextType } from '../userContext';
import CustomModal from "../components/CustomModalProps";

// TODO - Add validation for input fields
// TODO - Display differend errors (from backend) for failed registration

/**
 * Login Function
 * User must provide username and password
 * There is validation on server side
 */
const Login: React.FC = () => {
  //form data varables
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  //modal window variables
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>(''); // Title for modal
  const [modalMessage, setModalMessage] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [headerColor, setHeaderColor] = useState<string>('');
  const [bodyColor, setBodyColor] = useState<string>('');

  //user session variables
  const userContext = useContext<UserContextType>(UserContext);
  const toast = useToast();

  /**
   * login function. It sends post request on API and handles the result from it
   * @param e
   */
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //check for empty string
    if(username === ''){
      setUsernameError('Uporabniško ime ne sme biti prazno!!!');
    }
    else if(password === ''){
      setPasswordError('Geslo ne sme biti prazno!!!');
    }
    else {
      //send post request to server
      try {
        const res = await fetch('http://localhost:3000/user/login', {
          method: 'POST',
          //credentials: 'include',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({username, password}),
        });

        const data = await res.json();

        if (!res.ok) { // if result status is not 200
          //throw new Error('Network response was not ok');
          setModalTitle("Ups");
          setModalMessage(data.message);
          setIsModalOpen(true);
          setBackgroundColor("red.200");
          setHeaderColor("blue.600");
          setBodyColor("blue.600");
          setUsername('');
          setPassword('');
          if(res.status === 401){
            setModalMessage(data.message);
            setError('Vaš račun je blokiran!!!');
            return;
          }
        }


        if (data && data._id) { // if result status is 200
          setModalTitle('Prijava uspešna');
          setModalMessage(`Dobrodošli nazaj, ${username}!`);
          setBackgroundColor("green.200");
          setHeaderColor("blue.600");
          setBodyColor("blue.600");
          setIsModalOpen(true);

          //navigate to index
          setTimeout(() => {
            setIsModalOpen(false); // Close modal
            userContext.setUserContext(data); // Setting user context with the new user data
          }, 1500);

        } else { // if error
          setModalTitle("Ups");
          setModalMessage(data.message);
          setIsModalOpen(true);
          setBackgroundColor("red.200");
          setHeaderColor("blue.600");
          setBodyColor("blue.600");
          setUsername('');
          setPassword('');
        }
      } catch (error) { // if catch error
        console.error(error);
        setModalTitle('Napaka');
        setModalMessage('Napaka pri prijavi. Poskusite znova.');
        setIsModalOpen(true);
        setBackgroundColor("red.200");
        setHeaderColor("blue.600");
        setBodyColor("blue.600");
        setUsername('');
        setPassword('');
      }
    }
  };

  //return render
  return (
    <Box
      maxW="xl"
      mx="auto"
      mt={12}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="2xl"
      bg="white"
    >
      {userContext.user ? <Navigate replace to="/" /> : null}

      <Stack align="center" mb={6}>
        <Image
          src="images/default.png"
          alt="YourVoice Logo"
          boxSize="150px"
          mb={4}
        />
        <Heading as="h2" size="lg" color="blue.600">
          Prijava v YourVoice
        </Heading>
        <Text fontSize="md" color="gray.600">
          Pridružite se pogovoru!
        </Text>
      </Stack>

      <form onSubmit={handleLogin}>
        <Stack spacing={5}>
          <FormControl id="username" isRequired>
            <FormLabel fontSize="lg">Uporabniško ime</FormLabel>
            <Input
              type="text"
              placeholder="Vnesite uporabniško ime"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="lg"
            />
            {usernameError !== '' &&
                <Text color="red.500" fontSize="sm" textAlign="center">
                  {usernameError}
                </Text>
            }
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel fontSize="lg">Geslo</FormLabel>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Vnesite geslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="lg"
            />
            {passwordError === '' &&
                <Text color="red.500" fontSize="sm" textAlign="left">
                  {usernameError}
                </Text>
            }
            <Checkbox
              mt={2}
              isChecked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              required={false}
            >
              Prikaži geslo
            </Checkbox>
          </FormControl>

          {error && (
            <Text color="red.500" fontSize="sm" textAlign="center">
              {error}
            </Text>
          )}

          <Button
            colorScheme="blue"
            type="submit"
            mt={4}
            size="lg"
            width="full"
          >
            Prijava
          </Button>
        </Stack>
      </form>
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

export default Login;
