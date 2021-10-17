import React from 'react'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { useTranslation } from 'contexts/Localization'
import { useModal, Flex, Text, TooltipText, Heading, TimerIcon, Skeleton, useTooltip, Button, AddIcon, MinusIcon, IconButton, useMatchBreakpoints } from 'uikit'
import { BASE_BSC_SCAN_URL } from 'config'
import { useBlock } from 'state/block/hooks'
import { useCakeVault } from 'state/pools/hooks'
import useToast from 'hooks/useToast'
import { Pool } from 'state/types'
import { BIG_ZERO } from 'utils/bigNumber'
import { PoolCategory } from 'config/constants/types'
import { getAddress, getCakeVaultAddress } from 'utils/addressHelpers'
// import { registerToken } from 'utils/wallet'
import { getBscScanLink } from 'utils'
import { convertSharesToCake, getPoolBlockInfo } from 'views/Pools/helpers'
import Balance from 'components/Balance'
import StakeModal from '../Modals/StakeModal'
import VaultStakeModal from '../../CakeVaultCard/VaultStakeModal'
import NotEnoughTokensModal from '../Modals/NotEnoughTokensModal'
import { useCheckVaultApprovalStatus, useApprovePool, useVaultApprove } from '../../../hooks/useApprove'
import useHarvestPool from '../../../hooks/useHarvestPool'

interface ExpandedFooterProps {
  pool: Pool
  account: string
  userDataLoaded: boolean
}

const ExpandedWrapper = styled(Flex)`
  padding: 16px !important;
  svg {
    height: 14px;
    width: 14px;
  }
  & a {
    font-size: 14px;
    color: #4e4e9d;
    letter-spacing: 0.01em;
    text-decoration: underline;
    margin-top: 8px;
  }

  & p {
    font-family: UbuntuBold;
    font-weight: 500;
  }
`

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  & p,
  & span {
    font-size: 14px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #4e4e9d;
  }
`

const StakedActionArea = styled(Flex)`
  gap: 5px;
  & p {
    color: #4e4e9d;
    font-family: Ubuntu;
    font-weight: 700;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    gap: 15px;
  }
`
const IconButtonWrapper = styled.div`
  display: flex;
  width:100px;
  justify-content:space-between;
  svg {
    width: 20px;
  }
`
const RoundedButton = styled(Button)`
  border-radius: 16px;
  font-size: 10px !important;
  padding: 12px 16px;

  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 14px !important;
  }
