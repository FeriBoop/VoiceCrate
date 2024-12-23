import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Spinner,
  Button,
  Divider,
  Flex,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import { User } from '../interfaces/User'

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  userId: User;
}

interface Post {
  title: string;
  content: string;
  category: string;
  createdAt: string;
  userId?: User;
  comments?: Comment[];
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // Ustvarite ref za textarea
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fetchPost = () => {
    setLoading(true);
    fetch(`http://localhost:3000/post/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju objave:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPost(); // Inicialno naložite podatke o objavi
  }, [id]);

  const handleCommentSubmit = () => {
    if (newComment.trim() === '') {
      alert('Komentar ne sme biti prazen.');
      return;
    }

    if (!user) {
      alert('Prijavite se za dodajanje komentarja.');
      return;
    }

    fetch(`http://localhost:3000/post/${id}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newComment,
        userId: user._id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Napaka pri dodajanju komentarja');
        }
        return response.json();
      })
      .then(() => {
        setNewComment(''); // Počistite vnos
        onClose();
        fetchPost(); // Ponovno naložite objavo, da pridobite najnovejše komentarje
      })
      .catch((error) => {
        console.error('Napaka pri dodajanju komentarja:', error);
      });
  };

  const handleCommentDelete = (commentId: string) => {
    if (!user) {
      alert('Prijavite se za brisanje komentarja.');
      return;
    }

    fetch(`http://localhost:3000/post/${id}/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Napaka pri brisanju komentarja');
        }
        fetchPost(); // Ponovno naložite objavo, da pridobite najnovejše komentarje
      })
      .catch((error) => {
        console.error('Napaka pri brisanju komentarja:', error);
      });
  };

  return (
    <Box
      p={8}
      maxW="container.md"
      mx="auto"
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
    >
      <Button onClick={() => navigate('/posts')} colorScheme="teal" mb={6}>
        Nazaj na objave
      </Button>
      {loading ? (
        <Spinner size="xl" />
      ) : post ? (
        <>
          <Heading as="h2" size="xl" mb={4} textAlign="center" color="teal.600">
            {post.title}
          </Heading>
          <Divider mb={4} />
          <Flex justify="space-between" color="gray.500" fontSize="sm" mb={6}>
            <Text>
              Kategorija: <strong>{post.category}</strong>
            </Text>
            <Text>
              Datum: <b>{new Date(post.createdAt).toLocaleDateString()}</b>
            </Text>
          </Flex>
          <Text color="gray.500" fontSize="sm" mb={4}>
            Avtor:{' '}
            <strong>{post.userId?.username || 'Neznan uporabnik'}</strong>
          </Text>
          <Text fontSize="md" lineHeight="tall" mt={4} color="gray.700">
            {post.content}
          </Text>
          <Divider my={6} />
          <Heading as="h3" size="md" mb={4}>
            Komentarji
          </Heading>

          <Button colorScheme="teal" mb={4} onClick={onOpen}>
            Dodaj komentar
          </Button>

          {post.comments && post.comments.length > 0 ? (
            <VStack spacing={4} align="start">
              {post.comments
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((comment) => (
                  <Box
                    key={comment._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    w="full"
                  >
                    <Text fontSize="sm" color="gray.500">
                      {comment.userId.username} -{' '}
                      {new Date(comment.createdAt).toLocaleString()}
                    </Text>
                    <Text>{comment.content}</Text>
                    {(user?._id === comment.userId._id || user?.role === 'admin') && (
                      <Button
                        colorScheme="red"
                        size="sm"
                        mt={2}
                        onClick={() => handleCommentDelete(comment._id)}
                      >
                        Izbriši
                      </Button>
                    )}
                  </Box>
                ))}
            </VStack>
          ) : (
            <Text color="gray.500">
              Ni komentarjev. Bodite prvi, ki komentirate!
            </Text>
          )}

          <Modal
            isOpen={isOpen}
            onClose={onClose}
            initialFocusRef={textareaRef}
          >
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Dodaj komentar</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Textarea
                  ref={textareaRef} // Povezava referenc
                  placeholder="Vnesite svoj komentar..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" onClick={handleCommentSubmit}>
                  Objavi
                </Button>
                <Button onClick={onClose} ml={3}>
                  Prekliči
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Text color="red.500">Objava ni najdena.</Text>
      )}
    </Box>
  );
};

export default PostDetail;
