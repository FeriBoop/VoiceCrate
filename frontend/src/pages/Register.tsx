import React, {useState, FormEvent, useContext} from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Text,
    Heading,
    useToast,
    Checkbox,
} from '@chakra-ui/react';
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
            bg="white"
        >
            <Stack align="center" mb={6}>
                <Heading as="h2" size="lg" color="blue.600">
                    Registracija YourVoice
                </Heading>
                <Text fontSize="md" color="gray.600">
                    Pridružite se naši skupnosti!
                </Text>
            </Stack>

            <form onSubmit={handleRegister}>
                <Stack spacing={5}>
                    <FormControl id="email" isRequired>
                        <FormLabel fontSize="lg">Email:</FormLabel>
                        <Input
                            type="text"
                            placeholder="Vnesite svoj email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setEmailError(emailRegex.test(email) ? '' : 'Email ni veljaven!')}
                            size="lg"
                        />
                        {emailError !== '' &&
                            <Text color="red.500" fontSize="sm" textAlign="left">
                                {emailError}
                            </Text>
                        }
                    </FormControl>

                    <FormControl id="username" isRequired>
                        <FormLabel fontSize="lg">Uporabniško ime</FormLabel>
                        <Input
                            type="text"
                            placeholder="Vnesite uporabniško ime"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            onBlur={() => setUsernameError(username.length >= usernameLength ? '' : 'Uporabniško ime mora biti dolgo vsaj 3 znake!')}
                            size="lg"
                        />
                        {usernameError !== '' &&
                            <Text color="red.500" fontSize="sm" textAlign="left">
                                {usernameError}
                            </Text>
                        }
                    </FormControl>

                    <FormControl id="password" isRequired>
                        <FormLabel fontSize="lg">Geslo</FormLabel>
                        <Input
                            type={showPassword ? 'text' : 'password'} // Uporabi 'text' ali 'password' glede na stanje
                            placeholder="Vnesite geslo"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => setPasswordError(passwordRegex.test(password) ? '' : 'Geslo mora biti dolgo vsaj 8 znakov in vsebovati vsaj eno veliko črko in eno številko!')}
                            size="lg"
                        />
                        {passwordError !== '' &&
                            <Text color="red.500" fontSize="sm" textAlign="left">
                                {passwordError}
                            </Text>
                        }
                    </FormControl>
                    <FormControl id="passwordAgain" isRequired>
                        <FormLabel fontSize="lg">Ponovite geslo</FormLabel>
                        <Input
                            type={showPassword ? 'text' : 'password'} // Uporabi 'text' ali 'password' glede na stanje
                            placeholder="Ponovite geslo"
                            value={passwordAgain}
                            onChange={(e) => setPasswordAgain(e.target.value)}
                            onBlur={() => setPasswordAgainError(password === passwordAgain ? '' : 'Gesli se ne ujemata!')}
                            size="lg"
                        />
                        {passwordAgainError !== '' &&
                            <Text color="red.500" fontSize="sm" textAlign="left">
                                {passwordAgainError}
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

                    <Button
                        colorScheme="blue"
                        type="submit"
                        mt={4}
                        size="lg"
                        width="full"
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
