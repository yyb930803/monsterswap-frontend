import React from 'react'
import styled from 'styled-components'
import { Spinner } from 'uikit'
import Page from '../Layout/Page'

const Wrapper = styled(Page)`
  display: flex;
  justify-content: center;
  align-items: center;
`

const PageLoader: React.FC = () => {
  return (
    <Wrapper>
      <img src="/images/monster-running.gif" alt="loading monster" width="200" height="200" />
      {/* <Spinner /> */}
    </Wrapper>
  )
}

export default PageLoader
