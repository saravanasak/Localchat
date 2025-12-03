import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Input,
  Box,
  Flex,
  Progress,
  useToast,
  Icon,
  InputGroup,
  InputLeftElement,
  Tooltip,
} from '@chakra-ui/react';
import { FiDownload, FiSearch, FiInfo } from 'react-icons/fi';
import { pullModel, CURATED_MODELS } from '../services/ollamaManager';

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModelAdded: () => void;
}

interface DownloadState {
  [key: string]: {
    progress: number;
    isDownloading: boolean;
  };
}

const AddModelModal: React.FC<AddModelModalProps> = ({
  isOpen,
  onClose,
  onModelAdded,
}) => {
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadStates, setDownloadStates] = useState<DownloadState>({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      setAvailableModels(CURATED_MODELS);
    } catch (error) {
      toast({
        title: 'Error fetching models',
        description: 'Failed to fetch available models. Please make sure Ollama is running.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setAvailableModels([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (modelName: string) => {
    setDownloadStates(prev => ({
      ...prev,
      [modelName]: { progress: 0, isDownloading: true },
    }));

    try {
      await pullModel(modelName, (progress: number) => {
        setDownloadStates(prev => ({
          ...prev,
          [modelName]: { ...prev[modelName], progress },
        }));
      });

      toast({
        title: 'Model downloaded',
        description: `Successfully downloaded ${modelName}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setAvailableModels(prev => prev.filter(m => m.name !== modelName));
      onModelAdded();
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to download model. Please make sure Ollama is running and try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDownloadStates(prev => ({
        ...prev,
        [modelName]: { progress: 0, isDownloading: false },
      }));
    }
  };

  const filteredModels = availableModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.900" color="white">
        <ModalHeader>Add Model</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <InputGroup mb={4}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              borderColor="gray.700"
              _hover={{ borderColor: 'gray.600' }}
              _focus={{ borderColor: 'green.400', boxShadow: 'none' }}
            />
          </InputGroup>

          <VStack spacing={4} align="stretch" maxH="400px" overflowY="auto">
            {isLoading ? (
              <Text color="gray.500">Loading available models...</Text>
            ) : filteredModels.length === 0 ? (
              <Text color="gray.500">No models found</Text>
            ) : (
              filteredModels.map((model) => (
                <Box
                  key={model.name}
                  p={4}
                  borderRadius="md"
                  bg="gray.800"
                  borderColor="gray.700"
                  borderWidth={1}
                >
                  <Flex justify="space-between" align="start" mb={2}>
                    <Box>
                      <Flex align="center" gap={2}>
                        <Text fontWeight="medium">{model.name}</Text>
                        <Tooltip label={`Size: ${model.size}`}>
                          <Icon as={FiInfo} color="gray.500" />
                        </Tooltip>
                      </Flex>
                      <Text color="gray.400" fontSize="sm" mt={1}>
                        {model.description}
                      </Text>
                    </Box>
                    <Button
                      size="sm"
                      colorScheme="green"
                      leftIcon={<FiDownload />}
                      onClick={() => handleDownload(model.name)}
                      isLoading={downloadStates[model.name]?.isDownloading}
                      loadingText="Downloading"
                    >
                      Download
                    </Button>
                  </Flex>
                  {downloadStates[model.name]?.isDownloading && (
                    <Progress
                      value={downloadStates[model.name]?.progress}
                      size="sm"
                      colorScheme="green"
                      borderRadius="full"
                    />
                  )}
                </Box>
              ))
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AddModelModal;
