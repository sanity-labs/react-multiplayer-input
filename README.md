# react-multiplayer-input



Known issues and limitations:
- Text cursor blinking is reset when text input updates. Receiving many updates at short intervals can make the text cursor appear static (i.e. not blinking)
- No undo support (as of now). When a new value is written to the textarea, the local edit history seems to be discarded by the browser.
