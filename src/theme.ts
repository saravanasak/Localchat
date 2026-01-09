import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'genesys.900',
        color: 'gray.100',
      },
    },
  },
  colors: {
    // Genesys brand-inspired dark palette
    genesys: {
      900: '#0D0F12',    // Deep charcoal background
      850: '#141720',    // Slightly lighter for cards
      800: '#1A1E28',    // Card backgrounds
      700: '#252A38',    // Borders, hover states
      600: '#323848',    // Muted elements
    },
    gray: {
      900: '#0D0F12',
      800: '#1A1E28',
      700: '#252A38',
      600: '#323848',
      500: '#6B7280',
      400: '#9CA3AF',
      300: '#D1D5DB',
      200: '#E5E7EB',
      100: '#F3F4F6',
      50: '#F9FAFB',
    },
    // Genesys Orange - the signature brand color
    orange: {
      900: '#7C2D12',
      800: '#9A3412',
      700: '#C2410C',
      600: '#EA580C',
      500: '#FF4F1F',    // Genesys primary orange
      400: '#FF6B3D',
      300: '#FF8A5C',
      200: '#FFB899',
      100: '#FFE4D6',
      50: '#FFF7F2',
    },
    // Accent coral for highlights
    coral: {
      500: '#FF6B4A',
      400: '#FF8266',
      300: '#FF9980',
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'orange',
      },
      variants: {
        solid: {
          bg: 'orange.500',
          color: 'white',
          _hover: {
            bg: 'orange.400',
            _disabled: {
              bg: 'orange.500',
            },
          },
          _active: {
            bg: 'orange.600',
          },
        },
        outline: {
          borderColor: 'genesys.700',
          color: 'orange.400',
          _hover: {
            bg: 'genesys.800',
            borderColor: 'orange.500',
          },
        },
        ghost: {
          color: 'gray.300',
          _hover: {
            bg: 'genesys.700',
            color: 'orange.400',
          },
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: 'genesys.850',
          borderColor: 'genesys.700',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        },
        item: {
          bg: 'genesys.850',
          _hover: {
            bg: 'genesys.700',
          },
          _focus: {
            bg: 'genesys.700',
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'orange.500',
      },
      variants: {
        outline: {
          field: {
            bg: 'genesys.800',
            borderColor: 'genesys.700',
            _hover: {
              borderColor: 'genesys.600',
            },
            _focus: {
              borderColor: 'orange.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-orange-500)',
            },
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'orange.500',
      },
      variants: {
        outline: {
          field: {
            bg: 'genesys.800',
            borderColor: 'genesys.700',
            _hover: {
              borderColor: 'genesys.600',
            },
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'orange.500',
      },
      variants: {
        outline: {
          bg: 'genesys.800',
          borderColor: 'genesys.700',
          _hover: {
            borderColor: 'genesys.600',
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: 'genesys.850',
          borderColor: 'genesys.700',
        },
        header: {
          color: 'white',
        },
        body: {
          color: 'gray.200',
        },
      },
    },
    Tooltip: {
      baseStyle: {
        bg: 'genesys.700',
        color: 'white',
      },
    },
    Tabs: {
      variants: {
        line: {
          tab: {
            color: 'gray.400',
            _selected: {
              color: 'orange.400',
              borderColor: 'orange.500',
            },
            _hover: {
              color: 'orange.300',
            },
          },
        },
      },
    },
  },
});

export default theme;
