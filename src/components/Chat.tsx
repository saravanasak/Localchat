import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  Icon,
  Flex,
  useToast,
  Button,
  Textarea,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { Message as MessageType, generateChatResponse, listModels } from '../services/ollama';
import { ChatSession, createNewSession, getChatHistory, saveChatSession, deleteChatSession } from '../services/chatHistory';
import { checkOllamaStatus } from '../services/ollamaManager';
import { buildRAGContext, getAllDocuments } from '../services/ragService';
import Header from './Header';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import SetupWizard from './SetupWizard';
import ModelLibrary from './ModelLibrary';
import DocumentManager from './DocumentManager';
import { FiUser, FiEdit2, FiPackage, FiMessageSquare } from 'react-icons/fi';

const pulseAnimation = keyframes`
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
`;

const quickPrompts = [
  'Explain like I\'m 5',
  'Write code example',
  'Summarize this',
  'Analyze pros and cons'
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(getChatHistory());
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [ragEnabled, setRagEnabled] = useState(false);
  const [hasDocuments, setHasDocuments] = useState(false);
  // Sidebar is always open in the new design
  const { isOpen: isModelLibraryOpen, onOpen: openModelLibrary, onClose: closeModelLibrary } = useDisclosure();
  const { isOpen: isDocManagerOpen, onOpen: openDocManager, onClose: closeDocManager } = useDisclosure();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  useEffect(() => {
    checkOllamaAndFetchModels();
    checkDocuments();
    if (sessions.length > 0 && !currentSession) {
      loadSession(sessions[0].id);
    }
  }, []);

  const checkDocuments = async () => {
    const docs = await getAllDocuments();
    setHasDocuments(docs.length > 0);
  };

  const checkOllamaAndFetchModels = async () => {
    const status = await checkOllamaStatus();
    
    if (!status.isRunning) {
      setShowSetupWizard(true);
      setIsLoadingModels(false);
      return;
    }

    fetchModels();
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    if (currentSession) {
      saveChatSession({
        ...currentSession,
        messages,
        updatedAt: new Date().toISOString()
      });
      setSessions(getChatHistory());
    }
  }, [messages]);

  const fetchModels = async () => {
    try {
      const availableModels = await listModels();
      setModels(availableModels);
      if (availableModels.length > 0) {
        setSelectedModel(availableModels[0]);
      } else {
        // No models installed, show model library
        toast({
          title: 'No models installed',
          description: 'Download a model from the Model Library to get started',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
        openModelLibrary();
      }
    } catch (error) {
      console.error('Error fetching models:', error);
      toast({
        title: 'Error fetching models',
        description: error instanceof Error ? error.message : 'Please make sure Ollama is running locally',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleNewChat = () => {
    if (selectedModel) {
      const newSession = createNewSession(selectedModel);
      setCurrentSession(newSession);
      setMessages([]);
      setSessions([...sessions, newSession]);
      // Close sidebar and focus input
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 100);
    }
  };

  const loadSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setMessages(session.messages);
      setSelectedModel(session.model);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteChatSession(sessionId);
    setSessions(getChatHistory());
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  };

  const handleSubmit = async (input: string) => {
    if (!input.trim() || !selectedModel) return;

    let finalInput = input;

    // If RAG is enabled, build context from documents
    if (ragEnabled && hasDocuments) {
      try {
        const ragContext = await buildRAGContext(input, 3);
        if (ragContext) {
          finalInput = ragContext;
        }
      } catch (error) {
        console.error('Error building RAG context:', error);
        toast({
          title: 'RAG Error',
          description: 'Failed to retrieve document context, proceeding without it',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    }

    const userMessage: MessageType = {
      role: 'user',
      content: input, // Store original user input
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      let currentResponse = '';
      await generateChatResponse(
        selectedModel,
        [...messages, { role: 'user', content: finalInput }], // Use RAG-enhanced input for API
        (content) => {
          currentResponse += content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...newMessages.slice(0, -1),
                { ...lastMessage, content: currentResponse }
              ];
            } else {
              return [...newMessages, { role: 'assistant', content: currentResponse }];
            }
          });
        }
      );

      if (!currentSession) {
        const newSession = createNewSession(selectedModel);
        newSession.title = userMessage.content.slice(0, 30); // Use first message as title
        newSession.messages = [...messages, userMessage, { role: 'assistant', content: currentResponse }];
        setCurrentSession(newSession);
        setSessions([...sessions, newSession]);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditMessage = async (index: number, newContent: string) => {
    if (index < 0 || !currentSession) return;

    // Update the edited message
    const updatedMessages = [...messages];
    updatedMessages[index] = {
      ...updatedMessages[index],
      content: newContent
    };

    // Remove all messages after the edited message
    const messagesUntilEdit = updatedMessages.slice(0, index + 1);
    setMessages(messagesUntilEdit);
    setEditingMessageIndex(null);

    // Update session
    const updatedSession = {
      ...currentSession,
      messages: messagesUntilEdit,
      updatedAt: new Date().toISOString()
    };
    setCurrentSession(updatedSession);
    saveChatSession(updatedSession);
    setSessions(getChatHistory());

    // Generate new response
    setIsGenerating(true);
    try {
      let currentResponse = '';
      await generateChatResponse(
        selectedModel,
        messagesUntilEdit,
        (content) => {
          currentResponse += content;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
              return [
                ...newMessages.slice(0, -1),
                { ...lastMessage, content: currentResponse }
              ];
            } else {
              return [...newMessages, { role: 'assistant', content: currentResponse }];
            }
          });
        }
      );
    } catch (error) {
      console.error('Error regenerating response:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate response',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Flex h="100dvh" bg="gray.900" color="gray.100">
      <SetupWizard isOpen={showSetupWizard} onClose={() => setShowSetupWizard(false)} />
      <ModelLibrary
        isOpen={isModelLibraryOpen}
        onClose={closeModelLibrary}
        installedModels={models}
        onModelsChange={fetchModels}
      />
      <DocumentManager
        isOpen={isDocManagerOpen}
        onClose={() => {
          closeDocManager();
          checkDocuments();
        }}
      />

      {/* Left Sidebar - Always Visible */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSessionSelect={loadSession}
        onSessionDelete={handleDeleteSession}
        onNewChat={handleNewChat}
      />

      {/* Main Content Area */}
      <Flex
        direction="column"
        flex={1}
        position="relative"
      >
        {/* Header */}
        <Box 
          position="sticky" 
          top={0} 
          zIndex={30}
          bg="gray.900"
          borderBottom="1px"
          borderColor="gray.800"
        >
          <Header
            onStatusChange={setIsServerOnline}
            onOpenModelLibrary={openModelLibrary}
            onOpenDocManager={openDocManager}
            hasDocuments={hasDocuments}
          />
        </Box>

        {/* Chat Content */}
        <Flex direction="column" flex={1} position="relative" overflow="hidden">
          <Box 
            maxW="900px" 
            w="100%"
            mx="auto"
            h="full" 
            display="flex" 
            flexDirection="column"
            position="relative"
            px={6}
          >
            <Flex
              direction="column"
              flex={1}
              overflowY="auto"
              py={6}
              gap={6}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--chakra-colors-gray-700)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'var(--chakra-colors-gray-600)',
                },
              }}
            >
              {messages.length === 0 && (
                <VStack spacing={10} justify="center" flex={1} py={12}>
                  <Icon as={FiMessageSquare} boxSize={20} color="green.400" opacity={0.9} />
                  <VStack spacing={4}>
                    <Text fontSize="4xl" fontWeight="bold" color="gray.100" textAlign="center">
                      Welcome to LocalChat
                    </Text>
                    <Text fontSize="lg" color="gray.400" textAlign="center" maxW="lg" lineHeight="tall">
                      Your private AI assistant running locally on your machine. 
                      Complete privacy, no data sent to external servers.
                    </Text>
                  </VStack>
                  {models.length === 0 ? (
                    <VStack spacing={5} pt={4}>
                      <Text fontSize="md" color="gray.500" textAlign="center">
                        Get started by downloading a model
                      </Text>
                      <Button
                        colorScheme="green"
                        size="lg"
                        onClick={openModelLibrary}
                        leftIcon={<Icon as={FiPackage} />}
                        px={8}
                        py={6}
                        fontSize="md"
                      >
                        Browse Model Library
                      </Button>
                    </VStack>
                  ) : (
                    <VStack spacing={4} pt={4}>
                      <Text fontSize="sm" color="gray.500" textAlign="center">
                        Try a quick prompt to get started
                      </Text>
                      <Flex gap={3} wrap="wrap" justify="center" maxW="2xl">
                        {quickPrompts.map((prompt) => (
                          <Button
                            key={prompt}
                            onClick={() => handleSubmit(prompt)}
                            size="md"
                            variant="outline"
                            borderColor="gray.700"
                            color="gray.300"
                            _hover={{
                              bg: 'gray.800',
                              borderColor: 'green.400',
                              color: 'green.400',
                            }}
                            transition="all 0.2s"
                          >
                            {prompt}
                          </Button>
                        ))}
                      </Flex>
                    </VStack>
                  )}
                </VStack>
              )}

              {messages.length > 0 && (
                <Box mb={6} pb={4} borderBottom="1px" borderColor="gray.800">
                  <Flex align="center" gap={3}>
                    <Text fontSize="xl" fontWeight="semibold" color="gray.100">
                      {currentSession?.title || 'New Chat'}
                    </Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      color="gray.500"
                      _hover={{ color: 'gray.300', bg: 'gray.800' }}
                      onClick={() => {
                        const newTitle = prompt('Enter new chat title', currentSession?.title || '');
                        if (newTitle && currentSession) {
                          const updatedSession = {...currentSession, title: newTitle};
                          setCurrentSession(updatedSession);
                          saveChatSession(updatedSession);
                          setSessions(getChatHistory());
                        }
                      }}
                    >
                      Rename
                    </Button>
                  </Flex>
                </Box>
              )}

              {messages.map((message, index) => (
                <Flex
                  key={index}
                  gap={4}
                  alignItems="start"
                  bg={message.role === 'assistant' ? 'gray.850' : 'transparent'}
                  p={5}
                  borderRadius="xl"
                  borderWidth={message.role === 'user' ? 1 : 0}
                  borderColor="gray.700"
                  _hover={{
                    borderColor: message.role === 'user' ? 'gray.600' : 'transparent',
                    bg: message.role === 'assistant' ? 'gray.800' : 'gray.850',
                  }}
                  transition="all 0.2s"
                  position="relative"
                  role="group"
                >
                  <Box
                    bg={message.role === 'assistant' ? 'green.900' : 'blue.900'}
                    p={2}
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon
                      as={message.role === 'assistant' ? FiMessageSquare : FiUser}
                      boxSize={5}
                      color={message.role === 'assistant' ? 'green.300' : 'blue.300'}
                    />
                  </Box>
                  <Box flex={1}>
                    {editingMessageIndex === index ? (
                      <Flex gap={2}>
                        <Textarea
                          defaultValue={message.content}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleEditMessage(index, e.currentTarget.value);
                            } else if (e.key === 'Escape') {
                              setEditingMessageIndex(null);
                            }
                          }}
                          onBlur={(e) => handleEditMessage(index, e.target.value)}
                          bg="gray.800"
                          border="1px solid"
                          borderColor="gray.700"
                          _hover={{
                            borderColor: 'gray.600',
                          }}
                          _focus={{
                            borderColor: 'green.400',
                            boxShadow: '0 0 0 1px var(--chakra-colors-green-400)',
                          }}
                          color="gray.100"
                          resize="none"
                          rows={1}
                          py={2}
                        />
                      </Flex>
                    ) : (
                      <Box position="relative">
                        <Text 
                          whiteSpace="pre-wrap" 
                          color="gray.100" 
                          fontSize="md" 
                          lineHeight="tall"
                        >
                          {message.content}
                        </Text>
                        {message.role === 'user' && (
                          <IconButton
                            aria-label="Edit message"
                            icon={<FiEdit2 />}
                            size="sm"
                            variant="ghost"
                            position="absolute"
                            top={-2}
                            right={-2}
                            opacity={0}
                            _groupHover={{ opacity: 1 }}
                            onClick={() => setEditingMessageIndex(index)}
                            color="gray.500"
                            _hover={{
                              bg: 'gray.700',
                              color: 'gray.200'
                            }}
                            transition="opacity 0.2s"
                          />
                        )}
                      </Box>
                    )}
                  </Box>
                </Flex>
              ))}

              {isGenerating && (
                <Flex gap={4} alignItems="start" bg="gray.850" p={5} borderRadius="xl">
                  <Box
                    bg="green.900"
                    p={2}
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon as={FiMessageSquare} boxSize={5} color="green.300" />
                  </Box>
                  <Box flex={1} pt={1}>
                    <Flex gap={2}>
                      <Box
                        h={2.5}
                        w={2.5}
                        borderRadius="full"
                        bg="green.400"
                        animation={`${pulseAnimation} 1s infinite`}
                      />
                      <Box
                        h={2.5}
                        w={2.5}
                        borderRadius="full"
                        bg="green.400"
                        animation={`${pulseAnimation} 1s infinite`}
                        style={{ animationDelay: '0.2s' }}
                      />
                      <Box
                        h={2.5}
                        w={2.5}
                        borderRadius="full"
                        bg="green.400"
                        animation={`${pulseAnimation} 1s infinite`}
                        style={{ animationDelay: '0.4s' }}
                      />
                    </Flex>
                  </Box>
                </Flex>
              )}

              <div ref={messagesEndRef} />
            </Flex>

            <Box 
              py={4} 
              borderTop="1px" 
              borderColor="gray.800"
              bg="gray.900"
              position="sticky"
              bottom={0}
              left={0}
              right={0}
              mt="auto"
            >
              <ChatInput
                onSubmit={handleSubmit}
                isDisabled={!isServerOnline || isGenerating}
                placeholder={
                  !isServerOnline
                    ? 'Ollama server is not running...'
                    : !selectedModel
                    ? 'Select a model to start chatting...'
                    : 'Message LocalChat...'
                }
                inputRef={chatInputRef}
                ragEnabled={ragEnabled}
                onToggleRAG={() => setRagEnabled(!ragEnabled)}
                models={models}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                onDocumentsChange={checkDocuments}
              />
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Chat;