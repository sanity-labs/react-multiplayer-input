import {Box, Flex, Heading, Stack, TextArea} from '@sanity/ui'
import {useEffect, useState} from 'react'

import {createMultiplayerInput} from '../../../src/createMultiplayerInput'

export const MultiplayerTextArea = createMultiplayerInput(TextArea)

const SAMPLE_TEXT = `This is an example of a programmatic modification of the textarea value. You can make your own edits below this paragraph.         `

const PARAGRAPHS = `

Programmatically changing the value of an input or a textarea makes the text cursor jump to the end of the input.

This cursor jumping behavior results in a poor user experience, effectively making textareas and text inputs unusable for collaborative editing.

This library aims to solve the problem by applying the cursor preservation technique outlined by Neil Fraser in his 2009 article found here: https://neil.fraser.name/writing/cursor/
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
      timerId = setTimeout(doTick, 10 + Math.random() * 200)
    }
  }, [])

  const [, ...rest] = value.split('\n')

  const endIndex = tick % SAMPLE_TEXT.length
  const dir = Math.floor(tick / SAMPLE_TEXT.length) % 2

  const typing = SAMPLE_TEXT.substring(0, dir === 1 ? SAMPLE_TEXT.length - endIndex : endIndex)

  const inputValue = [typing, ...rest].join('\n')

  return (
    <Flex gap={3} align="center">
      <Stack flex={1} space={3}>
        <Heading as="h4" size={1} muted>
          Multiplayer textarea
        </Heading>
        <MultiplayerTextArea
          rows={10}
          value={inputValue}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      </Stack>
      <Box paddingX={2}>
        <Heading as="h4" size={1} align="center" muted>
          vs
        </Heading>
      </Box>
      <Stack flex={1} space={3}>
        <Heading as="h4" size={1} muted>
          Native textarea
        </Heading>
        <TextArea
          rows={10}
          value={inputValue}
          onChange={(event) => setValue(event.currentTarget.value)}
        />
      </Stack>
    </Flex>
  )
}
