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
  Flex
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link, useNavigate, useLocation } from 'react-router-dom';  // Add useNavigate
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import VoteWidget from "../components/VoteWidget";

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
    <Box p={8} maxW="container.xl" mx="auto" bg="gray.50" borderRadius="lg" shadow="lg">
      <Heading as="h2" size="2xl" mb={8} textAlign="center" color="teal.600">
        Forum - Objave
      </Heading>
  
      {user && (
        <Button onClick={onOpen} colorScheme="teal" size="lg" mb={8} w="full">
          + Dodaj novo objavo
        </Button>
      )}
  
      {/* Filters Section */}
      <Box mb={8} p={6} bg="white" borderRadius="lg" shadow="md">
        <Heading fontSize="lg" mb={4} color="gray.700">
          Filtri
        </Heading>
        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          <Input
            placeholder="Kategorija"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            focusBorderColor="teal.500"
          />
          <Input
            placeholder="Avtor"
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            focusBorderColor="teal.500"
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            focusBorderColor="teal.500"
          />
        </Stack>
      </Box>
  
      {/* Posts Section */}
      {loading ? (
        <Flex justify="center" align="center" mt={12}>
          <Spinner size="xl" thickness="4px" color="teal.500" />
        </Flex>
      ) : filteredPosts.length === 0 ? (
        <Text fontSize="lg" color="gray.500" textAlign="center" mt={12}>
          Trenutno ni nobenih objav.
        </Text>
      ) : (
        <Stack spacing={8}>
          {filteredPosts.map((post) => (
            <Box
              key={post._id}
              p={6}
              bg="white"
              shadow="md"
              borderRadius="lg"
              transition="all 0.3s"
              _hover={{ transform: "scale(1.02)", shadow: "lg" }}
            >
              <Heading fontSize="2xl" color="teal.600">
                {post.title}
              </Heading>
              <Text mt={2} fontSize="sm" color="gray.500">
                Kategorija: {post.category}
              </Text>
              {post.images?.[0] && (
                <Flex justify="center" mt={6}>
                  <img
                    src={`http://localhost:3000${post.images[0].imageUrl}`}
                    alt={post.images[0].imageName || "Post image"}
                    style={{
                      width: "60%",
                      height: "auto",
                      borderRadius: "12px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </Flex>
              )}
              <Text mt={4} fontSize="sm" color="gray.600">
                Avtor: {post?.userId?.username || "Neznan uporabnik"}
              </Text>
              <Flex justify="center" mt={6}>
                <Link to={`/posts/${post._id}`} state={{ fromPage: currentPage }}>
                  <Button colorScheme="teal" size="md" px={8}>
                    Preberi več
                  </Button>
                </Link>
              </Flex>
              <Box mt={6}>
                <VoteWidget postId={post._id}/>
              </Box>
              {user && (
                <Flex justify="flex-end" mt={6}>
                  {(user.role === "admin" || (post.userId && post.userId._id === user._id)) && (
                    <>
                      <Button
                        colorScheme="green"
                        mr={3}
                        size="sm"
                        onClick={() => handleEditPost(post)}
                      >
                        Uredi
                      </Button>
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        Izbriši
                      </Button>
                    </>
                  )}
                </Flex>
              )}
            </Box>
          ))}
        </Stack>
      )}
  
      {/* Pagination */}
      <Flex justify="space-between" align="center" mt={12}>
        <IconButton
          icon={<ChevronLeftIcon />}
          onClick={handlePreviousPage}
          isDisabled={currentPage === 1}
          aria-label="Previous Page"
          colorScheme="teal"
        />
        <Text fontSize="lg" color="gray.600">
          Page {currentPage} of {totalPages}
        </Text>
        <IconButton
          icon={<ChevronRightIcon />}
          onClick={handleNextPage}
          isDisabled={currentPage === totalPages}
          aria-label="Next Page"
          colorScheme="teal"
        />
      </Flex>
  
      {/* Add Post Modal */}
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
