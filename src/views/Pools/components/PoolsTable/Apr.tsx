import React from 'react'
import styled from 'styled-components'
import { Flex, useModal, CalculateIcon, Skeleton, FlexProps, Button,IconButton, } from 'uikit'
import ApyCalculatorModal from 'components/ApyCalculatorModal'
import Balance from 'components/Balance'
import { Pool } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getAprData } from 'views/Pools/helpers'
import { getAddress } from 'utils/addressHelpers'

interface AprProps extends FlexProps {
  pool: Pool
  showIcon: boolean
  performanceFee?: number
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  font-family: Ubuntu;
  color: #4e4e9d;
  font-weight: 700;
`

const Apr: React.FC<AprProps> = ({ pool, showIcon, performanceFee = 0, ...props }) => {
  const { stakingToken, earningToken, isFinished, earningTokenPrice, apr } = pool
  const { t } = useTranslation()

  const { apr: earningsPercentageToDisplay, roundingDecimals, compoundFrequency } = getAprData(pool, performanceFee)

  const apyModalLink = stakingToken.address ? `/swap?outputCurrency=${getAddress(stakingToken.address)}` : '/swap'

  const [onPresentApyModal] = useModal(
    <ApyCalculatorModal
      tokenPrice={earningTokenPrice}
      apr={apr}
      linkLabel={t('Get %symbol%', { symbol: stakingToken.symbol })}
      linkHref={apyModalLink}
      earningTokenSymbol={earningToken.symbol}
      roundingDecimals={roundingDecimals}
      compoundFrequency={compoundFrequency}
      performanceFee={performanceFee}
    />
  )

  const openRoiModal = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    onPresentApyModal()
  }

  return (
    <Wrapper>
      {pool.apr && pool.apr.toFixed(2)}%
      <IconButton onClick={onPresentApyModal} variant="text" scale="sm">
        <CalculateIcon color="textSubtle" width="18px" />
      </IconButton>
    </Wrapper>
    // <Flex alignItems="center" justifyContent="space-between" {...props}>
    //   {earningsPercentageToDisplay || isFinished ? (
    //     <>
    //       <Balance
    //         onClick={openRoiModal}
    //         fontSize="16px"
    //         isDisabled={isFinished}
    //         value={isFinished ? 0 : earningsPercentageToDisplay}
    //         decimals={2}
    //         unit="%"
    //       />
    //       {!isFinished && showIcon && (
    //         <Button onClick={openRoiModal} variant="text" width="20px" height="20px" padding="0px" marginLeft="4px">
    //           <CalculateIcon color="textSubtle" width="20px" />
    //         </Button>
    //       )}
    //     </>
    //   ) : (
    //     <Skeleton width="80px" height="16px" />
    //   )}
    // </Flex>
  )
}

export default Apr
