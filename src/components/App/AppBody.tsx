import React from 'react'
import styled from 'styled-components'
import { Card } from 'uikit'

export const BodyWrapper = styled(Card)`
  border-radius: 10px;
  // max-width: 436px;
  // max-width: 40%;
  @media (min-width: 768px) {
    max-width: 40%;
  }
  width: 100%;
  z-index: 1;
  background: ${({ theme }) => theme.colors.gradients.bubblegum};
  font-family: 'Ubuntu';
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper>{children}</BodyWrapper>
}
