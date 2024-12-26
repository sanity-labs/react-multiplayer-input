import {Box, Flex, Heading, Stack, Text} from '@sanity/ui'
import {useEffect, useState} from 'react'

import {MultiplayerTextArea} from '../../src/MultiplayerTextArea'

const SAMPLE_TEXT =
  'This is an example text that triggers a programmatic modification of the textarea value, simulating updating the text with edits coming from a remote user.'

const PARAGRAPHS = `

Programmatically changing the value of an input or a textarea makes the text cursor (also known as the caret) jumps to the end of the input.

This cursor jumping behavior results in a poor user experience, effectively making inputs unusable for collaborative editing.

This library aims to solve the problem by applying the cursor preservation technique outlined by Neil Fraser in 2009 (https://neil.fraser.name/writing/cursor/).

`

export function Demo() {
  const [value, setValue] = useState(PARAGRAPHS)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let timerId = setTimeout(doTick, 50)

    return () => {
      clearTimeout(timerId)
    }
    function doTick() {
      setTick((currentTick) => currentTick + 1)
      timerId = setTimeout(doTick, 10 + Math.random() * 150)
    }
  }, [])

  const [, ...rest] = value.split('\n')

  const endIndex = tick % SAMPLE_TEXT.length
  const dir = Math.floor(tick / SAMPLE_TEXT.length) % 2

  const typing = SAMPLE_TEXT.substring(0, dir === 1 ? SAMPLE_TEXT.length - endIndex : endIndex)

  const inputValue = [typing, ...rest, typing].join('\n')

  return (
    <Stack space={4}>
      <Stack space={3}>
        <Text>
          Interact with the text areas below to see the difference in cursor (caret) and selection
          behavior
        </Text>
      </Stack>
      <Flex gap={3}>
        <Stack flex={1} space={3}>
          <Heading as="h3">Regular textarea</Heading>
          <textarea
            style={{width: '100%', padding: 3}}
            rows={10}
            value={inputValue}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        </Stack>
        <Box paddingX={2}>
          <Heading as="h3">vs</Heading>
        </Box>
        <Stack flex={1} space={2}>
          <Heading as="h3">Multiplayer textarea</Heading>
          <MultiplayerTextArea
            style={{width: '100%', padding: 3}}
            rows={10}
            value={inputValue}
            onChange={(event) => setValue(event.currentTarget.value)}
          />
        </Stack>
      </Flex>
    </Stack>
  )
}
