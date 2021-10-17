import React from 'react'
import styled from 'styled-components'
import { Button, useModal, IconButton, AddIcon, MinusIcon, Skeleton, useTooltip, Flex, Text } from 'uikit'
import BigNumber from 'bignumber.js'
import { BIG_ZERO } from 'utils/bigNumber'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from 'contexts/Localization'
import { ReactComponent as ArrowDown } from 'assets/images/ArrowDown.svg'
import { ReactComponent as ArrowUp } from 'assets/images/ArrowUp.svg'
import { PoolCategory } from 'config/constants/types'
import useToast from 'hooks/useToast'

import { useERC20 } from 'hooks/useContract'
import { getAddress } from 'utils/addressHelpers'
import { getFullDisplayBalance, getBalanceNumber, formatNumber } from 'utils/formatBalance'
import { useCakeVault } from 'state/pools/hooks'
import { convertSharesToCake } from 'views/Pools/helpers'
import useHarvestPool from '../../../hooks/useHarvestPool'
import useStakePool from '../../../hooks/useStakePool'
import BaseCell from './BaseCell'
import NotEnoughTokensModal from '../../PoolCard/Modals/NotEnoughTokensModal'
import StakeModal from '../../PoolCard/Modals/StakeModal'
import CollectModal from '../../PoolCard/Modals/CollectModal'
import VaultStakeModal from '../../CakeVaultCard/VaultStakeModal'
import { useCheckVaultApprovalStatus, useApprovePool, useVaultApprove } from '../../../hooks/useApprove'

interface ExpandActionCellProps {
  expanded: boolean
  account: any
  pool: any
  userDataLoaded: boolean
}

const StyledCell = styled(BaseCell)`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
  padding-right: 12px;
  padding-left: 0px;
  & button {
    background: #49468A;
    height: 40px;
    margin-right: 10px;
    font-size: 14px;
  }
  ${({ theme }) => theme.mediaQueries.md} {
    flex: 1 0 150px;
    padding-right: 32px;
    padding-left: 8px;
  }
`

