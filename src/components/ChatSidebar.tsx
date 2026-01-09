import React from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  Flex,
  Button,
  Icon,
} from '@chakra-ui/react';
import { FiTrash2, FiMessageSquare, FiPlus } from 'react-icons/fi';
import { ChatSession } from '../services/chatHistory';

interface ChatSidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onSessionDelete: (sessionId: string) => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  currentSessionId,
  onSessionSelect,
  onSessionDelete,
  onNewChat,
}) => {
  return (
    <Box
      w="280px"
      h="100vh"
      bg="genesys.900"
      borderRight="1px"
      borderColor="genesys.700"
      display="flex"
      flexDirection="column"
    >
      <Flex direction="column" h="full">
        <Box p={4} borderBottom="1px" borderColor="genesys.700">
          <Flex align="center" gap={2} mb={3}>
            <Icon as={FiMessageSquare} color="orange.400" boxSize={5} />
            <Text fontSize="lg" fontWeight="bold" color="gray.100">
              LocalChat
            </Text>
          </Flex>
          <Button
            w="full"
            size="md"
            colorScheme="orange"
            leftIcon={<FiPlus />}
            onClick={onNewChat}
          >
            New Chat
          </Button>
        </Box>

        <Box px={4} py={3} borderBottom="1px" borderColor="genesys.700">
          <Text fontSize="xs" fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
            Recent Chats
          </Text>
        </Box>

        <VStack
          spacing={0}
          align="stretch"
          flex={1}
          overflowY="auto"
          px={2}
          py={2}
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--chakra-colors-gray-700)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'var(--chakra-colors-gray-600)',
            },
          }}
        >
          {sessions.length === 0 ? (
            <Box px={3} py={8} textAlign="center">
              <Text fontSize="sm" color="gray.600">
                No chats yet
              </Text>
              <Text fontSize="xs" color="gray.700" mt={1}>
                Start a new conversation
              </Text>
            </Box>
          ) : (
            sessions.map((session) => (
              <Flex
                key={session.id}
                p={3}
                cursor="pointer"
                borderRadius="md"
                bg={currentSessionId === session.id ? 'genesys.700' : 'transparent'}
                _hover={{ bg: currentSessionId === session.id ? 'genesys.600' : 'genesys.800' }}
                onClick={() => onSessionSelect(session.id)}
                justify="space-between"
                align="center"
                role="group"
                transition="all 0.2s"
                mb={1}
              >
                <Flex align="center" gap={2} flex={1} overflow="hidden">
                  <Icon 
                    as={FiMessageSquare} 
                    color={currentSessionId === session.id ? 'orange.400' : 'gray.500'} 
                    boxSize={4}
                    flexShrink={0}
                  />
                  <Text
                    color={currentSessionId === session.id ? 'gray.100' : 'gray.400'}
                    fontSize="sm"
                    fontWeight={currentSessionId === session.id ? 'medium' : 'normal'}
                    noOfLines={1}
                  >
                    {session.title}
                  </Text>
                </Flex>
                <IconButton
                  aria-label="Delete chat"
                  icon={<FiTrash2 size="14px" />}
                  variant="ghost"
                  size="xs"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSessionDelete(session.id);
                  }}
                  opacity={0}
                  _groupHover={{ opacity: 1 }}
                  transition="opacity 0.2s"
                />
              </Flex>
            ))
          )}
        </VStack>
      </Flex>
    </Box>
  );
};

export default ChatSidebar;
