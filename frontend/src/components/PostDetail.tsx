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
} from '@chakra-ui/react';
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
  const {isOpen, onOpen, onClose} = useDisclosure();
  const {user} = useContext(UserContext);
  const navigate = useNavigate();

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
        onClose();
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
    >
      <Button onClick={() => {
        const lastPage = localStorage.getItem('lastPage');
        const page = lastPage ? parseInt(lastPage) : 1; // Default to page 1 if no page is saved
        navigate(`/posts?page=${page}`);
      }} colorScheme="teal" mb={6}>
        Nazaj na objave
      </Button>
      {loading ? (
        <Spinner size="xl"/>
      ) : post ? (
        <>
          <Heading as="h2" size="xl" mb={4} textAlign="center" color="teal.600">
            {post.title}
          </Heading>
          <Divider mb={4}/>
          <Flex justify="space-between" color="gray.500" fontSize="sm" mb={6}>
            <Text>
              Kategorija: <strong>{post.category}</strong>
            </Text>
            <Text>
              Datum: <b>{new Date(post.createdAt).toLocaleDateString()}</b>
            </Text>
          </Flex>
          <ImageSlideshow images={post.images} />
          <Text color="gray.500" fontSize="sm" mb={4}>
            Avtor:{' '}
            <strong>{post.userId?.username || 'Unknown user'}</strong>
          </Text>
          <Text fontSize="md" lineHeight="tall" mt={4} color="gray.700">
            {post.content}
          </Text>
          <VoteWidget postId={post._id}/>
          <Divider my={6}/>
          <Heading as="h3" size="md" mb={4}>
            Komentarji
          </Heading>

          <Button colorScheme="teal" mb={4} onClick={onOpen}>
            Dodaj komentar
          </Button>

          {comments && comments.length > 0 ? (
            <VStack spacing={4} align="start">
              {comments
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
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
                        Delete
                      </Button>
                    )}
                  </Box>
                ))}
            </VStack>
          ) : (
            <Text color="gray.500">
              Ni še komentarjev bodi prvi ki boš komentiral!
            </Text>
          )}

          <Modal
            isOpen={isOpen}
            onClose={onClose}
            initialFocusRef={textareaRef}
          >
            <ModalOverlay/>
            <ModalContent>
              <ModalHeader>Dodaj komentar</ModalHeader>
              <ModalCloseButton/>
              <ModalBody>
                <Textarea
                  ref={textareaRef}
                  placeholder="Enter your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="teal" onClick={handleCommentSubmit}>
                  Dodaj
                </Button>
                <Button onClick={onClose} ml={3}>
                  Prekliči
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      ) : (
        <Text color="red.500">Post not found.</Text>
      )}
    </Box>
  );
};

export default PostDetail;