const TotalStakedCell: React.FC<ExpandActionCellProps> = ({ expanded, account, pool, userDataLoaded }) => {
  // const { t } = useTranslation()
  // const { isVaultApproved } = useCheckVaultApprovalStatus()
  // const isBnbPool = pool.poolCategory === PoolCategory.BINANCE
  // const allowance = pool.userData?.allowance ? new BigNumber(pool.userData.allowance) : BIG_ZERO
  // const needsApproval = pool.isAutoVault ? !isVaultApproved : !allowance.gt(0) && !isBnbPool


  const {
    earningTokenPrice,
    sousId,
    stakingToken,
    earningToken,
    stakingLimit,
    isFinished,
    poolCategory,
    userData,
    stakingTokenPrice,
    isAutoVault,
  } = pool
  const { t } = useTranslation()

  const stakingTokenContract = useERC20(stakingToken.address ? getAddress(stakingToken.address) : '')
  const { handleApprove: handlePoolApprove, requestedApproval: requestedPoolApproval } = useApprovePool(
    stakingTokenContract,
    sousId,
    earningToken.symbol,
  )
  const earnings = userData?.pendingReward ? new BigNumber(userData.pendingReward) : BIG_ZERO
  const earningTokenBalance = getBalanceNumber(earnings, earningToken.decimals)
  const formattedBalance = formatNumber(earningTokenBalance, 3, 3)

  const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), earningToken.decimals)

  const fullBalance = getFullDisplayBalance(earnings, earningToken.decimals)
  const hasEarnings = earnings.toNumber() > 0
  const isCompoundPool = sousId === 0
  const { toastSuccess, toastError } = useToast()
  const { isVaultApproved, setLastUpdated } = useCheckVaultApprovalStatus()
  const { handleApprove: handleVaultApprove, requestedApproval: requestedVaultApproval } =
    useVaultApprove(setLastUpdated)

  const handleApprove = isAutoVault ? handleVaultApprove : handlePoolApprove
  const requestedApproval = isAutoVault ? requestedVaultApproval : requestedPoolApproval

  const isBnbPool = poolCategory === PoolCategory.BINANCE
  const allowance = userData?.allowance ? new BigNumber(userData.allowance) : BIG_ZERO
  const stakedBalance = userData?.stakedBalance ? new BigNumber(userData.stakedBalance) : BIG_ZERO
  const isNotVaultAndHasStake = !isAutoVault && stakedBalance.gt(0)

  const stakingTokenBalance = userData?.stakingTokenBalance ? new BigNumber(userData.stakingTokenBalance) : BIG_ZERO

  const stakedTokenBalance = getBalanceNumber(stakedBalance, stakingToken.decimals)
  const stakedTokenDollarBalance = getBalanceNumber(
    stakedBalance.multipliedBy(stakingTokenPrice),
    stakingToken.decimals,
  )

  const { onReward } = useHarvestPool(sousId, isBnbPool)
  const { onStake } = useStakePool(sousId, isBnbPool)

  const {
    userData: { userShares },
    pricePerFullShare,
  } = useCakeVault()

  const { cakeAsBigNumber, cakeAsNumberBalance } = convertSharesToCake(userShares, pricePerFullShare)
  const hasSharesStaked = userShares && userShares.gt(0)
  const isVaultWithShares = isAutoVault && hasSharesStaked
  const stakedAutoDollarValue = getBalanceNumber(cakeAsBigNumber.multipliedBy(stakingTokenPrice), stakingToken.decimals)

  const needsApproval = isAutoVault ? !isVaultApproved : !allowance.gt(0) && !isBnbPool

  const [onPresentTokenRequired] = useModal(<NotEnoughTokensModal tokenSymbol={stakingToken.symbol} />)

  // const [onPresentCollect] = useModal(
  //   <CollectModal
  //     formattedBalance={formattedBalance}
  //     fullBalance={fullBalance}
  //     earningToken={earningToken}
  //     earningsDollarValue={earningTokenDollarBalance}
  //     sousId={sousId}
  //     isBnbPool={isBnbPool}
  //     isCompoundPool={isCompoundPool}
  //   />,
  // )

  const onPresentCollect = async (event: React.MouseEvent<HTMLElement>) => {
    try {
      event.stopPropagation()
      await onStake(fullBalance, earningToken.decimals)
      toastSuccess(
        `${t('Compounded')}!`,
        t('Your %symbol% earnings have been re-invested into the pool!', { symbol: earningToken.symbol }),
      )
    } catch (e) {
      toastError(t('Error'), t('Please try again. Confirm the transaction and make sure you are paying enough gas!'))
      console.error(e)
    }
  }


  const [onPresentStake] = useModal(
    <StakeModal
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenBalance={stakingTokenBalance}
      stakingTokenPrice={stakingTokenPrice}
    />,
  )

  const [onPresentVaultStake] = useModal(<VaultStakeModal stakingMax={stakingTokenBalance} pool={pool} />)

  const [onPresentUnstake] = useModal(
    <StakeModal
      stakingTokenBalance={stakingTokenBalance}
      isBnbPool={isBnbPool}
      pool={pool}
      stakingTokenPrice={stakingTokenPrice}
      isRemovingStake
    />,
  )

  const [onPresentVaultUnstake] = useModal(<VaultStakeModal stakingMax={cakeAsBigNumber} pool={pool} isRemovingStake />)

  const onStakeHandler = () => {
    console.log("needsApproval--->", needsApproval, isNotVaultAndHasStake, isVaultWithShares)
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
  // const actionButtons = () => (
  //   <>
  //     {account ?
  //       needsApproval ?
  //         <Button disabled={requestedApproval} onClick={handleApprove}>{t('Enable')}</Button>
  //         :
  //         <Button>{t('Compound')}</Button>
  //       :
  //       <ConnectWalletButton width="100%" />
  //     }
  //   </>
  // )
  // return (
  //   <StyledCell role="cell">
  //     {actionButtons()}
  //     {expanded ? <ArrowUp /> : <ArrowDown />}
  //   </StyledCell>
  // )
  if (account === undefined) {
    return (
      <StyledCell role="cell">
        <ConnectWalletButton width="100%" />
        {expanded ? <ArrowUp /> : <ArrowDown />}
      </StyledCell>
    )
  }
  if (needsApproval) {
    return (
      <StyledCell role="cell">
        <Button disabled={requestedApproval} onClick={handleApprove}>{t('Enable')}</Button>
        {expanded ? <ArrowUp /> : <ArrowDown />}
      </StyledCell>
    )
  }
  if (isNotVaultAndHasStake || isVaultWithShares) {
    return (
      <StyledCell role="cell">
        <Button onClick={onPresentCollect}>{t('Compound')}</Button>
        {expanded ? <ArrowUp /> : <ArrowDown />}
      </StyledCell>
    )
  }
  return (
    <StyledCell role="cell">
      <Button
        onClick={stakingTokenBalance.gt(0) ? onStakeHandler : onPresentTokenRequired}
        disabled={isFinished}
      >
        {t('Stake MON')}
      </Button>
      {expanded ? <ArrowUp /> : <ArrowDown />}
    </StyledCell>

  )
}

export default TotalStakedCell
