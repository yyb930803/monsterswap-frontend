import React, { useMemo } from 'react'
import { Flex, Skeleton } from 'uikit'
import styled from 'styled-components'
// import { useTranslation } from 'contexts/Localization'
import BigNumber from 'bignumber.js'
import Balance from 'components/Balance'
import { Pool } from 'state/types'
import { useCakeVault } from 'state/pools/hooks'
import { getBalanceNumber } from 'utils/formatBalance'
import BaseCell, { CellContent } from './BaseCell'

interface TotalStakedCellProps {
  pool: Pool
}

const StyledCell = styled(BaseCell)`
  flex: 5;
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: flex-start;
  & span {
    font-family: 'Red Hat Text', sans-serif;
    font-size: 18px;
    line-height: 24px;
    font-weight: bold;
    color: #4e4e9d;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 150px;
  }
`

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-family: Ubuntu;
  color: #4e4e9d;
  font-weight: 700;
`

const TotalStakedCell: React.FC<TotalStakedCellProps> = ({ pool }) => {
  // const { t } = useTranslation()
  console.log(pool);
  const { sousId, stakingToken, totalStaked, isAutoVault } = pool
  const { totalCakeInVault } = useCakeVault()

  const isManualCakePool = sousId === 0

  const totalStakedBalance = useMemo(() => {
    if (isAutoVault) {
      return getBalanceNumber(totalCakeInVault, stakingToken.decimals)
    }
    if (isManualCakePool) {
      const manualCakeTotalMinusAutoVault = new BigNumber(totalStaked).minus(0)
      // const manualCakeTotalMinusAutoVault = new BigNumber(totalStaked).minus(totalCakeInVault)
      return getBalanceNumber(manualCakeTotalMinusAutoVault, stakingToken.decimals)
    }
    return getBalanceNumber(totalStaked, stakingToken.decimals)
  }, [isAutoVault, totalCakeInVault, isManualCakePool, totalStaked, stakingToken.decimals])

  return (
    <StyledCell role="cell">
      <CellContent>
        {totalStaked && totalStaked.gte(0) ? (
          <Flex height="20px" alignItems="center">
            {/* <Balance fontSize="16px" value={totalStakedBalance} decimals={0} unit={` ${stakingToken.symbol}`} /> */}
            <Balance fontSize="16px" value={totalStakedBalance} decimals={0} />
          </Flex>
        ) : (
          <Skeleton width="80px" height="16px" />
        )}
      </CellContent>
    </StyledCell>
    // <StyledCell role="cell">
    //   <CellContent>
    //     <Wrapper>
    //       999,999,999
    //     </Wrapper>
    //   </CellContent>
    // </StyledCell>
  )
}

export default TotalStakedCell
