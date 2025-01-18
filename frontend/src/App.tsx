import React, { Dispatch, SetStateAction, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { publicRoutes, protectedRoutes } from './routes';
import { User } from './interfaces/User';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { UserContext } from './userContext';
import Home from './pages/Home'; // Ensure correct path
import Posts from './pages/Posts'; // Direct import for Posts
import PostDetail from './components/PostDetail';
import { Box, Container } from '@chakra-ui/react';

function App() {
  const [user, setUser] = useState<User | null>(
    localStorage.user ? JSON.parse(localStorage.user) : null
  );

  const updateUserData: Dispatch<SetStateAction<User | null>> = (userInfo) => {
    if (typeof userInfo === 'function') {
      const updatedUser = userInfo(user);
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        localStorage.removeItem('user');
      }
      setUser(updatedUser);
    } else {
      if (userInfo) {
        localStorage.setItem('user', JSON.stringify(userInfo));
      } else {
        localStorage.removeItem('user');
      }
      setUser(userInfo);
    }
  };

  return (
    <BrowserRouter>
      <UserContext.Provider value={{ user, setUserContext: updateUserData }}>
        <Box display="flex" flexDirection="column" minHeight="100vh" bg="gray.50">
          {/* Header */}
          <Header />

          {/* Main Content */}
          <Container as="main" maxW="container.xl" flex="1" py={6}>
            <Routes>
              {/* Home Page (Always Accessible) */}
              <Route path="/" element={<Home />} />

              {/* Public Routes */}
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              {publicRoutes
                .filter((route) => route.to !== '/' && route.to !== '/posts') // Exclude Home and Posts
                .map((route) => (
                  <Route
                    key={route.to}
                    path={route.to}
                    element={user ? <Navigate to="/" replace /> : route.element}
                  />
                ))}

              {/* Protected Routes (Only for Logged-in Users) */}
              {protectedRoutes.map((route) => (
                <Route
                  key={route.to}
                  path={route.to}
                  element={<ProtectedRoute user={user} element={route.element} />}
                />
              ))}
            </Routes>
          </Container>

          {/* Footer */}
          <Footer />
        </Box>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
