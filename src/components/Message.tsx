import React from 'react';
import { Box, Text, Flex, Avatar, useColorModeValue } from '@chakra-ui/react';
import type { Message as MessageType } from '../services/ollama';

interface MessageProps {
  message: MessageType;
  isLatest: boolean;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const bgColor = useColorModeValue(
    isUser ? 'blue.500' : 'gray.100',
    isUser ? 'blue.400' : 'gray.700'
  );
  const textColor = useColorModeValue(
    isUser ? 'white' : 'gray.800',
    isUser ? 'white' : 'gray.100'
  );

  return (
    <Flex
      w="full"
      justify={isUser ? 'flex-end' : 'flex-start'}
      mb={4}
      data-group
    >
      <Flex maxW="70%" align="flex-start" gap={2}>
        <Avatar
          size="sm"
          name={isUser ? 'User' : 'Ollama'}
          src={!isUser ? '/ollama.png' : undefined}
          bg={isUser ? 'blue.500' : 'white'}
          color={isUser ? 'white' : undefined}
          order={isUser ? 2 : 1}
        />
        <Box
          bg={bgColor}
          color={textColor}
          px={4}
          py={3}
          borderRadius="lg"
          order={isUser ? 1 : 2}
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: '12px',
            [isUser ? 'right' : 'left']: '-6px',
            border: '6px solid transparent',
            borderRightColor: isUser ? 'transparent' : bgColor,
            borderLeftColor: isUser ? bgColor : 'transparent',
            transform: isUser ? 'translateX(1px)' : 'translateX(-1px)',
          }}
        >
          <Text whiteSpace="pre-wrap">{message.content}</Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Message;
