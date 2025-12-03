import React from 'react';
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
  List,
  ListItem,
  ListIcon,
  Flex,
  Link,
} from '@chakra-ui/react';
import { FiDownload, FiCheckCircle, FiExternalLink, FiMessageSquare } from 'react-icons/fi';
import { getInstallInstructions } from '../services/ollamaManager';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ isOpen, onClose }) => {
  const installInfo = getInstallInstructions();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay bg="blackAlpha.800" backdropFilter="blur(10px)" />
      <ModalContent bg="gray.800" borderColor="gray.700" borderWidth={1}>
        <ModalHeader color="gray.100">
          <Flex align="center" gap={3}>
            <Icon as={FiMessageSquare} color="green.400" boxSize={6} />
            <Text>Welcome to LocalChat</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text color="gray.300" mb={4}>
                To use LocalChat, you need Ollama installed on your system. 
                Ollama runs AI models locally, ensuring complete privacy.
              </Text>
            </Box>

            <Box
              bg="gray.900"
              p={4}
              borderRadius="lg"
              borderWidth={1}
              borderColor="gray.700"
            >
              <Text fontWeight="semibold" color="gray.100" mb={3}>
                Installation Steps for {installInfo.platform}:
              </Text>
              <List spacing={2}>
                {installInfo.instructions.map((instruction, index) => (
                  <ListItem key={index} color="gray.300" fontSize="sm">
                    <ListIcon as={FiCheckCircle} color="green.400" />
                    {instruction}
                  </ListItem>
                ))}
              </List>
            </Box>

            <VStack spacing={3}>
              <Button
                as={Link}
                href={installInfo.downloadUrl}
                isExternal
                colorScheme="green"
                size="lg"
                width="full"
                leftIcon={<FiDownload />}
                rightIcon={<FiExternalLink />}
                _hover={{ textDecoration: 'none' }}
              >
                Download Ollama for {installInfo.platform}
              </Button>

              <Button
                variant="outline"
                size="lg"
                width="full"
                onClick={() => window.location.reload()}
                borderColor="gray.600"
                color="gray.300"
                _hover={{ bg: 'gray.700' }}
              >
                I've Installed Ollama - Refresh
              </Button>
            </VStack>

            <Box pt={2}>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Need help? Visit{' '}
                <Link
                  href="https://ollama.com"
                  isExternal
                  color="green.400"
                  _hover={{ textDecoration: 'underline' }}
                >
                  ollama.com
                </Link>
                {' '}for detailed documentation
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SetupWizard;
