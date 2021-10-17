import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
// import { useMatchBreakpoints } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { useCakeVault } from 'state/pools/hooks'
import { Pool } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { PoolTokenPairImage } from './PoolTokenPairImage'
import BaseCell from './BaseCell'

interface NameCellProps {
  pool: Pool
}

const StyledCell = styled(BaseCell)`
  flex: 1 0 130px;
  flex-direction: row;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.sm} {
    padding-left: 12px;
  }
`

const NameCell: React.FC<NameCellProps> = ({ pool }) => {
  const { t } = useTranslation()
  // const { isXs, isSm } = useMatchBreakpoints()
  const { sousId, stakingToken, earningToken, userData, isAutoVault } = pool
  const {
    userData: { userShares },
  } = useCakeVault()
  // const hasVaultShares = userShares && userShares.gt(0)

  // const stakingTokenSymbol = stakingToken.symbol
  // const earningTokenSymbol = earningToken.symbol

  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  // const isStaked = stakedBalance.gt(0)
  // const isManualCakePool = sousId === 0

  // const showStakedTag = isAutoVault ? hasVaultShares : isStaked

  // let title = `${t('Earn')} ${earningTokenSymbol}`
  // let subtitle = `${t('Stake')} ${stakingTokenSymbol}`
  // const showSubtitle = sousId !== 0 || (sousId === 0 && !isXs && !isSm)

  // if (isAutoVault) {
  //   title = t('Auto CAKE')
  //   subtitle = t('Automatic restaking')
  // } else if (isManualCakePool) {
  //   title = t('Manual CAKE')
  //   subtitle = `${t('Earn')} CAKE ${t('Stake').toLocaleLowerCase()} CAKE`
  // }

  return (
    <StyledCell role="cell">
      <PoolTokenPairImage
        isAuto={isAutoVault}
        primaryToken={stakingToken}
        secondaryToken={earningToken}
        mr="8px"
        width={40}
        height={40}
      />
      {/* <CellContent>
        {showStakedTag && (
          <Text fontSize="12px" bold color={isFinished ? 'failure' : 'secondary'} textTransform="uppercase">
            {t('Staked')}
          </Text>
        )}
        <Text bold={!isXs && !isSm} small={isXs || isSm}>
          {title}
        </Text>
        {showSubtitle && (
          <Text fontSize="12px" color="textSubtle">
            {subtitle}
          </Text>
        )}
      </CellContent> */}
    </StyledCell>
  )
}

export default NameCell
