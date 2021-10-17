import React, { useEffect } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { useModal, Button, Flex, IconButton, Skeleton, Text, TimerIcon, useTooltip, AddIcon, MinusIcon, useMatchBreakpoints } from 'uikit'
import { BASE_BSC_SCAN_URL } from 'config'
import { getBscScanLink } from 'utils'
import { useBlock } from 'state/block/hooks'
import { useCakeVault } from 'state/pools/hooks'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import { Pool } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import Balance from 'components/Balance'
import useToast from 'hooks/useToast'
import { PoolCategory } from 'config/constants/types'
import { getAddress, getCakeVaultAddress } from 'utils/addressHelpers'
// import { registerToken } from 'utils/wallet'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { convertSharesToCake, getPoolBlockInfo } from 'views/Pools/helpers'
import NotEnoughTokensModal from '../../PoolCard/Modals/NotEnoughTokensModal'
import StakeModal from '../../PoolCard/Modals/StakeModal'
import VaultStakeModal from '../../CakeVaultCard/VaultStakeModal'
import { useCheckVaultApprovalStatus } from '../../../hooks/useApprove'
import useHarvestPool from '../../../hooks/useHarvestPool'
// import Apr from '../Apr'

const StyledActionPanel = styled.div<{ expanded: boolean }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: hidden;
  background: #eaf2f7;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 12px;

  & a {
    font-size: 14px;
    line-height: 16px;
    letter-spacing: 0.01em;
    color: #4e4e9d;
    text-decoration: underline;
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    padding: 16px 32px;
  }
`

// const ActionContainer = styled.div`
//   display: flex;
//   flex-direction: column;

//   ${({ theme }) => theme.mediaQueries.sm} {
//     flex-direction: row;
//     align-items: center;
//     flex-grow: 1;
//     flex-basis: 0;
//   }
// `

type MediaBreakpoints = {
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
}

interface ActionPanelProps {
  account: string
  pool: Pool
  userDataLoaded: boolean
  expanded: boolean
  breakpoints: MediaBreakpoints
}

const expandAnimation = keyframes`
  from {
    max-height: 0px;
  }
  to {
    max-height: 500px;
  }
`

const collapseAnimation = keyframes`
  from {
    max-height: 500px;
  }
  to {
    max-height: 0px;
  }
`

const Container = styled.div<{ expanded }>`
  animation: ${({ expanded }) =>
    expanded
      ? css`
          ${expandAnimation} 300ms linear forwards
        `
      : css`
          ${collapseAnimation} 300ms linear forwards
        `};
  overflow: hidden;
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  width: 100%;
  flex-direction: column-reverse;
  padding: 24px;
  background-color: #EAF2F7;

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    padding: 16px 32px;
  }
  flex-wrap: wrap;
  & p,
  & span {
    font-family: UbuntuBold;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #4e4e9d;
  }
`

const StyledLinkExternal = styled.a`
  font-weight: 400;
  color: #4e4e9d;
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 0.01em;
  text-decoration: underline;
  margin-top: 8px;
`

const InfoContainer = styled.div`
  width: 100%;
  flex: 1 0;
`

const BlankSection = styled.div`
  flex: 1 0;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`

const StakedContent = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  flex: 1 0;
  `
const StakedContentArea = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  flex: 1 0;
  `

