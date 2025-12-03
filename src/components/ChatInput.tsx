import React, { useState, useRef, useEffect } from 'react';
import {
  Textarea,
  Box,
  IconButton,
  Flex,
  Tooltip,
  Text,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useToast,
  Progress,
} from '@chakra-ui/react';
import { FiSend, FiPaperclip, FiDatabase, FiChevronDown } from 'react-icons/fi';
import { uploadDocument, getAllDocuments, Document } from '../services/ragService';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
  ragEnabled: boolean;
  onToggleRAG: () => void;
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  onDocumentsChange?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSubmit,
  isDisabled = false,
  placeholder = 'Message LocalChat...',
  inputRef,
  ragEnabled,
  onToggleRAG,
  models,
  selectedModel,
  onModelChange,
  onDocumentsChange,
}) => {
  const [message, setMessage] = useState('');
  const [attachedDocs, setAttachedDocs] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef || localTextareaRef;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    loadDocuments();
    
    // Poll for document changes every 2 seconds
    const interval = setInterval(loadDocuments, 2000);
    
    // Also reload when window gains focus
    const handleFocus = () => loadDocuments();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadDocuments = async () => {
    const docs = await getAllDocuments();
    setAttachedDocs(docs);
  };

  const handleSubmit = () => {
    if (message.trim()) {
      onSubmit(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Max 10MB',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });

      toast({
        title: 'Document ready',
        description: `${file.name} - RAG enabled`,
        status: 'success',
        duration: 2000,
      });

      await loadDocuments();
      onDocumentsChange?.();

      if (!ragEnabled) {
        onToggleRAG();
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to attach file',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <Box>
      {/* RAG Active Indicator */}
      {attachedDocs.length > 0 && ragEnabled && (
        <Flex
          mb={2}
          px={3}
          py={2}
          bg="green.900"
          borderRadius="lg"
          borderWidth={1}
          borderColor="green.700"
          align="center"
          gap={2}
        >
          <Icon as={FiDatabase} color="green.400" boxSize={4} />
          <Text fontSize="xs" color="green.300" fontWeight="medium">
            RAG Active - Using {attachedDocs.length} document{attachedDocs.length > 1 ? 's' : ''} for context
          </Text>
          <Button
            size="xs"
            variant="ghost"
            onClick={onToggleRAG}
            color="green.400"
            _hover={{ bg: 'green.800' }}
            ml="auto"
          >
            Disable
          </Button>
        </Flex>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Box mb={2}>
          <Progress value={uploadProgress} size="xs" colorScheme="green" borderRadius="full" />
          <Text fontSize="xs" color="gray.500" mt={1}>
            Processing document... {uploadProgress.toFixed(0)}%
          </Text>
        </Box>
      )}

      {/* Main Input Area */}
      <Box
        bg="gray.800"
        borderRadius="xl"
        border="1px solid"
        borderColor="gray.700"
        _focusWithin={{
          borderColor: 'green.400',
          boxShadow: '0 0 0 1px var(--chakra-colors-green-400)',
        }}
        transition="all 0.2s"
      >
        {/* Text Input */}
        <Flex align="flex-end" p={3}>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              ragEnabled && attachedDocs.length > 0
                ? `Ask about your ${attachedDocs.length} document${attachedDocs.length > 1 ? 's' : ''}...`
                : placeholder
            }
            disabled={isDisabled}
            minH="44px"
            maxH="150px"
            resize="none"
            bg="transparent"
            border="none"
            _hover={{ border: 'none' }}
            _focus={{ border: 'none', boxShadow: 'none' }}
            color="gray.100"
            _placeholder={{ color: 'gray.500' }}
            fontSize="md"
            css={{
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': {
                background: 'var(--chakra-colors-gray-700)',
                borderRadius: '3px',
              },
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<FiSend />}
            onClick={handleSubmit}
            isDisabled={isDisabled || !message.trim()}
            colorScheme="green"
            size="sm"
            borderRadius="lg"
            ml={2}
          />
        </Flex>

        {/* Bottom Bar - Controls */}
        <Flex
          px={3}
          py={2}
          borderTop="1px solid"
          borderColor="gray.700"
          align="center"
          justify="space-between"
          gap={2}
        >
          {/* Left: Model + Attach */}
          <Flex align="center" gap={2}>
            <Menu>
              <MenuButton
                as={Button}
                size="xs"
                variant="ghost"
                rightIcon={<FiChevronDown />}
                color="gray.400"
                _hover={{ bg: 'gray.700', color: 'gray.200' }}
                fontWeight="normal"
                maxW="150px"
              >
                <Text isTruncated>{selectedModel || 'Select Model'}</Text>
              </MenuButton>
              <MenuList bg="gray.800" borderColor="gray.700" maxH="200px" overflowY="auto">
                {models.map((model) => (
                  <MenuItem
                    key={model}
                    onClick={() => onModelChange(model)}
                    bg={selectedModel === model ? 'gray.700' : 'transparent'}
                    _hover={{ bg: 'gray.700' }}
                    fontSize="sm"
                  >
                    {model}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.docx,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Tooltip label="Upload document" placement="top">
              <IconButton
                aria-label="Attach file"
                icon={<FiPaperclip />}
                size="xs"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                isDisabled={isUploading}
                color="gray.400"
                _hover={{ bg: 'gray.700', color: 'gray.200' }}
              />
            </Tooltip>
          </Flex>

          {/* Right: RAG Status */}
          {attachedDocs.length > 0 && (
            <Button
              size="xs"
              variant={ragEnabled ? 'solid' : 'ghost'}
              onClick={onToggleRAG}
              colorScheme={ragEnabled ? 'green' : 'gray'}
              color={ragEnabled ? 'white' : 'gray.400'}
              _hover={{ bg: ragEnabled ? 'green.600' : 'gray.700' }}
              leftIcon={<Icon as={FiDatabase} />}
            >
              {ragEnabled ? `${attachedDocs.length} doc` : 'RAG off'}
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default ChatInput;
