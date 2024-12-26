import {CopyIcon} from '@sanity/icons'
import {Box, Button, Card, Flex, Stack, Text} from '@sanity/ui'
import React from 'react'

const PACKAGES = [
  {name: 'npm', title: 'npm', command: (pkgName: string) => `npm install ${pkgName}`},
  {name: 'pnpm', title: 'pnpm', command: (pkgName: string) => `pnpm add ${pkgName}`},
  {name: 'yarn', title: 'yarn', command: (pkgName: string) => `yarn add ${pkgName}`},
]

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

export function InstallInstructions(props: {pgkName: string}) {
  return (
    <Stack space={2}>
      {PACKAGES.map((pkg) => {
        const command = pkg.command(props.pgkName)
        const [cli, ...rest] = command.split(' ')
        return (
          <>
            <Card border tone="suggest" padding={2} radius={2}>
              <Flex align="center">
                <Box flex={1}>
                  <Text>
                    <code>
                      <b>{cli}</b> {rest.join(' ')}
                    </code>
                  </Text>
                </Box>
                <Button icon={CopyIcon} mode="bleed" onClick={() => copyToClipboard(command)} />
              </Flex>
            </Card>
          </>
        )
      })}
    </Stack>
  )
}
