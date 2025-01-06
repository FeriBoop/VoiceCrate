// AddPostModal.tsx
import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Button,
  CloseButton,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';

import {UserContext} from '../userContext';
import {Post} from '../interfaces/Post';

interface AddPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostAdded: () => void;
  post: Post | null;
}

const AddPostModal: React.FC<AddPostModalProps> = ({
                                                     isOpen,
                                                     onClose,
                                                     onPostAdded,
                                                     post,
                                                   }) => {
  const { user } = useContext(UserContext); // Get the currently logged-in user
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [existingImages, setExistingImages] = useState<{
    imageName: string;
    imageUrl: string;
  }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const toast = useToast();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Reset form state when modal closes or for a new post
  const handleModalClose = () => {
    setTitle('');
    setContent('');
    setCategory('');
    setExistingImages([]);
    setNewImages([]);
    onClose(); // Call the original onClose passed from parent
  };

  // Populate fields when post is provided (for editing)
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategory(post.category);
      setExistingImages(post.images || []);
    } else {
      // If no post, reset the form for a new post
      setTitle('');
      setContent('');
      setCategory('');
      setExistingImages([]);
      setNewImages([]);
    }
  }, [post, isOpen]); // Ensure reset is triggered when modal opens

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);

    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif']; // Allowed image types
    const maxFileSizeMB = 5;

    const filteredFiles: File[] = [];
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
      filteredFiles.push(file);
    }

    if (filteredFiles.length + existingImages.length + newImages.length > 10) {
      toast({
        title: 'Upload limit exceeded',
        description: 'You can upload a maximum of 10 images.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const timestampedFiles = filteredFiles.map((file) => {
      const timestamp = Date.now();
      const newFileName = `${timestamp}-${file.name}`; // Add the timestamp prefix
      return new File([file], newFileName, { type: file.type });
    });

    setNewImages((prevImages) => [...prevImages, ...timestampedFiles]);
  };


  const removeExistingImage = (index: number) => {
    setExistingImages((prevImages) =>
        prevImages.filter((_, i) => i !== index)
    );
  };

  const removeNewImage = (index: number) => {
    setNewImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!user) {
      toast({ title: 'Napaka: Uporabnik ni prijavljen.', status: 'error' });
      return;
    }

    const url = post ? `http://localhost:3000/post/${post._id}` : 'http://localhost:3000/post';
    const method = post ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('category', category);
    formData.append('userId', user._id);

    // Combine all existing images into a single JSON array
    if (existingImages.length > 0) {
      formData.append('existingImages', JSON.stringify(existingImages));
    }

    // Add new image files
    newImages.forEach((file) => {
      console.log('Appending file to FormData:', file.name);
      formData.append('newImages', file); // Files go here
    });

    fetch(url, {
      method,
      body: formData,
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          toast({
            title: post ? 'Objava uspešno posodobljena!' : 'Objava uspešno dodana!',
            status: 'success',
          });
          setTitle('');
          setContent('');
          setCategory('');
          setExistingImages([]);
          setNewImages([]);
          onPostAdded();
          onClose();
        })
        .catch((error) => {
          console.error('Error adding/updating post:', error);
          toast({
            title: 'Napaka pri dodajanju/posodabljanju objave.',
            status: 'error',
          });
        });
  };


  return (
      <Modal
          isOpen={isOpen}
          onClose={handleModalClose} // Use handleModalClose here
          initialFocusRef={titleInputRef} // Set focus on the first input field
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{post ? 'Uredi objavo' : 'Dodaj novo objavo'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mb={4}>
              <FormLabel>Naslov</FormLabel>
              <Input
                  ref={titleInputRef} // Ref for focus
                  placeholder="Vnesite naslov"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Kategorija</FormLabel>
              <Input
                  placeholder="Vnesite kategorijo"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
              />
            </FormControl>
            <FormControl mb={4}>
              <FormLabel>Vsebina</FormLabel>
              <Textarea
                  placeholder="Vnesite vsebino"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
              />
            </FormControl>

            {/* images */}
            <FormControl mb={4}>
              <FormLabel>Images</FormLabel>
              <Text fontWeight="bold" mb={2}>
                Existing Images:
              </Text>
              <VStack spacing={3} align="stretch">
                {existingImages.map((image, index) => (
                    <HStack
                        key={index}
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        overflow="hidden"
                        spacing={3}
                        align="center"
                    >
                      <Image
                          src={'http://localhost:3000'+image.imageUrl}
                          alt={image.imageName}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                      />
                      <Text flex="1">{image.imageName}</Text>
                      <CloseButton
                          size="sm"
                          onClick={() => removeExistingImage(index)}
                      />
                    </HStack>
                ))}
              </VStack>
              <Text fontWeight="bold" mt={4} mb={2}>
                Upload New Images:
              </Text>
              <Button as="label" htmlFor="file-upload" variant="outline" mb={2}>
                Upload Images
              </Button>
              <Input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  display="none"
                  onChange={handleFileChange}
              />
              <VStack spacing={3} align="stretch">
                {newImages.map((image, index) => (
                    <HStack
                        key={index}
                        p={2}
                        borderWidth="1px"
                        borderRadius="md"
                        overflow="hidden"
                        spacing={3}
                        align="center"
                    >
                      <Image
                          src={URL.createObjectURL(image)}
                          alt={image.name}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                      />
                      <Text flex="1">{image.name}</Text>
                      <CloseButton size="sm" onClick={() => removeNewImage(index)} />
                    </HStack>
                ))}
              </VStack>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit} mr={3}>
              {post ? 'Shrani' : 'Dodaj'}
            </Button>
            <Button onClick={handleModalClose}>Prekliči</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default AddPostModal;
