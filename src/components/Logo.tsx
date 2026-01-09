import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const Logo = () => {
  return (
    <Box
      position="relative"
      w="40px"
      h="40px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Main circle */}
      <Box
        position="absolute"
        w="36px"
        h="36px"
        borderRadius="full"
        bg="orange.500"
        opacity="0.8"
        animation={`${pulse} 2s infinite ease-in-out`}
      />
      
      {/* Inner ring */}
      <Box
        position="absolute"
        w="24px"
        h="24px"
        borderRadius="full"
        border="3px solid"
        borderColor="white"
      />
      
      {/* Center dot */}
      <Box
        position="absolute"
        w="8px"
        h="8px"
        borderRadius="full"
        bg="white"
      />
      
      {/* Orbital circles */}
      {[0, 120, 240].map((rotation) => (
        <Box
          key={rotation}
          position="absolute"
          w="10px"
          h="10px"
          borderRadius="full"
          bg="orange.200"
          transform={`rotate(${rotation}deg) translateX(18px)`}
        />
      ))}
    </Box>
  );
};

export default Logo;
