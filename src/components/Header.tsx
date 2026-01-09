import React from 'react';
import { Box, Flex, IconButton, Button, Tooltip, Badge } from '@chakra-ui/react';
import { FiPackage, FiDatabase } from 'react-icons/fi';
import ServerStatus from './ServerStatus';

interface HeaderProps {
  onStatusChange: (status: boolean) => void;
  onOpenModelLibrary: () => void;
  onOpenDocManager: () => void;
  hasDocuments: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onStatusChange,
  onOpenModelLibrary,
  onOpenDocManager,
  hasDocuments,
}) => {
  return (
    <Box 
      py={3} 
      px={6} 
      bg="genesys.900"
      position="relative"
      zIndex={10}
    >
      <Flex justify="flex-end" align="center" maxW="100%">
        <Flex gap={2} align="center">
          <ServerStatus onChange={onStatusChange} />

          {/* Documents Button */}
          <Tooltip label="Manage Documents" placement="bottom">
            <Box position="relative">
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiDatabase />}
                onClick={onOpenDocManager}
                color="gray.400"
                _hover={{ bg: 'genesys.700', color: 'orange.400' }}
                display={{ base: 'none', md: 'flex' }}
              >
                Documents
              </Button>
              <IconButton
                aria-label="Open document manager"
                icon={<FiDatabase />}
                variant="ghost"
                size="sm"
                onClick={onOpenDocManager}
                color="gray.400"
                _hover={{ bg: 'genesys.700', color: 'orange.400' }}
                display={{ base: 'flex', md: 'none' }}
              />
              {hasDocuments && (
                <Badge
                  position="absolute"
                  top="0"
                  right="0"
                  colorScheme="orange"
                  borderRadius="full"
                  fontSize="2xs"
                  minW="14px"
                  h="14px"
                >
                  ✓
                </Badge>
              )}
            </Box>
          </Tooltip>

          {/* Models Button */}
          <Tooltip label="Model Library" placement="bottom">
            <Box>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FiPackage />}
                onClick={onOpenModelLibrary}
                color="gray.400"
                _hover={{ bg: 'genesys.700', color: 'orange.400' }}
                display={{ base: 'none', md: 'flex' }}
              >
                Models
              </Button>
              <IconButton
                aria-label="Open model library"
                icon={<FiPackage />}
                variant="ghost"
                size="sm"
                onClick={onOpenModelLibrary}
                color="gray.400"
                _hover={{ bg: 'genesys.700', color: 'orange.400' }}
                display={{ base: 'flex', md: 'none' }}
              />
            </Box>
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
