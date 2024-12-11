import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Heading,
  Button,
  Stack,
  Text,
  Spinner,
  useDisclosure,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link, useNavigate, useLocation } from 'react-router-dom';  // Add useNavigate
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0); // To store total number of posts
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);

  const postsPerPage = 10;
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation();

  const loadPosts = (page: number) => {
    setLoading(true);
    fetch(`http://localhost:3000/post?page=${page}&limit=${postsPerPage}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setPosts(data.posts.reverse());
        setTotalPosts(data.totalPosts); // Set total posts for pagination
        setLoading(false);
        localStorage.setItem('lastPage', page.toString()); // Save current page to localStorage
      })
      .catch((error) => {
        console.error('Error loading posts:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const savedPage = localStorage.getItem('lastPage');
    const initialPage = savedPage ? parseInt(savedPage) : 1;
    setCurrentPage(initialPage);
    loadPosts(initialPage);
  }, []);

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  const handlePostAdded = () => {
    loadPosts(currentPage);
    setSelectedPost(null); // Reset selected post after adding
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post); // Set the selected post for editing
    onOpen(); // Open the modal
  };

  const handleDeletePost = (id: string) => {
    fetch(`http://localhost:3000/post/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          loadPosts(currentPage); // Reload posts after deletion
        } else {
          console.error('Error deleting post');
        }
      })
      .catch((error) => {
        console.error('Error deleting post:', error);
      });
  };

  const handleNextPage = () => {
    if (currentPage * postsPerPage < totalPosts) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const totalPages = Math.ceil(totalPosts / postsPerPage);

  return (
    <Box p={6} maxW="container.lg" mx="auto">
      <Heading as="h2" size="xl" mb={6} textAlign="center">
        Forum - Objave
      </Heading>
      {user && (
        <Button onClick={onOpen} colorScheme="blue" mb={6}>
          Dodaj novo objavo
        </Button>
      )}
      {loading ? (
        <Spinner size="xl" />
      ) : posts.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
          Trenutno ni nobenih objav.
        </Text>
      ) : (
        <Stack spacing={6}>
          {posts.map((post) => (
            <Box
              key={post._id}
              p={5}
              shadow="md"
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ bg: 'gray.50' }}
            >
              <Heading fontSize="xl">{post.title}</Heading>
              <Text mt={2} fontSize="md" color="gray.600">
                Kategorija: {post.category}
              </Text>
              <Text mt={2} fontSize="sm" color="gray.500">
                Avtor: {post?.userId?.username || 'Neznan uporabnik'}
              </Text>
              <Link
                to={`/posts/${post._id}`}
                state={{ fromPage: currentPage }} // Passing the current page
              >
                <Button colorScheme="teal" mt={4}>
                  Preberi več
                </Button>
              </Link>
              {user && post.userId && post.userId._id === user._id && (
                <Box mt={4}>
                  <Button
                    colorScheme="green"
                    mr={3}
                    onClick={() => handleEditPost(post)}
                  >
                    Uredi
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    Izbriši
                  </Button>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
      <HStack justify="space-between" mt={6}>
        <IconButton
          icon={<ChevronLeftIcon />}
          onClick={handlePreviousPage}
          isDisabled={currentPage === 1}
          aria-label="Previous Page"
        />
        <Text>
          Page {currentPage} of {totalPages}
        </Text>
        <IconButton
          icon={<ChevronRightIcon />}
          onClick={handleNextPage}
          isDisabled={currentPage === totalPages}
          aria-label="Next Page"
        />
      </HStack>
      <AddPostModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setSelectedPost(null); // Reset selected post when modal closes
        }}
        onPostAdded={handlePostAdded}
        post={selectedPost} // Pass selected post to the modal
      />
    </Box>
  );
};

export default Posts;
