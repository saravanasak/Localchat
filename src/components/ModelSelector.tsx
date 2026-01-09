import React from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Icon,
  Text,
  Flex,
  Box,
  Spinner,
} from '@chakra-ui/react';
import { FiChevronDown, FiCpu, FiCheck } from 'react-icons/fi';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  isLoading: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onModelChange,
  isLoading,
}) => {
  const sortedModels = [...models].sort((a, b) => a.localeCompare(b));

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="outline"
        borderColor="genesys.700"
        _hover={{ bg: 'genesys.700', borderColor: 'genesys.600' }}
        _active={{ bg: 'genesys.700' }}
        rightIcon={<FiChevronDown />}
        leftIcon={<Icon as={FiCpu} color="orange.400" />}
        px={4}
        h="40px"
        minW="180px"
        bg="genesys.800"
      >
        <Flex align="center" gap={2}>
          {isLoading ? (
            <Spinner size="sm" color="orange.400" />
          ) : (
            <Text color="gray.100" fontSize="sm" isTruncated>
              {selectedModel || 'Select Model'}
            </Text>
          )}
        </Flex>
      </MenuButton>
      <MenuList
        bg="genesys.850"
        borderColor="genesys.700"
        boxShadow="lg"
        py={2}
        maxH="300px"
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--chakra-colors-gray-600)',
            borderRadius: '4px',
          },
        }}
      >
        {sortedModels.map((model) => (
          <MenuItem
            key={model}
            onClick={() => onModelChange(model)}
            bg="transparent"
            _hover={{ bg: 'genesys.700' }}
            _focus={{ bg: 'genesys.700' }}
            position="relative"
            px={4}
            py={2}
          >
            <Flex align="center" gap={3} w="full">
              <Box color={selectedModel === model ? 'orange.400' : 'gray.400'}>
                <Icon as={FiCpu} boxSize={4} />
              </Box>
              <Text color="gray.100" fontSize="sm">
                {model}
              </Text>
              {selectedModel === model && (
                <Icon
                  as={FiCheck}
                  color="orange.400"
                  boxSize={4}
                  position="absolute"
                  right={4}
                />
              )}
            </Flex>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default ModelSelector;
