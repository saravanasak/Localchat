import React, { useState, useEffect, useRef } from 'react';
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
  Progress,
  useToast,
  IconButton,
  Divider,
  Input,
  Collapse,
  Textarea,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiTrash2, FiFileText, FiDatabase, FiEye, FiEyeOff } from 'react-icons/fi';
import {
  uploadDocument,
  getAllDocuments,
  deleteDocument,
  getStorageStats,
  Document,
} from '../services/ragService';

interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ isOpen, onClose }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [previewDocId, setPreviewDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      loadStats();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    try {
      const docs = await getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadStats = async () => {
    try {
      const storageStats = await getStorageStats();
      setStats(storageStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload files smaller than 10MB',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate file type
    const validExtensions = ['.txt', '.md', '.pdf', '.docx', '.xlsx', '.xls'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExtension) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload PDF, DOCX, XLSX, TXT, or MD files',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Starting...');

    try {
      await uploadDocument(file, (progress, status) => {
        setUploadProgress(progress);
        setUploadStatus(status);
      });

      toast({
        title: 'Document uploaded',
        description: `${file.name} has been processed and is ready to use`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await loadDocuments();
      await loadStats();
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document';
      
      toast({
        title: 'Upload failed',
        description: errorMessage,
        status: 'error',
        duration: 8000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadStatus('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;

    try {
      await deleteDocument(doc.id);
      toast({
        title: 'Document deleted',
        description: `${doc.name} has been removed`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      await loadDocuments();
      await loadStats();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete document',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
      <ModalContent bg="gray.800" borderColor="gray.700" borderWidth={1} maxH="90vh">
        <ModalHeader color="gray.100">
          <Flex align="center" gap={3}>
            <Icon as={FiDatabase} color="green.400" boxSize={6} />
            <Box>
              <Text>Document Library</Text>
              <Text fontSize="xs" color="gray.500" fontWeight="normal">
                Upload documents to chat with them using RAG
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {/* Stats */}
            {stats && (
              <Box
                bg="gray.900"
                p={4}
                borderRadius="lg"
                borderWidth={1}
                borderColor="gray.700"
              >
                <Flex justify="space-between" align="center">
                  <Flex gap={6}>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Documents</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="green.400">
                        {stats.documentCount}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Total Size</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="blue.400">
                        {stats.formattedSize}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500">Chunks</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="purple.400">
                        {stats.totalChunks}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </Box>
            )}

            {/* Upload Section */}
            <Box>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.pdf,.docx,.xlsx,.xls"
                onChange={handleFileSelect}
                display="none"
              />
              <Button
                w="full"
                size="lg"
                colorScheme="green"
                leftIcon={<FiUpload />}
                onClick={() => fileInputRef.current?.click()}
                isDisabled={isUploading}
              >
                Upload Document
              </Button>
              <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">
                Supported: PDF, DOCX, XLSX, TXT, MD (max 10MB)
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                PDFs must contain selectable text (not scanned images)
              </Text>
            </Box>

            {/* Upload Progress */}
            {isUploading && (
              <Box
                bg="gray.900"
                p={4}
                borderRadius="lg"
                borderWidth={1}
                borderColor="green.700"
              >
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.300">{uploadStatus}</Text>
                  <Text fontSize="sm" color="gray.400">{uploadProgress.toFixed(0)}%</Text>
                </Flex>
                <Progress
                  value={uploadProgress}
                  size="sm"
                  colorScheme="green"
                  borderRadius="full"
                />
              </Box>
            )}

            <Divider borderColor="gray.700" />

            {/* Documents List */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.400" mb={3}>
                Your Documents ({documents.length})
              </Text>

              {documents.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Icon as={FiFileText} boxSize={12} color="gray.600" mb={3} />
                  <Text color="gray.500" fontSize="sm">
                    No documents uploaded yet
                  </Text>
                  <Text color="gray.600" fontSize="xs" mt={1}>
                    Upload documents to enable RAG-powered chat
                  </Text>
                </Box>
              ) : (
                <VStack spacing={2} align="stretch">
                  {documents.map((doc) => (
                    <Box
                      key={doc.id}
                      bg="gray.900"
                      p={4}
                      borderRadius="lg"
                      borderWidth={1}
                      borderColor={previewDocId === doc.id ? 'green.600' : 'gray.700'}
                      _hover={{ borderColor: previewDocId === doc.id ? 'green.500' : 'gray.600' }}
                      transition="all 0.2s"
                    >
                      <Flex justify="space-between" align="start">
                        <Flex gap={3} flex={1}>
                          <Icon as={FiFile} color="green.400" boxSize={5} mt={1} />
                          <Box flex={1}>
                            <Text fontWeight="medium" color="gray.100" fontSize="sm">
                              {doc.name}
                            </Text>
                            <Flex gap={3} mt={1} flexWrap="wrap">
                              <Text fontSize="xs" color="gray.500">
                                {formatSize(doc.size)}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {doc.chunks.length} chunks
                              </Text>
                              <Text fontSize="xs" color="green.400" fontWeight="medium">
                                {doc.content.length.toLocaleString()} chars extracted
                              </Text>
                            </Flex>
                          </Box>
                        </Flex>
                        <Flex gap={1}>
                          <IconButton
                            aria-label="Preview extracted text"
                            icon={previewDocId === doc.id ? <FiEyeOff /> : <FiEye />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => setPreviewDocId(previewDocId === doc.id ? null : doc.id)}
                          />
                          <IconButton
                            aria-label="Delete document"
                            icon={<FiTrash2 />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(doc)}
                          />
                        </Flex>
                      </Flex>
                      
                      {/* Preview Panel */}
                      <Collapse in={previewDocId === doc.id} animateOpacity>
                        <Box mt={3} pt={3} borderTop="1px" borderColor="gray.700">
                          <Text fontSize="xs" color="gray.400" mb={2}>
                            Extracted Text Preview (first 5000 chars):
                          </Text>
                          <Textarea
                            value={doc.content.substring(0, 5000) + (doc.content.length > 5000 ? '\n\n... [truncated for preview]' : '')}
                            readOnly
                            bg="gray.800"
                            border="1px solid"
                            borderColor="gray.600"
                            color="gray.300"
                            fontSize="xs"
                            fontFamily="mono"
                            rows={10}
                            resize="vertical"
                          />
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            Total: {doc.content.length.toLocaleString()} characters | {doc.chunks.length} chunks
                          </Text>
                        </Box>
                      </Collapse>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DocumentManager;
