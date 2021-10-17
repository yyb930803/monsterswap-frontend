import React, { useState } from 'react'
import BigNumber from 'bignumber.js'
import styled, { keyframes } from 'styled-components'
import { Farm } from 'state/types'
import { getBscScanLink } from 'utils'
import { NFTImage, useMatchBreakpoints } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { ReactComponent as ArrowDown } from 'assets/images/ArrowDown.svg'
import { ReactComponent as ArrowUp } from 'assets/images/ArrowUp.svg'
import { TokenPairImage } from 'components/TokenImage'
import { BASE_ADD_LIQUIDITY_URL } from 'config'
import { getAddress } from 'utils/addressHelpers'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import DetailsSection from './DetailsSection'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'
import { ViewMode } from '../types'

export interface FarmWithStakedValue extends Farm {
  apr?: number
  lpRewardsApr?: number
  liquidity?: BigNumber
}

const AccentGradient = keyframes`  
  0% {
    background-position: 50% 0%;
  }
  50% {
    background-position: 50% 100%;
  }
  100% {
    background-position: 50% 0%;
  }
`

const StyledCardAccent = styled.div`
  background: white;
  background-size: 400% 400%;
  animation: ${AccentGradient} 2s linear infinite;
  border-radius: 10px;
  position: absolute;
  top: -1px;
  right: -1px;
  bottom: -3px;
  left: -1px;
  z-index: -1;
`

const FCard = styled.div<{ isPromotedFarm: boolean }>`
  align-self: baseline;
  background: ${(props) => props.theme.card.background};
  border-radius: 10px;
  box-shadow: 0px 1px 4px rgba(25, 19, 38, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  position: relative;
  text-align: center;
  background-color: #EAF2F7;
`

// const Divider = styled.div`
//   background-color: ${({ theme }) => theme.colors.cardBorder};
//   height: 1px;
//   margin: 28px auto;
//   width: 100%;
// `

const ExpandingWrapper = styled.div<{ expanded: boolean }>`
  height: ${(props) => (props.expanded ? '100%' : '0px')};
  overflow: hidden;
  padding: 0 24px;
`

const CardTop = styled.div`
  display: flex;
  max-height: 109px;
`

const CardInfoContainer = styled.div`
  flex: 1;
  margin-left: 10px;
  padding: 10px;
  & h1 {
    font-size: 18px;
    color: #4e4e9d;
    letter-spacing: 0.01em;
  }
  & h2 {
    font-family: 'Red Hat Text', sans-serif;
    font-weight: bold;
    font-size: 18px;
    line-height: 24px;
    letter-spacing: 0.01em;
    color: #4e4e9d;
    display: flex;
    align-items: center;
    & span {
      font-family: 'Red Hat Text', sans-serif;
      font-weight: normal;
      font-size: 18px;
      line-height: 24px;
      letter-spacing: 0.01em;
      color: #4e4e9d;
    }
  }
  & p {
    font-family: 'Red Hat Text', sans-serif;
    font-size: 14px;
    line-height: 19px;
    letter-spacing: 0.01em;
    color: #4e4e9d;
  }
`

const CardInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  font-size: 10px;
`

const ArrowContainer = styled.div`
  margin-left: 12px;
  position: absolute;
  right: 0;
  top: 28px;
  cursor: pointer;
`

const CellInner = styled.div`
  border-radius: 10px 0 0 10px;
  background-color: #FCF5D8;
  background-image: url('/images/farms/tree.svg');
  background-repeat: no-repeat;
  background-position: bottom;
  min-width: 109px;
  display: flex;
  justify-content: center;
  gap: 5px;
  align-items: center;
`

const ListImageWrapper = styled.div`
  position: relative;