const IconButtonWrapper = styled.div`
  display: flex;
  width:90px;
  justify-content: space-between;
  & button {
    width: 40px;
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
// const ActionPanel: React.FC<ActionPanelProps> = ({ account, pool, userDataLoaded, expanded, breakpoints }) => {
const ActionPanel: React.FC<ActionPanelProps> = ({ pool, expanded, account }) => {
  const {
    sousId,
    stakingToken,
    earningToken,
    totalStaked,
    startBlock,
    endBlock,
    stakingLimit,
    userData,
    contractAddress,
    earningTokenPrice,
    poolsFees,
    isAutoVault,
  } = pool
  console.log("pool=====111==>", pool)
  const { t } = useTranslation()
  const { isXs, isSm } = useMatchBreakpoints()
  const poolContractAddress = getAddress(contractAddress)
  const cakeVaultContractAddress = getCakeVaultAddress()
  const { currentBlock } = useBlock()
  // const { isXs, isSm, isMd } = breakpoints
  // const showSubtitle = (isXs || isSm) && sousId === 0
  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO
  const stakings = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const earningTokenvalue = getBalanceNumber(stakings, stakingToken.decimals)
  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), earningToken.decimals)
  const stakingTokenDollarBalance = getBalanceNumber(stakings.multipliedBy(earningTokenPrice), stakingToken.decimals)
  const { shouldShowBlockCountdown, blocksUntilStart, blocksRemaining, hasPoolStarted, blocksToDisplay } =
    getPoolBlockInfo(pool, currentBlock)

  // const isMetaMaskInScope = !!window.ethereum?.isMetaMask
  // const tokenAddress = earningToken.address ? getAddress(earningToken.address) : ''

  const {
    totalCakeInVault,
    fees: { performanceFee },
  } = useCakeVault()
  const hasEarnings = account && earnings.gt(0)
  const hasStackings = account && stakings.gt(0)
  // const performanceFeeAsDecimal = performanceFee && performanceFee / 100
  const isManualCakePool = sousId === 0

  const getTotalStakedBalance = () => {
    // if (isAutoVault) {
    //   console.log("totalStaked=====111==>", totalStaked)
    //   return getBalanceNumber(totalCakeInVault, stakingToken.decimals)
    // }
    // if (isManualCakePool) {
    //   const manualCakeTotalMinusAutoVault = new BigNumber(totalStaked).minus(totalCakeInVault)
    //   console.log("totalStaked======222>", totalCakeInVault, manualCakeTotalMinusAutoVault)
    //   return getBalanceNumber(manualCakeTotalMinusAutoVault, stakingToken.decimals)
    // }
    console.log("totalStaked======222=>", totalStaked)
    return getBalanceNumber(totalStaked, stakingToken.decimals)
  }

  // const {
  //   targetRef: totalStakedTargetRef,
  //   tooltip: totalStakedTooltip,
  //   tooltipVisible: totalStakedTooltipVisible,
  // } = useTooltip(t('Total amount of %symbol% staked in this pool', { symbol: stakingToken.symbol }), {
  //   placement: 'bottom',
  // })

  // const manualTooltipText = t('You must harvest and compound your earnings from this pool manually.')
  // const autoTooltipText = t(
  //   'Any funds you stake in this pool will be automagically harvested and restaked (compounded) for you.',
  // )

  // const {
  //   targetRef: tagTargetRef,
  //   tooltip: tagTooltip,
  //   tooltipVisible: tagTooltipVisible,
  // } = useTooltip(isAutoVault ? autoTooltipText : manualTooltipText, {
  //   placement: 'bottom-start',
  // })

  // const { targetRef, tooltip, tooltipVisible } = useTooltip(
  const { targetRef } = useTooltip(t("You've already staked the maximum amount you can stake in this pool!"), {
    placement: 'bottom',
  })

  const maxStakeRow = stakingLimit.gt(0) ? (
    <>
      <p>{t('Max. stake per user')}:</p>
      <p>{`${getFullDisplayBalance(stakingLimit, stakingToken.decimals, 0)} ${stakingToken.symbol} `}</p>
    </>
  ) : null

  const {
    userData: { userShares },
    pricePerFullShare,
  } = useCakeVault()
  const { toastSuccess, toastError } = useToast()
  const isBnbPool = pool.poolCategory === PoolCategory.BINANCE
  const { onReward } = useHarvestPool(sousId, isBnbPool)
  const allowance = userData?.allowance ? new BigNumber(userData.allowance) : BIG_ZERO
  const stakingTokenBalance = pool.userData?.stakingTokenBalance
    ? new BigNumber(pool.userData.stakingTokenBalance)
    : BIG_ZERO
  const { isVaultApproved, setLastUpdated } = useCheckVaultApprovalStatus()
  const { cakeAsBigNumber } = convertSharesToCake(userShares, pricePerFullShare)
  const needsApproval = isAutoVault ? !isVaultApproved : !allowance.gt(0) && !isBnbPool

  const isApproved = account && !needsApproval

  const blocksRow =
    blocksRemaining || blocksUntilStart ? (
      <>
        <p>{hasPoolStarted ? t('Ends in') : t('Starts in')}:</p>
        <p>
          <a
            href={getBscScanLink(hasPoolStarted ? endBlock : startBlock, 'countdown')}
            target="_blank"
            rel="noreferrer"
          >
            <Balance fontSize="16px" value={blocksToDisplay} decimals={0} color="primary" />
            <Text ml="4px" color="primary" textTransform="lowercase">
              {t('Blocks')}
            </Text>
            <TimerIcon ml="4px" color="primary" />
          </a>
        </p>
      </>
    ) : (
      <Skeleton width="56px" height="16px" />
    )

  // const aprRow = (
  //   <Flex justifyContent="space-between" alignItems="center" mb="8px">
  //     <Text>{isAutoVault ? t('APY') : t('APR')}:</Text>
  //     <Apr pool={pool} showIcon performanceFee={isAutoVault ? performanceFeeAsDecimal : 0} />
  //   </Flex>
  // )

  const totalStakedRow = (
    <>
      <p>{t('Total staked:')}</p>
      {totalStaked && totalStaked.gte(0) ? (
        <p>
          <Balance value={getTotalStakedBalance()} decimals={0} />
          {/* <Balance value={getTotalStakedBalance()} decimals={0} unit={` ${stakingToken.symbol} `} /> */}
        </p>
      ) : (
        <Skeleton width="56px" height="16px" />
      )}
      {/* {totalStakedTooltipVisible && totalStakedTooltip} */}
    </>
  )

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


  const [onPresentVaultUnstake] = useModal(<VaultStakeModal stakingMax={cakeAsBigNumber} pool={pool} isRemovingStake />)
  const reachStakingLimit = pool.stakingLimit.gt(0) && pool.userData.stakedBalance.gte(pool.stakingLimit)
  const [onPresentTokenRequired] = useModal(<NotEnoughTokensModal tokenSymbol={stakingToken.symbol} />)

  const onStake = () => {
    if (isAutoVault) {
      onPresentVaultStake()
    } else {
      onPresentStake()
    }
  }

  const onUnstake = () => {
    if (isAutoVault) {
      onPresentVaultUnstake()
    } else {
      onPresentUnstake()
    }
  }

  return (
    <Container expanded={expanded}>
      <BlankSection />
      <InfoContainer>
        <InfoRow>
          {maxStakeRow}
        </InfoRow>
        <InfoRow>
          {totalStakedRow}
        </InfoRow>
        <InfoRow>
          {shouldShowBlockCountdown && blocksRow}
        </InfoRow>
        <InfoRow>
          <p>Stake:</p>
          <p>{stakingToken.symbol}</p>
        </InfoRow>
        <InfoRow>
          <p>Deposit Fees:</p>
          <p>{poolsFees?.depositFeeBP !== undefined ? poolsFees?.depositFeeBP : "0%"}</p>
        </InfoRow>
        <InfoRow>
          <p>Harvest Fees:</p>
          <p>{poolsFees?.harvestFeeBP !== undefined ? poolsFees?.harvestFeeBP : "0%"}</p>
        </InfoRow>
        <InfoRow>
          <p>Staked Value:</p>
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
        </InfoRow>
        <InfoRow>
          <p>Earned Value:</p>
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
        </InfoRow>
        {/* <InfoRow>
          <p>Staked</p>
          <p>0</p>
        </InfoRow> */}

        {poolContractAddress && (
          <Flex justifyContent="center">
            <StyledLinkExternal href={`${BASE_BSC_SCAN_URL}/address/${isAutoVault ? cakeVaultContractAddress : poolContractAddress} `} target="_blank" rel="noreferrer">
              {t('View on BSCSCAN')}
            </StyledLinkExternal>
          </Flex>
        )}
        <Flex justifyContent="center">
          <StyledLinkExternal href={earningToken.projectLink} target="_blank" rel="noreferrer">
            {t('View Project Site')}
          </StyledLinkExternal>
        </Flex>
      </InfoContainer>
      <StakedContent>
        {isApproved && stakings.gt(0) &&
          <StakedContentArea>
            <div>
              <p>{t('Staked')}</p>
              <Balance
                mt="4px"
                bold={!isXs && !isSm}
                fontSize={isXs || isSm ? '14px' : '16px'}
                color={hasStackings ? 'primary' : 'textDisabled'}
                decimals={hasStackings ? 5 : 1}
                value={hasStackings ? earningTokenvalue : 0}
              />
            </div>
            <RoundedButton onClick={async() => {
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
              <IconButton
                style={{
                  background: '#49468A',
                  borderRadius: '16px',
                  width: '40px',
                  height: '39.13px',
                  top: '74.34px',
                  float: 'left',
                }}
                onClick={onUnstake}
              >
                <MinusIcon color="#FFFFFF" width="14px" />
              </IconButton>

              {reachStakingLimit ? (
                <span ref={targetRef}>
                  <IconButton
                    variant="secondary"
                    disabled
                  >
                    <AddIcon color="#FFFFFF" fontSize="18px" />
                  </IconButton>
                </span>
              ) : (
                <IconButton
                  style={{
                    background: '#49468A',
                    borderRadius: '16px',
                    width: '40px',
                    height: '39.13px',
                    top: '74.34px',
                    left: '974px',
                  }}
                  onClick={stakingTokenBalance.gt(0) ? onStake : onPresentTokenRequired}
                  disabled={pool.isFinished}
                >
                  <AddIcon color="#FFFFFF" fontSize="18px" />
                </IconButton>
              )}
            </IconButtonWrapper>
          </StakedContentArea>
        }
      </StakedContent>

      {/* <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
            <a href={`https://pancakeswap.info/token/${getAddress(earningToken.address)}`}>{t('See Token Info')}</a>
          </Flex > * /}
{/* {isAutoVault ? <CompoundingPoolTag /> : <ManualPoolTag />}
          {tagTooltipVisible && tagTooltip}
          <span ref={tagTargetRef}>
            <HelpIcon ml="4px" width="20px" height="20px" color="textSubtle" />
          </span> */}
      {/* {account && isMetaMaskInScope && tokenAddress && (
        <Flex mb="8px" justifyContent={['flex-end', 'flex-end', 'flex-start']}>
          <Button
            variant="text"
            p="0"
            height="auto"
            onClick={() => registerToken(tokenAddress, earningToken.symbol, earningToken.decimals)}
          >
            <Text color="primary">{t('Add to Metamask')}</Text>
            <MetamaskIcon ml="4px" />
          </Button>
        </Flex>
      )} */}
      {/* <ActionContainer>
        {showSubtitle && (
          <Text mt="4px" mb="16px" color="textSubtle">
            {isAutoVault ? t('Automatic restaking') : `${t('Earn')} CAKE ${t('Stake').toLocaleLowerCase()} CAKE`}
          </Text>
        )}
        <Harvest {...pool} userDataLoaded={userDataLoaded} />
        <Stake pool={pool} userDataLoaded={userDataLoaded} />
      </ActionContainer> */}
    </Container >
  )
}

export default ActionPanel
