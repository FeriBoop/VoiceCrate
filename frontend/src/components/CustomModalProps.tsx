import React, {useEffect} from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    //Button,
} from '@chakra-ui/react';
import { CustomModalProps } from '../interfaces/CustomModalProps';

/**
 * Function for creating and displaying modal window
 * @param isOpen
 * @param onClose
 * @param title
 * @param message
 * @param headerColor
 * @param bodyColor
 * @param backgroundColor
 * @param duration
 * @constructor
 */
const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onClose, title, message, headerColor = "blue.500",
    bodyColor = "gray.700",
    backgroundColor = "white",
    duration = 1500
 }) => {
    useEffect(() => { // sets to automatically close window after provided time
        if(isOpen){
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    })
    //return render
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={backgroundColor}>
                <ModalHeader color={headerColor} textAlign={"center"}>{title}</ModalHeader>
                <ModalBody color={bodyColor} textAlign={"center"}>{message}</ModalBody>
                <ModalFooter>
                    {/*<Button onClick={onClose}>Close</Button>*/}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default CustomModal;