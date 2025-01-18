import React, {useEffect, useState, useContext, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
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
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import { UserContext } from '../userContext';
import ImageSlideshow from "./ImageSlideShow";

import VoteWidget from "./VoteWidget";
import { User } from '../interfaces/User'

interface Comment {
  _id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: User;
  postId: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  score: number;
  images: [
    {
      imageName: string,
      imageUrl: string,
    }
  ];
  userId?: User;
}

const PostDetail: React.FC = () => {
  const {id} = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[] | null>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const { isOpen, onOpen: openModal, onClose: closeModal } = useDisclosure();
  const {user} = useContext(UserContext);
  const navigate = useNavigate();
  const arrowSize = useBreakpointValue({ base: '4', md: '6' });

  // Create ref for the textarea
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
        console.error('Error fetching post:', error);
        setLoading(false);
      });

    fetch(`http://localhost:3000/comment?postId=${id}`).then(
      (response) => {
        if (!response.ok) {
          throw new Error("Could not fetch comments")
        }
        return response.json();
      }).then((data) => {
      setComments(data);
    }).catch((err) => {
      console.error('Napaka pri pridobivanju komentarjev:', err);
    })
  };

  useEffect(() => {
    fetchPost(); // Initially load post data
  }, [id]);

  const handleCommentSubmit = () => {
    if (newComment.trim() === '') {
      alert('Comment cannot be empty.');
      return;
    }

    if (!user) {
      alert('Please log in to add a comment.');
      return;
    }

    fetch(`http://localhost:3000/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newComment,
        userId: user._id,
        postId: id
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error adding comment');
        }
        return response.json();
      })
      .then(() => {
        setNewComment(''); // Clear input
        closeModal(); // Close modal
        fetchPost(); // Reload post to get updated comments
      })
      .catch((error) => {
        console.error('Error adding comment:', error);
      });
  };

  const handleCommentDelete = (commentId: string) => {
    if (!user) {
      alert('Please log in to delete a comment.');
      return;
    }

    fetch(`http://localhost:3000/comment/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error deleting comment');
        }
        fetchPost(); // Reload post to get updated comments
      })
      .catch((error) => {
        console.error('Error deleting comment:', error);
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
      bg="white"
      _dark={{ bg: 'gray.800', color: 'gray.200' }}
    >
      {/* Back Button */}
      <Button
        onClick={() => {
          const lastPage = localStorage.getItem('lastPage');
          const page = lastPage ? parseInt(lastPage) : 1;
          navigate(`/posts?page=${page}`);
        }}
        colorScheme="teal"
        mb={6}
        size="lg"
        variant="solid"
        leftIcon={<ChevronLeftIcon w={arrowSize} h={arrowSize} />}
      >
        Nazaj na objave
      </Button>

      {/* Post Content */}
      {loading ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" thickness="4px" color="teal.500" />
        </Flex>
      ) : post ? (
        <>
          {/* Post Title */}
          <Heading as="h2" size="xl" mb={4} textAlign="center" color="teal.600">
            {post.title}
          </Heading>
          <Divider mb={4} />

          {/* Post Details */}
          <Flex justify="space-between" color="gray.500" fontSize="sm" mb={6}>
            <Text>
              <strong>Kategorija:</strong> {post.category}
            </Text>
            <Text>
              <strong>Datum:</strong> {new Date(post.createdAt).toLocaleDateString()}
            </Text>
          </Flex>

          {/* Slideshow */}
          <ImageSlideshow images={post.images} />

          {/* Author Info */}
          <Text color="gray.500" fontSize="sm" mt={12} mb={6}> {/* Increased margin-bottom */}
            <strong>Avtor:</strong> {post.userId?.username || 'Unknown user'}
          </Text>

          {/* Post Content */}
          <Text fontSize="md" lineHeight="tall" mt={4} color="gray.700">
            {post.content}
          </Text>

          {/* Voting Widget */}
          <VoteWidget postId={post._id} />

          {/* Divider */}
          <Divider my={6} />

          {/* Comments Section */}
          <Heading as="h3" size="md" mb={4}>
            Komentarji
          </Heading>
          <Button colorScheme="teal" mb={4} onClick={openModal}>
            Dodaj komentar
          </Button>

          {/* Comments List */}
          {comments && comments.length > 0 ? (
            <VStack spacing={4} align="stretch">
              {comments
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                )
                .map((comment) => (
                  <Box
                    key={comment._id}
                    p={4}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="gray.50"
                    _dark={{ bg: 'gray.700' }}
                    shadow="sm"
                  >
                    <Flex justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">
                        {comment.userId.username} -{' '}
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                      {(user?._id === comment.userId._id || user?.role === 'admin') && (
                        <Button
                          colorScheme="red"
                          size="xs"
                          onClick={() => handleCommentDelete(comment._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Flex>
                    <Text mt={2}>{comment.content}</Text>
                  </Box>
                ))}
            </VStack>
          ) : (
            <Text color="gray.500">Ni še komentarjev. Bodi prvi, ki boš komentiral!</Text>
          )}

          {/* Add Comment Modal */}
          <Modal isOpen={isOpen} onClose={closeModal}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Dodaj komentar</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Textarea
                  placeholder="Enter your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" onClick={handleCommentSubmit}>
                  Dodaj
                </Button>
                <Button onClick={closeModal} ml={3}>
                  Prekliči
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Text color="red.500" textAlign="center">
          Post not found.
        </Text>
      )}
    </Box>
  );  
};

export default PostDetail;
