import React from 'react'
import styled from 'styled-components'
import {
  Flex,
  TooltipText,
  IconButton,
  useModal,
  CalculateIcon,
  Skeleton,
  useTooltip,
  useMatchBreakpoints,
} from 'uikit'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import ApyCalculatorModal from 'components/ApyCalculatorModal'
import { Pool } from 'state/types'
import { getAprData } from 'views/Pools/helpers'
import { getAddress } from 'utils/addressHelpers'

interface AprRowProps {
  pool: Pool
  performanceFee?: number
}

const AprContent = styled.div`
  display: flex;
  align-items: center;
  & div,
  & span {
    font-weight: 500;
    font-size: 14px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #4e4e9d;
  }
  & button {
    background: transparent !important;
    & svg {
      fill: #4e4e9d !important;
    }
  }
  & span {
    font-weight: bold;
    font-size: 10px;
    ${({ theme }) => theme.mediaQueries.xs} {
      font-size: 10px;
    }
    ${({ theme }) => theme.mediaQueries.sm} {
      font-size: 18px;
    }
    margin-left: 8px;
  }
`

const AprText = styled(Flex)`
  & h2 {
    font-family: 'Funhouse';
    font-size: 12px;
    font-weight: normal;

    ${({ theme }) => theme.mediaQueries.sm} {
      font-family: 'Ubuntu';
      font-size: 18px;
    }
  }

  & p {
    font-family: 'Ubuntu';
    font-size: 12px;

    ${({ theme }) => theme.mediaQueries.sm} {
      font-size: 18px;
    }
  }
`

const AprRow: React.FC<AprRowProps> = ({ pool, performanceFee = 0 }) => {
  const { t } = useTranslation()
  const { stakingToken, earningToken, isFinished, apr, earningTokenPrice, isAutoVault } = pool
  const { isXl } = useMatchBreakpoints()

  const tooltipContent = isAutoVault
    ? t('APY includes compounding, APR doesn’t. This pool’s CAKE is compounded automatically, so we show APY.')
    : t('This pool’s rewards aren’t compounded automatically, so we show APR')

  const { targetRef, tooltip, tooltipVisible } = useTooltip(tooltipContent, { placement: 'bottom-start' })

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
    />,
  )

  return (
    <Flex alignItems="center" justifyContent="space-between" style={{ marginBottom: '10px' }}>
      {isXl ? (
        <h1>
          {pool.stakingToken.symbol} - {pool.earningToken.symbol}
        </h1>
      ) : (
        <span style={{ fontSize: '10px' }}>
          {pool.stakingToken.symbol} - {pool.earningToken.symbol}
        </span>
      )}
      <AprContent>
        {tooltipVisible && tooltip}
        <TooltipText ref={targetRef}>
          <AprText>
            <h2>{isAutoVault ? `${t('APY')}` : `${t('APR')}`}: </h2>
            <p>&nbsp;{pool.apr && pool.apr.toFixed(2)}%</p>
          </AprText>
        </TooltipText>
        <IconButton onClick={onPresentApyModal} variant="text" scale="sm">
          <CalculateIcon color="textSubtle" width="18px" />
        </IconButton>
        {/* {isFinished || !apr ? (
            <Skeleton width="82px" height="32px" />
          ) : (
            <Flex alignItems="center">
              <Balance
                fontSize="16px"
                isDisabled={isFinished}
                value={earningsPercentageToDisplay}
                decimals={2}
                unit="%"
                bold
              />
              <IconButton onClick={onPresentApyModal} variant="text" scale="sm">
                <CalculateIcon color="textSubtle" width="18px" />
              </IconButton>
            </Flex>
          )} */}
      </AprContent>
    </Flex>
  )
}

export default AprRow
