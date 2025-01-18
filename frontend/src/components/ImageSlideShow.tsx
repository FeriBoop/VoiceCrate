import { Box, Flex, IconButton, Text, useBreakpointValue } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useState } from 'react';

// Define the image type
interface Image {
  imageName: string;
  imageUrl: string;
}

interface ImageSlideshowProps {
  images: Image[];
}

const ImageSlideshow: React.FC<ImageSlideshowProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const arrowSize = useBreakpointValue({ base: '4', md: '6' });

  return (
    <Box
      position="relative"
      maxW="600px"
      mx="auto"
      p={4}
      borderWidth="1px"
      borderRadius="lg"
      shadow="lg"
      bg="white"
      _dark={{ bg: 'gray.800' }}
    >
      {/* Display current image */}
      {images?.[currentIndex] ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          w="full"
          h="300px"
          borderRadius="md"
          overflow="hidden"
          bg="gray.50"
          mx="auto"
        >
          <img
            src={`http://localhost:3000${images[currentIndex].imageUrl}`}
            alt={images[currentIndex].imageName || 'Slideshow image'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </Box>
      ) : (
        <Box
          w="full"
          h="300px"
          bg="gray.100"
          borderRadius="md"
          display="flex"
          justifyContent="center"
          alignItems="center"
          mx="auto"
        >
          <Text color="gray.500">No image available</Text>
        </Box>
      )}

      {/* Navigation Controls */}
      <Flex justify="space-between" align="center" mt={4}>
        <IconButton
          onClick={handlePrev}
          aria-label="Previous image"
          isDisabled={images.length <= 1}
          icon={<ChevronLeftIcon w={arrowSize} h={arrowSize} />}
          variant="ghost"
          colorScheme="teal"
          size="lg"
        />
        <IconButton
          onClick={handleNext}
          aria-label="Next image"
          isDisabled={images.length <= 1}
          icon={<ChevronRightIcon w={arrowSize} h={arrowSize} />}
          variant="ghost"
          colorScheme="teal"
          size="lg"
        />
      </Flex>
    </Box>
  );
};

export default ImageSlideshow;
