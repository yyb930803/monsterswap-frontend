import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'

export interface LiquidityProps {
  liquidity: BigNumber
}

const Wrapper = styled.div`
  font-family: Ubuntu;
  font-weight: 700;
`

const Liquidity: React.FunctionComponent<LiquidityProps> = ({ liquidity }) => {
  const displayLiquidity =
    liquidity && liquidity.gt(0) && `$${Number(liquidity).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
  
  return displayLiquidity ? <Wrapper>{displayLiquidity}</Wrapper> : <Wrapper />  
}

export default Liquidity
