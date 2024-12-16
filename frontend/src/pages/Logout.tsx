import React, {useEffect, useContext, useState} from 'react';
import { UserContext, UserContextType } from '../userContext'; // Ensure UserContextType is defined
import { useNavigate } from 'react-router-dom';
import CustomModal from "../components/CustomModalProps";

/**
 * Logout function
 * It logouts user
 */
const Logout: React.FC = () => {
  const userContext = useContext<UserContextType>(UserContext); // Ensure UserContext is properly typed
  const navigate = useNavigate();
  //for modal window
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>(''); // Title for modal
  const [modalMessage, setModalMessage] = useState<string>('');
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [headerColor, setHeaderColor] = useState<string>('');
  const [bodyColor, setBodyColor] = useState<string>('');

  useEffect(() => {
    const logout = async () => {
      try {
        // Display modal window
        setModalTitle('Odjava uspešna!');
        setModalMessage('Vaša odjava je bila uspešna.');
        setBackgroundColor('blue.200');
        setHeaderColor('black');
        setBodyColor('gray.800');
        setIsModalOpen(true);

        setTimeout(() => {
          userContext.setUserContext(null); // Clear user context
          navigate('/login'); // Redirect to login page
        }, 1500); // Adjust the timeout duration as needed

        // Perform logout logic
       /*const res = await fetch('http://localhost:3001/users/logout', {
          method: 'POST',
          credentials: 'include',
        });



        if (!res.ok) {
          throw new Error('Odjava ni uspela.');
        }

        */
      } catch (error) { // if error set error message
        // Handle errors and show error modal
        const errorMessage = error instanceof Error ? error.message : 'Napaka pri odjavi.';
        setModalTitle('Napaka');
        setModalMessage(errorMessage);
        setBackgroundColor('red.200');
        setHeaderColor('black');
        setBodyColor('gray.800');
        setIsModalOpen(true);

      }
    };

    logout();
  }, []); // `userContext` is not expected to change, but you can keep it for safety

  //return render
  return(
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
  );
};

export default Logout;
