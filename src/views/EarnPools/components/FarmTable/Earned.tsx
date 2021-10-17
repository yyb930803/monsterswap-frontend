import React from 'react'
import styled from 'styled-components'
import { HelpIcon, useTooltip } from 'uikit'

export interface EarnedProps {
  earnings: number
  pid: number
}

interface EarnedPropsWithLoading extends EarnedProps {
  userDataReady: boolean
}

const Wrapper = styled.div`
  font-family: Ubuntu;
  font-weight: 700;
  padding-left: 100px;
`

const ReferenceElement = styled.div`
  display: inline-block;
  padding-left: 100px;
`

const Earned: React.FunctionComponent<EarnedPropsWithLoading> = ({ earnings, userDataReady }) => {
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    'Total value of the funds in this farm’s liquidity pool',
    { placement: 'top-end', tooltipOffset: [20, 10] },
  )

  const tooltipElement = (
    <>
      <ReferenceElement ref={targetRef}>
        <HelpIcon color="textSubtle" />
      </ReferenceElement>
      {tooltipVisible && tooltip}
    </>
  )

  return userDataReady
    ? earnings ? <Wrapper>{earnings.toLocaleString()}</Wrapper> : tooltipElement
    : tooltipElement
    // return <Wrapper>999,999.999</Wrapper>
}

export default Earned
