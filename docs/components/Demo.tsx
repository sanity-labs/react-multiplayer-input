import {Box, Button, Flex, Stack, Text, TextArea} from '@sanity/ui'
import {useEffect, useState} from 'react'

import {MultiplayerTextArea} from '../../src/MultiplayerTextArea'

const FIRST_PARAGRAPH =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non sollicitudin lectus. Sed molestie, est quis eleifend vestibulum, nibh erat tincidunt quam, a efficitur purus diam at nisi. Donec congue pharetra justo ornare efficitur. Donec bibendum dui nec ex posuere interdum. Vestibulum scelerisque leo sapien, quis convallis libero vestibulum eget. Mauris in sodales leo. Quisque semper posuere egestas.'

const PARAGRAPHS = `Nam faucibus pulvinar condimentum. Sed suscipit fermentum elit eget volutpat. In suscipit consequat nisl at congue. Nulla dapibus lacinia quam, vel porta augue tincidunt sit amet. Aenean vulputate tortor sed dictum tincidunt. Praesent gravida leo vitae sapien rhoncus, ac tincidunt ante gravida. Etiam consectetur diam ipsum, in pellentesque magna molestie eu. Donec molestie scelerisque neque, vel posuere elit elementum non. Praesent malesuada tortor vitae risus tempor, quis imperdiet libero euismod. Vivamus sagittis erat eros, non venenatis nisi fringilla sed. Nullam felis massa, faucibus in pulvinar vitae, efficitur eu est. Duis velit felis, vehicula id pulvinar sed, varius et justo. Sed eget sem vitae ligula tincidunt faucibus sed sed tellus.

Duis eu tellus eleifend, elementum risus a, maximus metus. Duis mattis dignissim venenatis. Integer in ipsum vel nulla ullamcorper porttitor non in metus. Donec vel erat felis. Ut dignissim risus ut dapibus malesuada. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Proin imperdiet vehicula sem, semper imperdiet nunc hendrerit vel. Mauris ultricies, arcu id laoreet vulputate, urna ex dapibus velit, sed pharetra massa tellus ac diam. Duis sed augue neque. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. In mattis, purus non sollicitudin facilisis, enim leo porttitor lectus, ac consectetur enim mauris eget magna. Morbi rutrum, arcu vitae finibus sodales, tortor sem gravida libero, nec condimentum enim leo id elit. Nullam pellentesque in velit nec tempor. In quam neque, lobortis id dolor a, varius fringilla mi. Proin suscipit quam et risus rhoncus fermentum.

Sed aliquam, felis ut molestie gravida, eros risus porttitor magna, sed accumsan dui libero eu nulla. Mauris porttitor sodales purus, et tempor urna interdum at. Nunc lacinia orci ac erat ornare ornare. Fusce elit lectus, blandit sed viverra ac, tincidunt quis sem. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vestibulum vel odio odio. Duis iaculis ac est eu feugiat. Aenean nisl leo, fringilla et ornare et, pharetra id orci. Morbi et magna viverra diam aliquam mollis nec et metus. Vestibulum eget euismod ante. Maecenas non lectus vel turpis posuere sagittis. Morbi eu odio quis nulla sollicitudin porta. Nunc et quam tristique, iaculis sem in, eleifend odio.

Fusce ac congue est. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Donec sit amet auctor metus. Integer vitae diam augue. Pellentesque pellentesque justo orci, sed aliquet sapien imperdiet ut. Integer pellentesque finibus quam sit amet egestas. Quisque porttitor commodo lobortis. Suspendisse vel mauris ac felis accumsan varius. Ut nulla felis, malesuada a porttitor non, lacinia eget nunc. Etiam pretium suscipit bibendum. Ut consectetur nibh in orci efficitur, a facilisis neque tincidunt.`

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

  const endIndex = tick % FIRST_PARAGRAPH.length
  const dir = Math.floor(tick / FIRST_PARAGRAPH.length) % 2

  const inputValue =
    FIRST_PARAGRAPH.substring(0, dir === 1 ? FIRST_PARAGRAPH.length - endIndex : endIndex) +
    '\n' +
    rest.join('\n')

  const [native, setNative] = useState<boolean>(false)

  const Component = native ? TextArea : MultiplayerTextArea
  return (
    <Stack space={3}>
      <Flex gap={2} align="center">
        <Box flex={1}>
          <Text align="left">Play around with caret or make a selection below</Text>
        </Box>
        <Text>Switch to</Text>
        {native ? (
          <Button
            mode="bleed"
            text="<MultiplayerTextArea>"
            selected={native}
            onClick={() => setNative(false)}
          />
        ) : (
          <Button
            mode="bleed"
            text="Native <textarea>"
            selected={!native}
            onClick={() => setNative(true)}
          />
        )}
      </Flex>
      <Component
        as={TextArea}
        style={{width: '100%', padding: 3}}
        rows={10}
        value={inputValue}
        onChange={(event) => setValue(event.currentTarget.value)}
      />
    </Stack>
  )
}
