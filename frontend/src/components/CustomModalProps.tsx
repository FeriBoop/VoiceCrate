import React, { useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useBreakpointValue,
  Box,
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
const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  headerColor = 'blue.500',
  bodyColor = 'gray.700',
  backgroundColor = 'white',
  duration = 2000,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        bg={backgroundColor}
        borderRadius="lg"
        boxShadow="lg"
        transition="all 0.3s ease"
      >
        <ModalHeader
          color={headerColor}
          textAlign="center"
          fontWeight="bold"
          fontSize={useBreakpointValue({ base: 'lg', md: 'xl' })}
          borderBottom="2px solid"
          borderColor={headerColor}
          py={4}
        >
          {title}
        </ModalHeader>
        <ModalBody
          color={bodyColor}
          textAlign="center"
          fontSize={useBreakpointValue({ base: 'sm', md: 'md' })}
          px={6}
          py={4}
        >
          {message}
        </ModalBody>
        <ModalFooter justifyContent="center" pb={6}>
          {/* Optional footer buttons */}
          <Button
            colorScheme="blue"
            variant="solid"
            size="sm"
            onClick={onClose}
            px={6}
            py={3}
            fontWeight="medium"
            _hover={{ bg: 'blue.600' }}
            _active={{ bg: 'blue.700' }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
