import {LaunchIcon, MoonIcon, SunIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Heading, Stack, Text} from '@sanity/ui'
import React from 'react'

import {useColorScheme} from '../ColorSchemeProvider'
import {Demo} from '../components/Demo'
import {InstallInstructions} from '../components/InstallInstructions'

export function Home() {
  const [scheme, setScheme] = useColorScheme()

  return (
    <Card height="fill">
      <Stack space={3}>
        <Card padding={4}>
          <nav>
            <Flex>
              <Box flex={1}>
                <Text size={[1, 2, 3]} weight="semibold">
                  <a href="/">React Multiplayer Input</a>
                </Text>
              </Box>
              <Box>
                {scheme === 'dark' ? (
                  <Button icon={SunIcon} mode="bleed" onClick={() => setScheme('light')} />
                ) : (
                  <Button icon={MoonIcon} mode="bleed" onClick={() => setScheme('dark')} />
                )}
              </Box>
            </Flex>
          </nav>
        </Card>

        <Flex align="center" justify="center" padding={3} margin={4}>
          <Stack space={6} style={{maxWidth: '60%'}}>
            <Stack space={5}>
              <Box marginTop={[3, 5, 7]}>
                <Heading as="h1" size={[2, 3, 5]} align="center" muted>
                  React Multiplayer Input
                </Heading>
              </Box>
              <Text align="center" size={3}>
                Drop-in replacement for native <code>&lt;input&gt;</code> and{' '}
                <code>&lt;textarea&gt;</code> that preserves cursor, selection, and scroll position
                during collaborative editing
              </Text>
            </Stack>
            <Stack space={4} paddingTop={5}>
              <Heading size={2}>Why a special multiplayer input?</Heading>
              <Text size={2} muted>
                Programmatically changing the value of a text input or textarea makes the text
                cursor jump to the end of the input. Below is a side-by-side comparison of a
                collaborative textarea built with this library and a native textarea. Try interact
                with both to get a clear demonstration of the difference in text cursor and
                selection behavior in a simulated collaborative editing scenario.
              </Text>
              <Box paddingY={3}>
                <Demo />
              </Box>
            </Stack>
            <Stack space={3} marginTop={2}>
              <InstallInstructions pgkName="react-multiplayer-input" />
            </Stack>
            <Stack space={3} marginTop={2}>
              <Flex gap={4}>
                <Button
                  as="a"
                  padding={4}
                  tone="positive"
                  href="/getting-started"
                  text="Get started"
                  mode="ghost"
                />
                <Button
                  as="a"
                  padding={4}
                  href="https://github.com/sanity-io/react-multiplayer-input"
                  target="_blank"
                  rel="noopener noreferrer"
                  text="GitHub"
                  mode="bleed"
                  icon={LaunchIcon}
                />
              </Flex>
            </Stack>
          </Stack>
        </Flex>
      </Stack>
    </Card>
  )
}
