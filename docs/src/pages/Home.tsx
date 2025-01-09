import {ArrowRightIcon, LaunchIcon, MoonIcon, SunIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Heading, Stack, Text} from '@sanity/ui'
import React from 'react'

import {useColorScheme} from '../ColorSchemeProvider'
import {Demo} from '../components/Demo'
import {MdiGithub} from '../components/GithubIcon'
import {InstallInstructions} from '../components/InstallInstructions'

export function Home() {
  const [scheme, setScheme] = useColorScheme()

  return (
    <Card height="fill">
      <Stack space={3}>
        <Card as="nav" tone="primary" paddingX={5} paddingY={3} borderBottom>
          <Flex align="center">
            <Flex gap={5} flex={1} align="center">
              <Text size={[1, 2, 3]} weight="semibold">
                <a href="/">React Multiplayer Input</a>
              </Text>
              <Text>
                <a href="/">Docs</a>
              </Text>
            </Flex>

            <Flex gap={3}>
              {scheme === 'dark' ? (
                <Button icon={SunIcon} mode="bleed" onClick={() => setScheme('light')} />
              ) : (
                <Button icon={MoonIcon} mode="bleed" onClick={() => setScheme('dark')} />
              )}
              <Button
                as="a"
                href="https://github.com/sanity-io/react-multiplayer-input"
                target="_blank"
                rel="noopener noreferrer"
                mode="bleed"
                fontSize={3}
                icon={MdiGithub}
              />
            </Flex>
          </Flex>
        </Card>

        <Flex justify="center" padding={3} margin={4}>
          <Stack space={6}>
            <Stack space={5}>
              <Box marginTop={[3, 5, 6]} marginBottom={4}>
                <Heading as="h1" size={[2, 3, 5]}>
                  React Multiplayer Input
                </Heading>
              </Box>
              <Text size={3}>
                Drop-in replacement for native <code>&lt;input&gt;</code> and{' '}
                <code>&lt;textarea&gt;</code> that preserves <b>cursor</b>, <b>selection</b>, and{' '}
                <b>scroll position</b> during collaborative editing
              </Text>
            </Stack>
            <Stack space={4} paddingTop={3}>
              <Flex>
                <Button
                  fontSize={4}
                  tone="suggest"
                  radius={6}
                  paddingX={5}
                  paddingY={4}
                  iconRight={<ArrowRightIcon />}
                  text="Get started"
                />
              </Flex>
            </Stack>
            <Stack space={4} paddingTop={3}>
              <Demo />
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
