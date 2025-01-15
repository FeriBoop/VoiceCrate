import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Heading,
  Button,
  Stack,
  Text,
  Spinner,
  useDisclosure,
  Input,
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
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0); // To store total number of posts

  const postsPerPage = 10;
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation();

  // Filter states with initial values from localStorage
  const [categoryFilter, setCategoryFilter] = useState(
    localStorage.getItem('categoryFilter') || ''
  );
  const [authorFilter, setAuthorFilter] = useState(
    localStorage.getItem('authorFilter') || ''
  );
  const [dateFilter, setDateFilter] = useState(
    localStorage.getItem('dateFilter') || ''
  );

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
        console.log("Fetched data:", data);
        const reversedPosts = data.posts.reverse();
        setPosts(reversedPosts);
        setTotalPosts(data.totalPosts);
        setFilteredPosts(reversedPosts); // Set the initial filtered posts
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

  useEffect(() => {
    // Apply filters when posts are loaded
    if (posts.length > 0) {
      handleFilterChange();
    }
  }, [posts]);

  const handlePostAdded = () => {
    loadPosts(currentPage);
    setSelectedPost(null);
  };

  const handleEditPost = (post: Post) => {
    setSelectedPost(post);
    onOpen();
  };

  const handleDeletePost = (id: string) => {
    fetch(`http://localhost:3000/post/${id}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          loadPosts(currentPage);
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

  const handleFilterChange = () => {
    const filtered = posts.filter((post) => {
      const matchesCategory =
        !categoryFilter || post.category.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchesAuthor =
        !authorFilter || post.userId?.username?.toLowerCase().includes(authorFilter.toLowerCase());
      const matchesDate =
        !dateFilter || new Date(post.createdAt).toISOString().slice(0, 10) === dateFilter;
      return matchesCategory && matchesAuthor && matchesDate;
    });
    setFilteredPosts(filtered);
  };

  // Save filters to localStorage when they change
  useEffect(() => {
    localStorage.setItem('categoryFilter', categoryFilter);
    localStorage.setItem('authorFilter', authorFilter);
    localStorage.setItem('dateFilter', dateFilter);
    handleFilterChange();
  }, [categoryFilter, authorFilter, dateFilter]);

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

      {/* Filters */}
      <Box mb={6}>
        <Heading fontSize="xl">Filtri:</Heading>
        <Stack direction="row" spacing={4}>
          <Input
            placeholder="Kategorija"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
          <Input
            placeholder="Avtor"
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </Stack>
      </Box>

      {loading ? (
        <Spinner size="xl" />
      ) : filteredPosts.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={8}>
          Trenutno ni nobenih objav.
        </Text>
      ) : (
        <Stack spacing={6}>
          {filteredPosts.map((post) => (
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
              <Link to={`/posts/${post._id}`} state={{ fromPage: currentPage }}>
                <Button colorScheme="teal" mt={4}>
                  Preberi več
                </Button>
              </Link>
              {user && (
                <Box mt={4}>
                  {(user.role === 'admin' || (post.userId && post.userId._id === user._id)) && (
                    <>
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
                    </>
                  )}
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
          setSelectedPost(null);
        }}
        onPostAdded={handlePostAdded}
        post={selectedPost}
      />
    </Box>
  );
};

export default Posts;
