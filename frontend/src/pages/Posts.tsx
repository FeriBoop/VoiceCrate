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
} from '@chakra-ui/react';
import { UserContext } from '../userContext';
import AddPostModal from '../components/AddPostModal';
import { Post } from '../interfaces/Post';
import { Link } from 'react-router-dom';

const Posts: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useContext(UserContext);

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

  const loadPosts = () => {
    setLoading(true);
    fetch('http://localhost:3000/post')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        const reversedPosts = data.reverse();
        setPosts(reversedPosts);
        setFilteredPosts(reversedPosts); // Set the initial filtered posts
        setLoading(false);
      })
      .catch((error) => {
        console.error('Napaka pri pridobivanju objav:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    // Apply filters when posts are loaded
    if (posts.length > 0) {
      handleFilterChange();
    }
  }, [posts]);

  const handlePostAdded = () => {
    loadPosts();
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
          loadPosts();
        } else {
          console.error('Napaka pri brisanju objave');
        }
      })
      .catch((error) => {
        console.error('Napaka pri brisanju objave:', error);
      });
  };

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
              <Link to={`/posts/${post._id}`}>
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
