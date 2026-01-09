import React, { useEffect, useState } from 'react';
import { Flex, Box, Text } from '@chakra-ui/react';


interface ServerStatusProps {
  onChange: (status: boolean) => void;
}

const ServerStatus: React.FC<ServerStatusProps> = ({ onChange }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const response = await fetch('/api/tags');
        const isAvailable = response.ok;
        setIsOnline(isAvailable);
        onChange(isAvailable);
      } catch (error) {
        setIsOnline(false);
        onChange(false);
      } finally {
        setIsChecking(false);
      }
    };

    const intervalId = setInterval(checkServerStatus, 5000);
    checkServerStatus(); // Initial check

    return () => clearInterval(intervalId);
  }, [onChange]);

  return (
    <Flex align="center" gap={2}>
      <Box
        w={2}
        h={2}
        borderRadius="full"
        bg={isChecking ? 'yellow.400' : isOnline ? 'orange.400' : 'red.400'}
        transition="background-color 0.2s"
      />
      <Text fontSize="sm" color={isOnline ? 'orange.400' : 'red.400'}>
        {isChecking ? 'Checking...' : isOnline ? 'Online' : 'Offline'}
      </Text>
    </Flex>
  );
};

export default ServerStatus;