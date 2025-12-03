import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Button,
  Box,
  Icon,
  Flex,
  Badge,
  Progress,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Spinner,
  Select,
} from '@chakra-ui/react';
import { FiDownload, FiTrash2, FiSearch, FiPackage, FiFilter } from 'react-icons/fi';
import { fetchAllOllamaModels, pullModel, deleteModel, ModelInfo } from '../services/ollamaManager';

interface ModelLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  installedModels: string[];
  onModelsChange: () => void;
}

const ModelLibrary: React.FC<ModelLibraryProps> = ({
  isOpen,
  onClose,
  installedModels,
  onModelsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'popular'>('popular');
  const [downloadingModels, setDownloadingModels] = useState<Map<string, { progress: number; status: string }>>(new Map());
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAvailableModels();
    }
  }, [isOpen]);

  const loadAvailableModels = async () => {
    setIsLoadingModels(true);
    try {
      const models = await fetchAllOllamaModels();
      setAvailableModels(models);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: 'Error loading models',
        description: 'Using curated model list',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const filteredModels = availableModels
    .filter((model) => {
      // Search filter
      const matchesSearch =
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || model.tags.includes(selectedCategory);

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        const sizeA = parseFloat(a.size);
        const sizeB = parseFloat(b.size);
        return sizeA - sizeB;
      } else {
        // Popular: recommended first, then by name
        const aRecommended = a.tags.includes('recommended') ? 0 : 1;
        const bRecommended = b.tags.includes('recommended') ? 0 : 1;
        if (aRecommended !== bRecommended) {
          return aRecommended - bRecommended;
        }
        return a.name.localeCompare(b.name);
      }
    });

  const handleDownload = async (modelName: string) => {
    try {
      setDownloadingModels(new Map(downloadingModels.set(modelName, { progress: 0, status: 'starting' })));

      await pullModel(modelName, (progress, status) => {
        setDownloadingModels(new Map(downloadingModels.set(modelName, { progress, status })));
      });

      toast({
        title: 'Model downloaded',
        description: `${modelName} is ready to use`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      downloadingModels.delete(modelName);
      setDownloadingModels(new Map(downloadingModels));
      onModelsChange();
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Failed to download model',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      downloadingModels.delete(modelName);
      setDownloadingModels(new Map(downloadingModels));
    }
  };

  const handleDelete = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete ${modelName}?`)) return;

    try {
      await deleteModel(modelName);
      toast({
        title: 'Model deleted',
        description: `${modelName} has been removed`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onModelsChange();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete model',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
      <ModalContent bg="gray.800" borderColor="gray.700" borderWidth={1} maxH="90vh">
        <ModalHeader color="gray.100">
          <Flex align="center" gap={3}>
            <Icon as={FiPackage} color="green.400" boxSize={6} />
            <Text>Model Library</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Search and Filters */}
            <Flex gap={3} flexWrap="wrap">
              <InputGroup flex={1} minW="200px">
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="gray.900"
                  borderColor="gray.700"
                  _hover={{ borderColor: 'gray.600' }}
                  _focus={{ borderColor: 'green.400', boxShadow: '0 0 0 1px var(--chakra-colors-green-400)' }}
                  color="gray.100"
                />
              </InputGroup>

              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                bg="gray.900"
                borderColor="gray.700"
                color="gray.100"
                w="150px"
                icon={<FiFilter />}
              >
                <option value="all">All Models</option>
                <option value="recommended">Recommended</option>
                <option value="chat">Chat</option>
                <option value="code">Code</option>
                <option value="small">Small</option>
                <option value="large">Large</option>
              </Select>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                bg="gray.900"
                borderColor="gray.700"
                color="gray.100"
                w="130px"
              >
                <option value="popular">Popular</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </Select>
            </Flex>

            {/* Model Count */}
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color="gray.500">
                {filteredModels.length} models available
              </Text>
              {isLoadingModels && (
                <Flex align="center" gap={2}>
                  <Spinner size="xs" color="green.400" />
                  <Text fontSize="xs" color="gray.500">Loading models...</Text>
                </Flex>
              )}
            </Flex>

            {/* Models Grid */}
            {isLoadingModels ? (
              <Flex justify="center" align="center" py={12}>
                <VStack spacing={3}>
                  <Spinner size="xl" color="green.400" thickness="3px" />
                  <Text color="gray.500">Loading available models...</Text>
                </VStack>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {filteredModels.map((model) => {
                const isInstalled = installedModels.some((m) => m.startsWith(model.name));
                const downloadInfo = downloadingModels.get(model.name);
                const isDownloading = !!downloadInfo;

                return (
                  <Box
                    key={model.name}
                    bg="gray.900"
                    p={4}
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor={isInstalled ? 'green.700' : 'gray.700'}
                    _hover={{ borderColor: isInstalled ? 'green.600' : 'gray.600' }}
                    transition="all 0.2s"
                  >
                    <VStack align="stretch" spacing={3}>
                      <Flex justify="space-between" align="start">
                        <Box flex={1}>
                          <Text fontWeight="semibold" color="gray.100" fontSize="lg">
                            {model.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {model.parameters} • {model.size}
                          </Text>
                        </Box>
                        {isInstalled && (
                          <Badge colorScheme="green" fontSize="xs">
                            Installed
                          </Badge>
                        )}
                      </Flex>

                      <Text fontSize="sm" color="gray.400" noOfLines={2}>
                        {model.description}
                      </Text>

                      <Flex gap={2} flexWrap="wrap">
                        {model.tags.map((tag) => (
                          <Badge
                            key={tag}
                            size="sm"
                            colorScheme={tag === 'recommended' ? 'green' : 'gray'}
                            variant="subtle"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </Flex>

                      {isDownloading ? (
                        <Box>
                          <Flex justify="space-between" mb={2}>
                            <Text fontSize="xs" color="gray.400">
                              {downloadInfo.status}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {downloadInfo.progress.toFixed(0)}%
                            </Text>
                          </Flex>
                          <Progress
                            value={downloadInfo.progress}
                            size="sm"
                            colorScheme="green"
                            borderRadius="full"
                          />
                        </Box>
                      ) : (
                        <Flex gap={2}>
                          {isInstalled ? (
                            <Button
                              size="sm"
                              variant="outline"
                              colorScheme="red"
                              leftIcon={<FiTrash2 />}
                              onClick={() => handleDelete(model.name)}
                              flex={1}
                            >
                              Delete
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              colorScheme="green"
                              leftIcon={<FiDownload />}
                              onClick={() => handleDownload(model.name)}
                              flex={1}
                            >
                              Download
                            </Button>
                          )}
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                );
              })}

              {filteredModels.length === 0 && !isLoadingModels && (
                <Box textAlign="center" py={8} gridColumn="1 / -1">
                  <Icon as={FiPackage} boxSize={12} color="gray.600" mb={3} />
                  <Text color="gray.500">No models found</Text>
                  {searchQuery && (
                    <Text color="gray.600" fontSize="sm" mt={1}>
                      Try a different search term
                    </Text>
                  )}
                </Box>
              )}
            </SimpleGrid>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModelLibrary;
