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

// TODO - Add validation for input fields
// TODO - Display differend errors (from backend) for failed registration

const Login: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const userContext = useContext<UserContextType>(UserContext);
  const toast = useToast();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3000/user/login', {
        method: 'POST',
        //credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      /*
      if (!res.ok) {
        throw new Error('Network response was not ok');
      }
      */
      console.log(res.status);
      if(res.status === 401){
        const errorData = await res.json();
        setError('Vaš račun je blokiran!!!');
        toast({
          title: 'Dostop zavrnjen',
          description: errorData.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      else{
        const data = await res.json();

        if (data && data._id) {
          userContext.setUserContext(data);
          toast({
            title: 'Prijava uspešna',
            description: `Dobrodošli, ${username}!`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          setError('Nepravilno uporabniško ime ali geslo');
          setUsername('');
          setPassword('');
        }
      }
    } catch (error) {
      console.error(error);
      setError('Napaka pri prijavi. Poskusite znova.');
    }
  };

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
    </Box>
  );
};

export default Login;
