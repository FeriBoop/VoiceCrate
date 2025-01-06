import React, { useState } from "react";
import {
    Box,
    Button,
    VStack,
    Text,
    Image,
    HStack,
    CloseButton,
    Input,
    useToast,
} from "@chakra-ui/react";
import { HiUpload } from "react-icons/hi";

const FileUpload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const toast = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (selectedFiles.length + files.length > 10) {
            toast({
                title: "Upload limit exceeded",
                description: "You can upload a maximum of 10 images.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    const removeFile = (index: number) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    return (
        <VStack spacing={4} align="stretch" maxWidth="400px" mx="auto">
    <Button
        as="label"
    htmlFor="file-upload"
    leftIcon={<HiUpload />}
    variant="outline"
    size="md"
        >
        Upload Images
    </Button>
    <Input
    id="file-upload"
    type="file"
    multiple
    accept="image/*"
    display="none"
    onChange={handleFileChange}
    />
    {files.length > 0 && (
        <Box>
            <Text fontWeight="bold" mb={2}>
        Uploaded Files ({files.length}/10):
    </Text>
    <VStack spacing={3} align="stretch">
        {files.map((file, index) => (
                <HStack
                    key={index}
            p={2}
            borderWidth="1px"
            borderRadius="md"
            overflow="hidden"
            spacing={3}
            align="center"
            >
            <Image
                src={URL.createObjectURL(file)}
            alt={file.name}
            boxSize="50px"
            objectFit="cover"
            borderRadius="md"
            />
            <Box flex="1">
            <Text fontSize="sm" fontWeight="medium">
            {file.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
            {(file.size / 1024).toFixed(2)} KB
    </Text>
    </Box>
    <CloseButton size="sm" onClick={() => removeFile(index)} />
    </HStack>
    ))}
        </VStack>
        </Box>
    )}
    </VStack>
);
};

export default FileUpload;
