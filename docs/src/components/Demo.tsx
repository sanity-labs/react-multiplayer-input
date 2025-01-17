import {PauseIcon, PlayIcon, RefreshIcon, StopIcon} from '@sanity/icons'
import {Button, Card, Flex, Stack, Text, TextArea} from '@sanity/ui'
import {useEffect, useRef} from 'react'

import {createMultiplayerInput} from '../../../src/createMultiplayerInput'
import {createBroadcastStore, useBroadcastValue} from '../createBroadcastStore'
import {startTyping} from '../textTyper'

export const MultiplayerTextArea = createMultiplayerInput(TextArea)

const SAMPLE_TEXT = `Programmatically changing the value of a text input or a textsrea\b\b\b\barea makes the text cursor jump to the end. This results in a poor user experience, effectively making textareas and text inputs unsuitable for collaborative editing.

This library aims to solve this problem by applying the cursor preservation technique described by Neil Fraser in his 2009 article (link below *).

Oh, and this is actually a live demo, where you've got a side-by-side comparison of a multiplayer textarea to the left and a native textarea to the right. Try typing or making a selection in both textareas to see the difference for yourself.

Now, lets do some lorem ipsums for the rest of this demo...

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed suscipit risus turpis, nec fermentum purus pretium sit amet. Duis vitae erat et nisi porttitor ultrices. Phasellus ut facilisis odio. Pellentesque rhoncus ex non elit scelerisque, in ullamcorper arcu posuere. Pellentesque interdum blandit odio, at sollicitudin orci fringilla in. Curabitur pulvinar, sem sit amet convallis mattis, ex odio vulputate sapien, ac aliquam arcu magna at enim. Proin tristique vitae eros ut congue. Phasellus euismod in lacus nec gravida. Phasellus vehicula, lorem nec aliquet pharetra, lectus augue interdum odio, dictum pharetra sapien turpis quis felis. Nullam congue, dui suscipit placerat euismod, erat quam eleifend nisl, sit amet egestas arcu odio et ligula. Cras vitae velit a erat aliquet aliquet. Nullam in nisi id tortor imperdiet scelerisque. Fusce magna felis, molestie sed aliquet euismod, sodales a felis. Nam facilisis eu ipsum in pulvinar. Integer quis orci mollis, varius felis at, dapibus arcu. Quisque sed libero in urna efficitur rhoncus.

Aenean egestas scelerisque arcu, vel euismod purus faucibus in. Pellentesque non leo pharetra, cursus arcu sit amet, scelerisque mi. Fusce mattis sodales quam, nec pulvinar lacus. Nulla eu blandit quam, ut euismod ipsum. Nulla sed purus nec ligula vestibulum facilisis ut eget augue. Mauris malesuada est dignissim, convallis mi eget, auctor lacus. Aliquam non ante accumsan, commodo leo non, elementum urna. Fusce iaculis sed nisi ut tempus. Suspendisse eget velit libero.

Praesent nec vehicula odio. Maecenas eu iaculis lacus. Cras luctus, sem quis sodales accumsan, libero ipsum feugiat lectus, at blandit sapien lacus vehicula orci. Curabitur vestibulum et dolor non interdum. Suspendisse lorem diam, fermentum at mollis ac, volutpat ac dolor. Phasellus molestie ut arcu nec bibendum. Praesent efficitur dapibus rhoncus. Nullam mattis, velit sed feugiat molestie, mi mauris feugiat odio, sit amet viverra lacus sapien in nisi. Suspendisse potenti. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In hac habitasse platea dictumst. Proin augue ex, fringilla sit amet tempus ac, elementum eu eros. Maecenas ultricies, lectus at convallis malesuada, ante ex dictum purus, a accumsan leo nisl sit amet erat.

Vivamus eget ultrices arcu, eu lacinia leo. Morbi non feugiat purus, nec porta justo. Donec suscipit leo nec sagittis condimentum. Maecenas sed rutrum enim. Nunc imperdiet consequat tempus. Vivamus arcu lacus, semper eu consequat non, lobortis ac ipsum. Phasellus vitae tortor orci. Quisque in tristique velit. Duis varius et lorem nec lobortis. Vestibulum tempus tortor in erat commodo, vitae maximus augue congue. Duis laoreet facilisis condimentum.

Pellentesque a eros sollicitudin, pretium nibh sit amet, vehicula urna. Sed et tempus massa. Integer tempus lobortis ligula at faucibus. Cras semper lectus nec ultricies tincidunt. Nullam in consectetur massa, vel malesuada metus. Fusce aliquet ut sapien a condimentum. Vestibulum ac ex in mi varius gravida. Integer vestibulum at mauris at faucibus. Praesent scelerisque, libero sit amet semper varius, sem velit imperdiet lectus, vel porttitor nunc elit vel elit. Nullam et vulputate orci, ut tincidunt nunc. Mauris venenatis hendrerit lacinia. Praesent gravida ipsum ut orci eleifend elementum. Nunc sit amet tristique ipsum, eget efficitur tellus. Aenean mollis augue ac ultrices condimentum.

`

const store = createBroadcastStore<string | undefined>(SAMPLE_TEXT)
export function Demo() {
  const [value, setValue] = useBroadcastValue<string | undefined>(store)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  return (
    <>
      <Stack space={2}>
        <Card tone="default">
          <Button mode="bleed" icon={PlayIcon} />
          <Button mode="bleed" icon={PauseIcon} />
          <Button mode="bleed" icon={StopIcon} />
          <Button mode="bleed" icon={RefreshIcon} />
        </Card>
        <Flex gap={3} align="center">
          <Stack flex={1} space={3}>
            <MultiplayerTextArea
              style={{padding: 20}}
              ref={inputRef}
              rows={22}
              value={value || ''}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
          </Stack>
          <Stack flex={1} space={3}>
            <TextArea
              rows={22}
              value={value}
              onChange={(event) => setValue(event.currentTarget.value)}
            />
          </Stack>
        </Flex>
        <Text>
          *){' '}
          <a href="https://neil.fraser.name/writing/cursor/">
            https://neil.fraser.name/writing/cursor/
          </a>
        </Text>
      </Stack>
      <Mirror />
    </>
  )
}

function Mirror() {
  const [value, setValue] = useBroadcastValue<string | undefined>(store)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (inputRef.current) {
      return startTyping(
        inputRef.current,
        SAMPLE_TEXT,
        () => Math.random() * 20 + Math.random() * 100,
        () => {},
      )
    }
    return undefined
  }, [inputRef])

  return (
    <MultiplayerTextArea
      style={{display: 'none'}}
      value={value || ''}
      ref={inputRef}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  )
}
