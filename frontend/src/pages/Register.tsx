import React, {useState, FormEvent, useContext} from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Checkbox,
    Heading,
    Text,
    Stack,
    VStack,
    useColorModeValue,
    IconButton,
  } from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {UserContext, UserContextType} from '../userContext';
import {useNavigate} from 'react-router-dom';
import CustomModal from "../components/CustomModalProps";

// TODO - Add validation for input fields
// TODO - Display differend errors (from backend) for failed registration

/**
 * Registration function
 * User must provide a unique email and username
 * User must provide a username that is ta least 3 characters long, email and password in valid format
 * There is validation on frontend side and on user side
 */
const Register: React.FC = () => {
    // form data variables
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordAgain, setPasswordAgain] = useState<string>('')
    const [email, setEmail] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false); // Stan za prikaz gesla

    //modal window variables
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalTitle, setModalTitle] = useState<string>(''); // Title for modal
    const [modalMessage, setModalMessage] = useState<string>('');
    const [backgroundColor, setBackgroundColor] = useState<string>('');
    const [headerColor, setHeaderColor] = useState<string>('');
    const [bodyColor, setBodyColor] = useState<string>('');

    //frontend validation variables
    const usernameLength = 3;
    const emailRegex = /^[\w-.]+@([\w-]+\.)+\w+$/; // Standard email regex
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,30}$/; // At least 8 chars, one uppercase, one lowercase, one digit
    const [usernameError, setUsernameError] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [passwordError, setPasswordError] = useState<string>('');
    const [passwordAgainError, setPasswordAgainError] = useState<string>('');

    //user session variables
    const userContext = useContext<UserContextType>(UserContext);
    //const toast = useToast();
    const navigate = useNavigate();

    /**
     * registration function. It validates form inputs, send post request on servers and displays result
     * @param e
     */
    const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();


        //ERROR HANDLING ON FRONTEND
        setUsernameError('');
        setEmailError('');
        setPasswordError('');
        if (username.length < usernameLength) { //username must be at least 3 char length
            setUsernameError('Uporabniško ime mora biti dolgo vsaj 3 znake!');
            setPassword('');
            setPasswordAgain('');
        } else if (!emailRegex.test(email)) { //email must be in valid regex format
            setEmailError('Email ni veljaven!');
            setPassword('');
            setPasswordAgain('');
        } else if (!passwordRegex.test(password)) { // password must be in valid regex format
            setPasswordError('Geslo mora biti dolgo vsaj 8 znakov in vsebovati vsaj eno veliko črko in eno številko!');
            setPassword('');
            setPasswordAgain('');
        } else if (password !== passwordAgain) { //password must match
            setPasswordAgainError('Gesli se ne ujemata!');
            setPassword('');
            setPasswordAgain('');
        } else {
            try {
                //sending data to api
                const res = await fetch('http://localhost:3000/user', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password, email}),
                });

                const data = await res.json();

                if (!res.ok) { // if result status code is not 200
                    //throw new Error('Network response was not ok');
                    setModalTitle("Ups");
                    setModalMessage(data.message);
                    setIsModalOpen(true);
                    setBackgroundColor("red.200");
                    setHeaderColor("blue.600");
                    setBodyColor("blue.600");
                    setUsername('');
                    setPassword('');
                    setEmail('');
                    setPasswordAgain('');
                }

                if (data && data._id) { //request status code is 200


                    /*toast({
                      title: 'Registracija uspešna!',
                      description: `Dobrodošli, ${username}!`,
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });*/
                    setUsername('');
                    setPassword('');
                    setEmail('');
                    setPasswordAgain('');
                    setModalTitle("Registracija uspešna!");
                    setModalMessage(`Dobrodošli, ${username}! Vaša registracija je bila uspešna.`);
                    setBackgroundColor("green.200");
                    setHeaderColor("blue.600");
                    setBodyColor("blue.600");
                    setIsModalOpen(true);

                    // Navigate to home after a delay
                    setTimeout(() => {

                        setIsModalOpen(false); // Close modal
                        userContext.setUserContext(data); // Setting user context with the new user data
                        navigate('/'); // Navigate to home page or desired route
                    }, 2000);
                } else { //handle error
                    setUsername('');
                    setPassword('');
                    setEmail('');
                    setPasswordAgain('');
                    setModalTitle("Ups");
                    setModalMessage(data.message);
                    setIsModalOpen(true);
                    setBackgroundColor("red.200");
                    setHeaderColor("blue.600");
                    setBodyColor("blue.600");
                }
            } catch (error) { //handle catch error
                setUsername('');
                setPassword('');
                setEmail('');
                setPasswordAgain('');
                setModalTitle("Ups");
                setModalMessage('Registracija ni uspela. Prosimo, poskusite znova.');
                setIsModalOpen(true);
                setBackgroundColor("red.200");
                setHeaderColor("blue.600");
                setBodyColor("blue.600");
            }
        }
    };

    return (
        <Box
          maxW="lg"
          mx="auto"
          mt={12}
          p={8}
          borderWidth={1}
          borderRadius="lg"
          boxShadow="2xl"
          bg={useColorModeValue("white", "gray.800")}
        >
          <VStack spacing={6} align="center" mb={6}>
            <Heading as="h2" size="lg" color={useColorModeValue("blue.600", "blue.300")}>
              Registracija YourVoice
            </Heading>
            <Text fontSize="md" color={useColorModeValue("gray.600", "gray.400")} textAlign="center">
              Pridružite se naši skupnosti!
            </Text>
          </VStack>
    
          <form onSubmit={handleRegister}>
            <Stack spacing={6}>
              {/* Email Field */}
              <FormControl id="email" isRequired>
                <FormLabel fontSize="lg" color={useColorModeValue("gray.700", "gray.300")}>
                  Email
                </FormLabel>
                <Input
                  type="email"
                  placeholder="Vnesite svoj email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailError(emailRegex.test(email) ? "" : "Email ni veljaven!")}
                  size="lg"
                  focusBorderColor="blue.500"
                  bg={useColorModeValue("gray.50", "gray.700")}
                />
                {emailError && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {emailError}
                  </Text>
                )}
              </FormControl>
    
              {/* Username Field */}
              <FormControl id="username" isRequired>
                <FormLabel fontSize="lg" color={useColorModeValue("gray.700", "gray.300")}>
                  Uporabniško ime
                </FormLabel>
                <Input
                  type="text"
                  placeholder="Vnesite uporabniško ime"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() =>
                    setUsernameError(username.length >= usernameLength ? "" : "Uporabniško ime mora biti dolgo vsaj 3 znake!")
                  }
                  size="lg"
                  focusBorderColor="blue.500"
                  bg={useColorModeValue("gray.50", "gray.700")}
                />
                {usernameError && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {usernameError}
                  </Text>
                )}
              </FormControl>
    
              {/* Password Field */}
              <FormControl id="password" isRequired>
                <FormLabel fontSize="lg" color={useColorModeValue("gray.700", "gray.300")}>
                  Geslo
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Vnesite geslo"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() =>
                      setPasswordError(
                        passwordRegex.test(password)
                          ? ""
                          : "Geslo mora biti dolgo vsaj 8 znakov in vsebovati vsaj eno veliko črko in eno številko!"
                      )
                    }
                    focusBorderColor="blue.500"
                    bg={useColorModeValue("gray.50", "gray.700")}
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                      variant="ghost"
                      aria-label={showPassword ? "Skrij geslo" : "Prikaži geslo"}
                    />
                  </InputRightElement>
                </InputGroup>
                {passwordError && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {passwordError}
                  </Text>
                )}
              </FormControl>
    
              {/* Confirm Password Field */}
              <FormControl id="passwordAgain" isRequired>
                <FormLabel fontSize="lg" color={useColorModeValue("gray.700", "gray.300")}>
                  Ponovite geslo
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Ponovite geslo"
                    value={passwordAgain}
                    onChange={(e) => setPasswordAgain(e.target.value)}
                    onBlur={() =>
                      setPasswordAgainError(password === passwordAgain ? "" : "Gesli se ne ujemata!")
                    }
                    focusBorderColor="blue.500"
                    bg={useColorModeValue("gray.50", "gray.700")}
                  />
                  <InputRightElement>
                    <IconButton
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      size="sm"
                      variant="ghost"
                      aria-label={showPassword ? "Skrij geslo" : "Prikaži geslo"}
                    />
                  </InputRightElement>
                </InputGroup>
                {passwordAgainError && (
                  <Text color="red.500" fontSize="sm" mt={1}>
                    {passwordAgainError}
                  </Text>
                )}
              </FormControl>
    
              {/* Register Button */}
              <Button
                colorScheme="blue"
                type="submit"
                size="lg"
                width="full"
                mt={4}
                boxShadow="md"
              >
                Registracija
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

export default Register;
