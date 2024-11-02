import { HStack, Switch, Text, useColorMode } from '@chakra-ui/react'

// ColorModeSwitch component to toggle between light and dark modes
const ColorModeSwitch = () => {
  // useColorMode hook to get the current color mode and the function to toggle it
  const { toggleColorMode, colorMode } = useColorMode();
 
  return (
    <HStack>
      {/* Switch component to toggle color mode */}
      <Switch 
        colorScheme='green' 
        isChecked={colorMode === "dark"} 
        onChange={toggleColorMode} 
        mb={3}
      />
      {/* Text to indicate the current mode */}
      <Text>Dark Mode</Text>
    </HStack>
  )
}

export default ColorModeSwitch