`

const NFTImageWrapper = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
  align-items: center;
  width: 100%;
`
const SpanElement = styled.span`
  font-size: 12px;
  color: #4e4e9d;
  letter-spacing: 0.01em;
`
interface FarmCardProps {
  farm: FarmWithStakedValue
  displayApr: string
  removed: boolean
  cakePrice?: BigNumber
  account?: string
  viewMode?: string
  userDataReady: boolean
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, displayApr, removed, cakePrice, account, userDataReady, viewMode }) => {
  const { t } = useTranslation()
  const { isXs, isSm, isMd, isLg, isXl } = useMatchBreakpoints()
  const isMobile = !isXl
  const [showExpandableSection, setShowExpandableSection] = useState(false)

  const totalValueFormatted =
    farm.liquidity && farm.liquidity.gt(0)
      ? `$${farm.liquidity.toNumber().toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : ''

  const lpLabel = farm.lpSymbol && farm.lpSymbol.toUpperCase().replace('PANCAKE', '')
  // const earnLabel = farm.dual ? farm.dual.earnLabel : t('CAKE + Fees')

  const liquidityUrlPathParts = getLiquidityUrlPathParts({
    quoteTokenAddress: farm.quoteToken.address,
    tokenAddress: farm.token.address,
  })
  const addLiquidityUrl = `${BASE_ADD_LIQUIDITY_URL}/${liquidityUrlPathParts}`
  const lpAddress = getAddress(farm.lpAddresses)
  const isPromotedFarm = farm.token.symbol === 'CAKE'

  return (
    <FCard isPromotedFarm={isPromotedFarm}>
      {isPromotedFarm && <StyledCardAccent />}
      <CardTop>
        {!isMobile ?
          <CellInner>
            <NFTImageWrapper>
              <NFTImage {...farm} list />
            </NFTImageWrapper>
          </CellInner>
          : null}
        <CardInfoContainer>
          <CardInfoRow>
            {isMobile ?
              <>
                <SpanElement>{lpLabel.split(' ')[0]}</SpanElement>
                {!removed && (
                  <SpanElement>
                    {/* <span>APR:</span> {displayApr}% */}
                    <SpanElement>APR:</SpanElement> <SpanElement style={{ fontFamily: "Ubuntu" }}>{displayApr}%</SpanElement>
                    <ApyButton
                      lpLabel={lpLabel}
                      addLiquidityUrl={addLiquidityUrl}
                      cakePrice={cakePrice}
                      apr={farm.apr}
                      displayApr={displayApr}
                    />
                  </SpanElement>
                )}
              </>
              :
              <>
                <h1>{lpLabel.split(' ')[0]}</h1>
                {!removed && (
                  <h2>
                    {/* <span>APR:</span> {displayApr}% */}
                    <span>APR:</span> <h2 style={{ fontFamily: "Ubuntu" }}>{displayApr}%</h2>
                    <ApyButton
                      lpLabel={lpLabel}
                      addLiquidityUrl={addLiquidityUrl}
                      cakePrice={cakePrice}
                      apr={farm.apr}
                      displayApr={displayApr}
                    />
                  </h2>
                )}
              </>
            }

          </CardInfoRow>
          <CardInfoRow>
            <div style={{ paddingRight: 32, width: '100%' }}>
              <CardActionsContainer
                expanded={showExpandableSection}
                farm={farm}
                account={account}
                addLiquidityUrl={addLiquidityUrl}
              />
            </div>
            <ArrowContainer onClick={() => setShowExpandableSection(!showExpandableSection)}>
              {showExpandableSection ? <ArrowUp /> : <ArrowDown />}
            </ArrowContainer>
          </CardInfoRow>
        </CardInfoContainer>
      </CardTop>
      {/* <CardHeading
        lpLabel={lpLabel}
        multiplier={farm.multiplier}
        isCommunityFarm={farm.isCommunity}
        token={farm.token}
        quoteToken={farm.quoteToken}
      /> */}
      {/* {!removed && (
        <Flex justifyContent="space-between" alignItems="center">
          <Text>{t('APR')}:</Text>
          <Text bold style={{ display: 'flex', alignItems: 'center' }}>
            {farm.apr ? (
              <>
                <ApyButton
                  lpLabel={lpLabel}
                  addLiquidityUrl={addLiquidityUrl}
                  cakePrice={cakePrice}
                  apr={farm.apr}
                  displayApr={displayApr}
                />
                {displayApr}%
              </>
            ) : (
              <Skeleton height={24} width={80} />
            )}
          </Text>
        </Flex>
      )}
      <Flex justifyContent="space-between">
        <Text>{t('Earn')}:</Text>
        <Text bold>{earnLabel}</Text>
      </Flex> */}
      <ExpandingWrapper expanded={showExpandableSection}>
        <DetailsSection
          removed={removed}
          bscScanAddress={getBscScanLink(lpAddress, 'address')}
          infoAddress={`https://monsterswap.info/pool/${lpAddress}`}
          totalValueFormatted={totalValueFormatted}
          lpLabel={lpLabel}
          addLiquidityUrl={addLiquidityUrl}
          details={farm}
        />
      </ExpandingWrapper>
    </FCard>
  )
}

export default FarmCard
