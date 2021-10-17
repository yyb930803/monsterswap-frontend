import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, useModal, IconButton, AddIcon, MinusIcon, Skeleton, useMatchBreakpoints } from 'uikit'
import { useLocation } from 'react-router-dom'
import ConnectWalletButton from 'components/ConnectWalletButton'
// import Balance from 'components/Balance'
import { useWeb3React } from '@web3-react/core'
import { useFarmUser, useLpTokenPrice } from 'state/farms/hooks'
import { fetchFarmUserDataAsync } from 'state/farms'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import { useTranslation } from 'contexts/Localization'
import { useERC20 } from 'hooks/useContract'
import { getBalanceAmount } from 'utils/formatBalance'
import { BIG_ZERO } from 'utils/bigNumber'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { useAppDispatch } from 'state'
import { getAddress } from 'utils/addressHelpers'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import useUnstakeFarms from '../../../hooks/useUnstakeFarms'
import DepositModal from '../../DepositModal'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useApproveFarm from '../../../hooks/useApproveFarm'
import HarvestButton from '../../FarmCard/HarvestButton'
import { ActionContainer, StakedContent, ActionTitles, ActionContent } from './styles'

interface StackedActionProps extends FarmWithStakedValue {
  userDataReady: boolean
}

const CustomConnectWalletButton = styled(ConnectWalletButton)`
  font-size: 10px;
  ${({ theme }) => theme.mediaQueries.xs} {
    font-size: 10px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 14px;
    padding: 12px 30px;
    width: 200px;
  }
`

const Staked: React.FunctionComponent<StackedActionProps> = ({
  pid,
  lpSymbol,
  lpAddresses,
  quoteToken,
  token,
  userData,
  userDataReady,
}) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const [requestedApproval, setRequestedApproval] = useState(false)

  console.log("lpAddresses", lpAddresses)

  const { allowance, tokenBalance, stakedBalance } = useFarmUser(pid)
  const { onStake } = useStakeFarms(pid)
  const { onUnstake } = useUnstakeFarms(pid)
  const location = useLocation()

  const isApproved = account && allowance && allowance.isGreaterThan(0)

  const lpAddress = getAddress(lpAddresses)
  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: quoteToken.address,
    tokenAddress: token.address,
  })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`

  const handleStake = async (amount: string) => {
    await onStake(amount)
    dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))
  }

  const [onPresentDeposit] = useModal(
    <DepositModal max={tokenBalance} onConfirm={handleStake} tokenName={lpSymbol} addLiquidityUrl={addLiquidityUrl} />,
  )
  const lpContract = useERC20(lpAddress)
  const dispatch = useAppDispatch()
  const { onApprove } = useApproveFarm(lpContract)

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      await onApprove()
      dispatch(fetchFarmUserDataAsync({ account, pids: [pid] }))

      setRequestedApproval(false)
    } catch (e) {
      console.error(e)
    }
  }, [onApprove, dispatch, account, pid])

  const { isXl } = useMatchBreakpoints()
  const isMobile = !isXl
  let earnings = BIG_ZERO
  const earningsBigNumber = new BigNumber(userData.earnings)
  if (!earningsBigNumber.isZero()) {
    earnings = getBalanceAmount(earningsBigNumber)
  }

  if (!account) {
    return (
      <ActionContainer>
        <ActionContent>
          <CustomConnectWalletButton btnText="Unlock Wallet" style={{ padding: '12px 16px', borderRadius: '16px' }} />
        </ActionContent>
      </ActionContainer>
    )
  }

  if (isApproved) {
    if (stakedBalance.gt(0)) {
      return (
        <ActionContainer>{!isMobile && account && <HarvestButton earnings={earnings} pid={pid} />}</ActionContainer>
      )
    }

    return (
      <ActionContainer>
        <ActionContent>
          <Button
            width="100%"
            onClick={onPresentDeposit}
            variant="secondary"
            disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
          >
            {t('Stake lp')}
          </Button>
        </ActionContent>
      </ActionContainer>
    )
  }

  // if (!userDataReady) {
  //   return (
  //     <ActionContainer>
  //       <ActionContent>
  //         <Skeleton width={180} marginBottom={28} marginTop={14} />
  //       </ActionContent>
  //     </ActionContainer>
  //   )
  // }

  return (
    <ActionContainer>
      <ActionContent>
        <Button
          style={{ padding: '10px', borderRadius: '16px' }}
          width="100%"
          disabled={requestedApproval}
          onClick={handleApprove}
          variant="secondary"
        >
          {t('Enable')}
        </Button>
      </ActionContent>
    </ActionContainer>
  )
  // return (
  //   <ActionContainer>
  //     <HarvestButton />
  //   </ActionContainer>
  // )
}

export default Staked
