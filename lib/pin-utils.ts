// Mock implementation for local development
export const MAX_PIN_LENGTH = 4;

// Mock valid PINs for testing
const VALID_PINS = ['1234', '0000', '9999'];

export const validatePinWithSupabase = async (pin: string): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Check if PIN is in our mock valid PINs list
  return VALID_PINS.includes(pin);
};