`

const ExpandedFooter: React.FC<ExpandedFooterProps> = ({ pool, account, userDataLoaded }) => {
  const { t } = useTranslation()
  const { currentBlock } = useBlock()
  const {
    totalCakeInVault,
    fees: { performanceFee, callFee, withdrawalFee, withdrawalFeePeriod },
  } = useCakeVault()

  const {
    stakingToken,
    earningToken,
    totalStaked,
    startBlock,
    endBlock,
    stakingLimit,
    contractAddress,
    sousId,
    userData,
    isAutoVault,
    poolsFees,
    earningTokenPrice
  } = pool

  // const tokenAddress = earningToken.address ? getAddress(earningToken.address) : ''
  const poolContractAddress = getAddress(contractAddress)
  const cakeVaultContractAddress = getCakeVaultAddress()
  // const isMetaMaskInScope = !!window.ethereum?.isMetaMask
  const isManualCakePool = sousId === 0
  const { isXs, isSm } = useMatchBreakpoints()
  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getPoolBlockInfo(pool, currentBlock)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t('Subtracted automatically from each yield harvest and burned.'),
    { placement: 'bottom-start' },
  )
  const { toastSuccess, toastError } = useToast()
  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO
  const stakings = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const earningTokenvalue = getBalanceNumber(stakings, stakingToken.decimals)
  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), earningToken.decimals)
  const isBnbPool = pool.poolCategory === PoolCategory.BINANCE
  const stakingTokenDollarBalance = getBalanceNumber(stakings.multipliedBy(earningTokenPrice), stakingToken.decimals)
  const { onReward } = useHarvestPool(sousId, isBnbPool)
  const { isVaultApproved, setLastUpdated } = useCheckVaultApprovalStatus()
  const allowance = userData?.allowance ? new BigNumber(userData.allowance) : BIG_ZERO
  const needsApproval = isAutoVault ? !isVaultApproved : !allowance.gt(0) && !isBnbPool
  const isApproved = account && !needsApproval

  const getTotalStakedBalance = () => {
    // if (isAutoVault) {
    //   return getBalanceNumber(totalCakeInVault, stakingToken.decimals)
    // }
    // if (isManualCakePool) {
    //   const manualCakeTotalMinusAutoVault = new BigNumber(totalStaked).minus(totalCakeInVault)
    //   return getBalanceNumber(manualCakeTotalMinusAutoVault, stakingToken.decimals)
    // }
    return getBalanceNumber(totalStaked, stakingToken.decimals)
  }

  const {
    targetRef: totalStakedTargetRef,
    tooltip: totalStakedTooltip,
    tooltipVisible: totalStakedTooltipVisible,
  } = useTooltip(t('Total amount of %symbol% staked in this pool', { symbol: stakingToken.symbol }), {
    placement: 'bottom',
  })


  const totalStakedRow = (
    <>
      <p>{t('Total staked:')}</p>
      {totalStaked && totalStaked.gte(0) ? (
        <p>
          <Balance value={getTotalStakedBalance()} decimals={0} unit={` ${stakingToken.symbol}`} />
        </p>
      ) : (
        <Skeleton width="56px" height="16px" />
      )}
      {/* {totalStakedTooltipVisible && totalStakedTooltip} */}
    </>
  )

  const {
    userData: { userShares },
    pricePerFullShare,
  } = useCakeVault()
  const hasEarnings = account && earnings.gt(0)
  const hasStackings = account && stakings.gt(0)
  const stakingTokenBalance = pool.userData?.stakingTokenBalance
    ? new BigNumber(pool.userData.stakingTokenBalance)
    : BIG_ZERO
  const { cakeAsBigNumber } = convertSharesToCake(userShares, pricePerFullShare)

  const [onPresentStake] = useModal(
    <StakeModal
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenBalance={stakingTokenBalance}
      stakingTokenPrice={pool.stakingTokenPrice}
    />,
  )

  const [onPresentVaultStake] = useModal(<VaultStakeModal stakingMax={stakingTokenBalance} pool={pool} />)

  const [onPresentUnstake] = useModal(
    <StakeModal
      stakingTokenBalance={stakingTokenBalance}
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenPrice={pool.stakingTokenPrice}
      isRemovingStake
    />,
  )

  console.log("pool=========+++=", pool)

  const [onPresentVaultUnstake] = useModal(<VaultStakeModal stakingMax={cakeAsBigNumber} pool={pool} isRemovingStake />)
  const reachStakingLimit = pool.stakingLimit.gt(0) && pool.userData.stakedBalance.gte(pool.stakingLimit)
  const [onPresentTokenRequired] = useModal(<NotEnoughTokensModal tokenSymbol={stakingToken.symbol} />)

  const onUnstake = () => {
    if (isAutoVault) {
      onPresentVaultUnstake()
    } else {
      onPresentUnstake()
    }
  }

  const onStake = () => {
    if (isAutoVault) {
      onPresentVaultStake()
    } else {
      onPresentStake()
    }
  }

  return (
    <ExpandedWrapper flexDirection="column">
      {isApproved && stakings.gt(0) &&
        <StakedActionArea alignItems="center" justifyContent="space-between">
          <Flex flexDirection="column" alignItems="flex-start">
            <p>{userData.stakedBalance.eq(0) && t('Monster Earned')}</p>
            <p>{userData.stakedBalance.gt(0) && t('Staked')}</p>
            <Balance
              mt="4px"
              bold={!isXs && !isSm}
              fontSize={isXs || isSm ? '14px' : '16px'}
              color={hasStackings ? 'primary' : 'textDisabled'}
              decimals={hasStackings ? 5 : 1}
              value={hasStackings ? earningTokenvalue : 0}
            />
          </Flex>
          <RoundedButton onClick={async () => {
            try {
              await onReward()
              toastSuccess(
                `${t('Harvested')}!`,
                t('Your %symbol% earnings have been sent to your wallet!', { symbol: earningToken.symbol }),
              )
            } catch (e) {
              toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
            }
          }}>{t('Harvest')}</RoundedButton>
          <IconButtonWrapper>
            <IconButton onClick={onUnstake}>
              <MinusIcon color="#FFFFFF" />
            </IconButton>
            <IconButton onClick={stakingTokenBalance.gt(0) ? onStake : onPresentTokenRequired}
              disabled={pool.isFinished}>
              <AddIcon color="#FFFFFF" />
            </IconButton>
          </IconButtonWrapper>
        </StakedActionArea>
      }

      <FooterRow>
        <p>{t('Total staked')}:</p>
        <Flex alignItems="flex-start">
          {totalStaked && totalStaked.gte(0) ? (
            <>
              <Balance small value={getTotalStakedBalance()} decimals={0} />
              {/* <Balance small value={getTotalStakedBalance()} decimals={0} unit={` ${stakingToken.symbol}`} /> */}
              {/* <span ref={totalStakedTargetRef}>
                <HelpIcon color="textSubtle" width="20px" ml="6px" mt="4px" />
              </span> */}
            </>
          ) : (
            <Skeleton width="90px" height="21px" />
          )}
          {totalStakedTooltipVisible && totalStakedTooltip}
        </Flex>
      </FooterRow>
      <FooterRow>
        <p>{t('Stake')}:</p>
        <p>{pool.stakingToken.symbol}</p>
      </FooterRow>
      <FooterRow>
        <p>{t('Deposit Fees')}:</p>
        <p>{poolsFees?.depositFeeBP !== undefined ? poolsFees?.depositFeeBP : "0%"}</p>
      </FooterRow>
      <FooterRow>
        <p>{t('Harvest Fees')}:</p>
        <p>{poolsFees?.harvestFeeBP !== undefined ? poolsFees?.harvestFeeBP : "0%"}</p>
      </FooterRow>
      <FooterRow>
        <p>{t('Staked Value')}:</p>
        {hasStackings ? (
          <>
            {earningTokenPrice > 0 && (
              <Balance
                display="inline"
                fontSize="12px"
                color="textSubtle"
                decimals={2}
                prefix="~"
                value={stakingTokenDollarBalance}
                unit=" USD"
              />
            )}
          </>
        ) : (
          <Text mt="4px" fontSize="12px" color="textDisabled">
            0 USD
          </Text>
        )}
      </FooterRow>
      <FooterRow>
        <p>{t('Earned Value')}:</p>
        {hasEarnings ? (
          <>
            {earningTokenPrice > 0 && (
              <Balance
                display="inline"
                fontSize="12px"
                color="textSubtle"
                decimals={2}
                prefix="~"
                value={earningTokenDollarBalance}
                unit=" USD"
              />
            )}
          </>
        ) : (
          <Text mt="4px" fontSize="12px" color="textDisabled">
            0 USD
          </Text>
        )}
      </FooterRow>
      {stakingLimit && stakingLimit.gt(0) && (
        <FooterRow>
          <p>{t('Max. stake per user')}:</p>
          <p>{`${getFullDisplayBalance(stakingLimit, stakingToken.decimals, 0)} ${stakingToken.symbol}`}</p>
        </FooterRow>
      )}
      {shouldShowBlockCountdown && (
        <FooterRow>
          <p>{hasPoolStarted ? t('Ends in') : t('Starts in')}:</p>
          {blocksRemaining || blocksUntilStart ? (
            <Flex alignItems="center">
              <a
                href={getBscScanLink(hasPoolStarted ? endBlock : startBlock, 'countdown')}
                target="_blank"
                rel="noreferrer"
              >
                <Balance small value={blocksToDisplay} decimals={0} color="primary" />
                <Text small ml="4px" color="primary" textTransform="lowercase">
                  {t('Blocks')}
                </Text>
                <TimerIcon ml="4px" color="primary" />
              </a>
            </Flex>
          ) : (
            <Skeleton width="54px" height="21px" />
          )}
        </FooterRow>
      )}
      {isAutoVault && (
        <FooterRow>
          {tooltipVisible && tooltip}
          <TooltipText ref={targetRef} small>
            {t('Performance Fee')}
          </TooltipText>
          <p>{performanceFee / 100}%</p>
        </FooterRow>
      )}
      <Flex justifyContent="center">
        <a href={`${BASE_BSC_SCAN_URL}/address/${isAutoVault ? cakeVaultContractAddress : poolContractAddress} `} target="_blank" rel="noreferrer">
          {t('View on Bscscan')}
        </a>
      </Flex>
      <Flex justifyContent="center">
        <a href={earningToken.projectLink} target="_blank" rel="noreferrer">
          {t('View Project Site')}
        </a>
      </Flex>
      {/* {poolContractAddress && (
        <Flex justifyContent='center'>
          <a href={`${BASE_BSC_SCAN_URL}/address/${isAutoVault ? cakeVaultContractAddress : poolContractAddress}`} target='_blank' rel='noreferrer'>
            {t('View Contract')}
          </a>
        </Flex>
      )} */}
      {/* {account && isMetaMaskInScope && tokenAddress && (
        <Flex justifyContent="flex-end">
          <Button
            variant="text"
            p="0"
            height="auto"
            onClick={() => registerToken(tokenAddress, earningToken.symbol, earningToken.decimals)}
          >
            <Text color="primary" fontSize="14px">
              {t('Add to Metamask')}
            </Text>
            <MetamaskIcon ml="4px" />
          </Button>
        </Flex>
      )} */}
    </ExpandedWrapper>
  )
}

export default React.memo(ExpandedFooter)
