import React, { useCallback } from 'react'
import { useAppDispatch } from 'state'
import { useLocation } from 'react-router-dom'
import { fetchFarmUserDataAsync } from 'state/farms'
import styled, { keyframes, css } from 'styled-components'
import { useWeb3React } from '@web3-react/core'
import { BigNumber } from 'bignumber.js'
import { useTranslation } from 'contexts/Localization'
import { Flex, IconButton, AddIcon, MinusIcon, useModal } from 'uikit'
import Balance from 'components/Balance'
import { useFarmUser, useLpTokenPrice } from 'state/farms/hooks'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { getBalanceNumber, getBalanceAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { getAddress } from 'utils/addressHelpers'
import { getBscScanLink } from 'utils'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
// import { CommunityTag, CoreTag, DualTag } from 'components/Tags'

// import StakedAction from './StakedAction'
import { AprProps } from '../Apr'
import { MultiplierProps } from '../Multiplier'
import { LiquidityProps } from '../Liquidity'
import WithdrawModal from '../../WithdrawModal'
import DepositModal from '../../DepositModal'
import useStakeFarms from '../../../hooks/useStakeFarms'
import useUnstakeFarms from '../../../hooks/useUnstakeFarms'

export interface ActionPanelProps {
  apr: AprProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
  userDataReady: boolean
  expanded: boolean
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
  align-items: flex-start;

  ${({ theme }) => theme.mediaQueries.lg} {
    flex-direction: row;
    padding: 16px 32px;
  }
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

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 58%;
  }
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

const IconButtonWrapper = styled.div`
  display: flex;
  & button {
    width: 40px;
  }
`

const ActionPanel: React.FunctionComponent<ActionPanelProps> = ({
  details,
  apr,
  multiplier,
  liquidity,
  userDataReady,
  expanded,
}) => {
  const farm = details


  const { t } = useTranslation()
  const isActive = farm.multiplier !== '0X'
  const { quoteToken, token } = farm
  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: farm.quoteToken.address,
    tokenAddress: farm.token.address,
  })
  const { account } = useWeb3React()
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
  const { allowance, tokenBalance, stakedBalance, earnings } = useFarmUser(farm.pid)
  const isApproved = account && allowance && allowance.isGreaterThan(0)
  const lpPrice = useLpTokenPrice(farm.lpSymbol)
  const lpAddress = getAddress(farm.lpAddresses)
  const bsc = getBscScanLink(lpAddress, 'address')
  const { onStake } = useStakeFarms(farm.pid)
  const { onUnstake } = useUnstakeFarms(farm.pid)
  const dispatch = useAppDispatch()
  const location = useLocation()

  const handleStake = async (amount: string) => {
    await onStake(amount)
    dispatch(fetchFarmUserDataAsync({ account, pids: [farm.pid] }))
  }

  console.log("details=====", details)

  const handleUnstake = async (amount: string) => {
    await onUnstake(amount)
    dispatch(fetchFarmUserDataAsync({ account, pids: [farm.pid] }))
  }

  const [onPresentDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      onConfirm={handleStake}
      tokenName={farm.lpSymbol}
      addLiquidityUrl={addLiquidityUrl}
    />,
  )

  const [onPresentWithdraw] = useModal(
    <WithdrawModal max={stakedBalance} onConfirm={handleUnstake} tokenName={farm.lpSymbol} />,
  )

  const displayBalance = useCallback(() => {
    const stakedBalanceBigNumber = getBalanceAmount(stakedBalance)
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0000001)) {
      return stakedBalanceBigNumber.toFixed(10, BigNumber.ROUND_DOWN)
    }
    if (stakedBalanceBigNumber.gt(0) && stakedBalanceBigNumber.lt(0.0001)) {
      return getFullDisplayBalance(stakedBalance).toLocaleString()
    }
    return stakedBalanceBigNumber.toFixed(3, BigNumber.ROUND_DOWN)
  }, [stakedBalance])
  // const info = `/pool/${lpAddress}`

  return (
    <Container expanded={expanded}>
      <InfoContainer>
        <InfoRow>
          <p>Multiplier:</p>
          <p>{details.multiplier}</p>
        </InfoRow>
        <InfoRow>
          <p>Stake:</p>
          <p>{lpLabel}</p>
        </InfoRow>
        <InfoRow>
          <p>Deposit Fees:</p>
          <p>{details.depositFeeBP}</p>
        </InfoRow>
        <InfoRow>
          <p>Harvest Fees:</p>
          <p>{details.harvestFeeBP}</p>
        </InfoRow>
        <InfoRow>
          <p>Staked Value:</p>
          {stakedBalance.gt(0) && lpPrice.gt(0) ? (
            <Balance
              fontSize="12px"
              color="textSubtle"
              decimals={2}
              value={getBalanceNumber(lpPrice.times(stakedBalance))}
              unit=" USD"
              prefix="~"
            />
          ) : (
            <p>0 USD</p>
          )}
        </InfoRow>
        <InfoRow>
          <p>Earned Value:</p>
          {earnings.gt(0) && lpPrice.gt(0) ? (
            <Balance
              fontSize="12px"
              color="textSubtle"
              decimals={2}
              value={getBalanceNumber(lpPrice.times(earnings))}
              unit=" USD"
              prefix="~"
            />
          ) : (
            <p>0 USD</p>
          )}
        </InfoRow>
        {/* {isActive && (
          <StakeContainer>
            <StyledLinkExternal href={`/add/${liquidityUrlPathParts}`}>
              {t('Get %symbol%', { symbol: lpLabel })}
            </StyledLinkExternal>
          </StakeContainer>
        )} */}
        <Flex justifyContent="center">
          <StyledLinkExternal href={bsc} target="_blank">
            {t('View on BSCSCAN')}
          </StyledLinkExternal>
        </Flex>
        {/* <Flex justifyContent="center">
          <StyledLinkExternal href="" target="_blank">
            {t('View Project Site')}
          </StyledLinkExternal>
        </Flex> */}
        {/* <StyledLinkExternal href={info}>{t('See Pair Info')}</StyledLinkExternal> */}
        {/* <TagsContainer>
          {farm.isCommunity ? <CommunityTag /> : <CoreTag />}
          {dual ? <DualTag /> : null}
        </TagsContainer> */}
      </InfoContainer>
      {/* <ValueContainer>
        <ValueWrapper>
          <Text>{t('APR')}</Text>
          <Apr {...apr} />
        </ValueWrapper>
        <ValueWrapper>
          <Text>{t('Multiplier')}</Text>
          <Multiplier {...multiplier} />
        </ValueWrapper>
        <ValueWrapper>
          <Text>{t('Liquidity')}</Text>
          <Liquidity {...liquidity} />
        </ValueWrapper>
      </ValueContainer> */}
      {/* <ActionContainer>
        <StakedAction {...farm} userDataReady={userDataReady} />
      </ActionContainer> */}
      {/* {isApproved && stakedBalance.gt(0) && (
        <StakedContent>
          <div>
            <p>{t('Staked')}</p>
            <p>{displayBalance()}</p>
          </div>
          <IconButtonWrapper>
            <IconButton
              style={{ background: "#49468A",
                        borderRadius: "16px",
                        width: "40px", 
                        height: "39.13px",
                        top: "74.34px",
                        left: "924px" }}
              onClick={onPresentWithdraw} 
              mr="6px"
            >
              <MinusIcon color="#FFFFFF" width="18px" />
            </IconButton>
            <IconButton
              // variant="secondary"
              style={{ background: "#49468A",
                        borderRadius: "16px",
                        width: "40px",
                        height: "39.13px",
                        top: "74.34px",
                        left: "974px" }}
              onClick={onPresentDeposit}
              disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
            >
              <AddIcon color="#FFFFFF" fontSize="18px" />
            </IconButton>
          </IconButtonWrapper>
        </StakedContent>
      )} */}
      {isApproved && stakedBalance.gt(0) &&
        <StakedContent>
          <IconButtonWrapper>
            <div>
              <p>{t('Staked')}</p>
              <p>{displayBalance()}</p>
            </div>
            <IconButton
              style={{
                background: '#49468A',
                borderRadius: '16px',
                width: '40px',
                height: '39.13px',
                top: '74.34px',
                float: 'left',
                marginLeft: '50px',
              }}
              onClick={onPresentWithdraw}
              mr="6px"
            >
              <MinusIcon color="#FFFFFF" width="18px" />
            </IconButton>
            <IconButton
              // variant="secondary"
              style={{
                background: '#49468A',
                borderRadius: '16px',
                width: '40px',
                height: '39.13px',
                top: '74.34px',
                left: '974px',
              }}
              onClick={onPresentDeposit}
              disabled={['history', 'archived'].some((item) => location.pathname.includes(item))}
            >
              <AddIcon color="#FFFFFF" fontSize="18px" />
            </IconButton>
          </IconButtonWrapper>
        </StakedContent>
      }
    </Container>
  )
}

export default ActionPanel
