import styled from 'styled-components'
import Text from './Text'

const TooltipText = styled(Text)`
  font-size: 10px;
  ${({ theme }) => theme.mediaQueries.xs} {
    font-size: 10px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 14px;
  }
`

export default TooltipText
