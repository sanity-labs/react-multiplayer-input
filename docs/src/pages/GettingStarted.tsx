import React from 'react'
import Helmet from 'react-helmet'

import {Root} from '../Root'

export function GettingStarted() {
  return (
    <Root>
      <Helmet>
        <meta charSet="utf-8" />
        <title>My Title</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      Getting started
    </Root>
  )
}
