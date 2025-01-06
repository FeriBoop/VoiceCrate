import { Box, Flex, IconButton } from '@chakra-ui/react';
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

    return (
        <Box position="relative" maxWidth="600px" mx="auto">
            {/* Display current image */}
            {images?.[currentIndex] && (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    width="300px" // Set fixed width
                    height="300px" // Set fixed height
                    borderRadius="8px"
                    overflow="hidden"
                    bg="gray.100" // Background color for empty space
                    mx="auto" // Center the container
                >
                    <img
                        src={`http://localhost:3000${images[currentIndex].imageUrl}`}
                        alt={images[currentIndex].imageName || 'Slideshow image'}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain', // Ensures the image fits while maintaining aspect ratio
                        }}
                    />
                </Box>
            )}

            {/* Navigation Controls */}
            <Flex justifyContent="space-between" mt={2}>
                <IconButton
                    onClick={handlePrev}
                    aria-label="Previous image"
                    isDisabled={images.length <= 1} // Disable if only one image
                    icon={
                        <img
                            src="/images/left_arrow.svg" // Replace with the path to your icon
                            alt="Next"
                            style={{ width: '20px', height: '20px' }} // Adjust size as needed
                        />
                    }
                >
                </IconButton>
                <IconButton
                    onClick={handleNext}
                    aria-label="Next image"
                    isDisabled={images.length <= 1} // Disable if only one image
                    icon={
                        <img
                            src="/images/right_arrow.svg" // Replace with the path to your icon
                            alt="Next"
                            style={{ width: '20px', height: '20px' }} // Adjust size as needed
                        />
                    }
                />
            </Flex>
        </Box>
    );
};

export default ImageSlideshow;
