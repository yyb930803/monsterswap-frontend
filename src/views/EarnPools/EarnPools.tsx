import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Route, useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { Image, Checkbox, RowType, Text, Flex, useMatchBreakpoints } from 'uikit'
import { ChainId } from 'monsterswaptestsdk'
import styled from 'styled-components'
import Page from 'components/Layout/Page'
import { useFarms, usePollFarmsData, usePriceCakeBusd } from 'state/farms/hooks'
import usePersistState from 'hooks/usePersistState'
import { Farm } from 'state/types'
import { useTranslation } from 'contexts/Localization'
import { getBalanceNumber } from 'utils/formatBalance'
import { getFarmApr } from 'utils/apr'
import { orderBy } from 'lodash'
import isArchivedPid from 'utils/farmHelpers'
import { latinise } from 'utils/latinise'
import SearchInput from 'components/SearchInput'
import { OptionProps } from 'components/Select/Select'
import Loading from 'components/Loading'
import { ReactComponent as WhiteArrowDown } from 'assets/images/WhiteArrowDown.svg'
// import FarmBanner from 'assets/images/farms/bg-hero-farms.svg'
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard'
import Table from './components/FarmTable/FarmTable'
import FarmTabButtons from './components/FarmTabButtons'
import { RowProps } from './components/FarmTable/Row'
import ToggleView from './components/ToggleView/ToggleView'
import { DesktopColumnSchema, ViewMode } from './components/types'
import { PoolsHeader } from '../../components/App'

const orderDec = "/images/arrowImage.png";
const orderAsc = "/images/anti-arrow.png";

const PoolsBanner = styled.div`
  height: 300px;
  background-image: url(/images/pools/bg-hero-pools.svg);
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;

  @media (max-width: 2560px) {
    height: 350px;
  }

  // width: 100%;
  // min-height: 211px;
  // > div {
  //   width: 100%;
  //   max-width: 100%;
  //   height: 300px;
  //   > img {
  //     width: 100%;
  //     height: 100%;
  //     object-fit: cover;
  //   }
  //   &::after {
  //     padding-top: 0;
  //   }
  // }

  @media (max-width: 767.98px) {
    height: 200px;
  }
`


const ControlContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  position: relative;
  background: white;
  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.04);
  border-radius: 50px;

  justify-content: space-between;
  flex-direction: column;
  margin-bottom: 32px;

  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    flex-wrap: wrap;
    padding: 12px 16px;
    margin-bottom: 0;
  }

  @media (max-width: 767.98px) {
    padding: 10px 10px;
    ${({ theme }) => theme.mediaQueries.xs} {
      font-size: 10px;
      padding: 20px 30px;
    }
    ${({ theme }) => theme.mediaQueries.sm} {
      font-size: 14px;
      padding: 20px 30px;
    }
    border-radius: 30px;
    margin-top: -80px;

    & > div {
      flex-wrap: nowrap;
    }
    & > div:nth-child(1) > div {
      margin-left: 0;
    }

    > div:nth-child(2) > div > div > a,
    > div:nth-child(2) > div > div > span > a,
    > div:nth-child(2) > div:nth-child(2) > div > div {
      font-size: 12px !important;
    }
  }
`

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 10px;

  ${Text} {
    margin-left: 8px;
  }
`

const LabelWrapper = styled.div`
  > ${Text} {
    font-size: 12px;
    font-family: Ubuntu;
  }
  margin-left: 16px;

  @media (max-width: 767.98px) {
    margin-left: 0;
  }
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 0px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: auto;
    padding: 0;
  }
`

const ViewControls = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  display: flex;
  align-items: center;
  width: 100%;

  > div {
    padding: 8px 0px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
    width: auto;

    > div {
      padding: 0;
    }
  }
  @media (max-width: 767.98px) {
    &:nth-child(1) {
      margin-bottom: 20px;
    }
    > div {
      padding: 0;
    }
    > div > a,
    > div > span > a,
    > div > div {
      font-size: 12px !important;
    }
  }
`

const FarmsBanner = styled.div`
  width: 100%;
  background-color: #acb0d3;
  background-size: cover;
  background-position: top center;
  > div {
    width: 100%;
    max-width: 100%;
    @media (max-width: 2560px) {
      height: 400px;
    }
    @media (max-width: 1920px) {
      height: 270px;
    }
    @media (max-width: 1330px) {
      height: 180px;
    }
    height: 213px;
    > img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    &::after {
      padding-top: 0;
    }
  }

  @media (max-width: 767.98px) {
    min-height: 200px;
    > div {
      height: 200px;

      > img {
      }
    }
  }
`

const FarmHead = styled.div`
  background: white;
  box-shadow: 0px 1px 10px rgba(0, 0, 0, 0.05);
  border-radius: 70px;
  padding: 8px 12px;
  margin-top: 16px;

  & table {
    width: 100%;
    & td {
      font-size: 10px;
      text-align: center;
      line-height: 16px;
      letter-spacing: 0.04em;
      color: #464486;
      ${({ theme }) => theme.mediaQueries.md} {
        font-size: 14px;
      }
    }

    & div {
      ${({ theme }) => theme.mediaQueries.md} {
        font-size: 14px;
      }
      font-size: 10px;
    }
  }

  @media (max-width: 767.98px) {
    & table {
      & > div {
        padding-left: 20px;
      }
    }
  }
`

const FarmCardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  & > div {
    width: 100%;
    margin: 16px 0 0;
    ${({ theme }) => theme.mediaQueries.md} {
      width: calc(50% - 16px);
    }
  }
`

const StyledImage = styled(Image)`
  margin-left: auto;
  margin-right: auto;
  margin-top: 58px;
  max-height: 88px;
  max-width: 280px;
  position: relative;
  width: 100%;
  & > img {
    position: unset;
  }
`

const LiquidityHead = styled.div`
  color: white;
  background: #49468a;
  border-radius: 70px;
  color: white;
  padding: 5px 5px;
  text-align: center;
  ${({ theme }) => theme.mediaQueries.xs} {
    padding: 10px 10px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 10px 10px;
  }
`
const NUMBER_OF_FARMS_VISIBLE = 12

const getDisplayApr = (cakeRewardsApr?: number, lpRewardsApr?: number) => {
  if (cakeRewardsApr && lpRewardsApr) {
    return (cakeRewardsApr + lpRewardsApr).toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  if (cakeRewardsApr) {
    return cakeRewardsApr.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }
  return null
}

let orderFlag = true

const EarnPools: React.FC = (props) => {
  const { path } = useRouteMatch()
  const { isXl } = useMatchBreakpoints()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const { data: farmsLP, userDataLoaded } = useFarms()
  const cakePrice = usePriceCakeBusd()
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = usePersistState(ViewMode.CARD, { localStorageKey: 'pancake_farm_view' })
  const { account } = useWeb3React()
  const [sortOption, setSortOption] = useState("")
  const [sortFlag, setSortFlag] = useState(true)
  const chosenFarmsLength = useRef(0)

  const isArchived = pathname.includes('archived')
  const isInactive = pathname.includes('history')
  const isActive = !isInactive && !isArchived
  const [sortState, setSortState] = useState(0)

  usePollFarmsData(isArchived)

  // Users with no wallet connected should see 0 as Earned amount
  // Connected users should see loading indicator until first userData has loaded
  const userDataReady = !account || (!!account && userDataLoaded)

  const [stakedOnly, setStakedOnly] = useState(!isActive)
  useEffect(() => {
    setStakedOnly(!isActive)
  }, [isActive])

  const RealFarmLp: any[] = []

  console.log("farmsLP++++++++", farmsLP)
  for (let i = 0; i < farmsLP.length; i++) {
    if (farmsLP[i].pid === 4 || farmsLP[i].pid === 5) {
      RealFarmLp.push(farmsLP[i])
    }
  }

  const activeFarms = RealFarmLp.filter((farm) => farm.pid !== 0 && farm.multiplier !== '0X' && !isArchivedPid(farm.pid))
  const inactiveFarms = RealFarmLp.filter((farm) => farm.pid !== 0 && farm.multiplier === '0X' && !isArchivedPid(farm.pid))
  const archivedFarms = RealFarmLp.filter((farm) => isArchivedPid(farm.pid))

  const stakedOnlyFarms = activeFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedInactiveFarms = inactiveFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const stakedArchivedFarms = archivedFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  const farmsList = useCallback(
    (farmsToDisplay: Farm[]): FarmWithStakedValue[] => {
      let farmsToDisplayWithAPR: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        if (!farm.lpTotalInQuoteToken || !farm.quoteToken.busdPrice) {
          return farm
        }
        const totalLiquidity = new BigNumber(farm.lpTotalInQuoteToken).times(farm.quoteToken.busdPrice)
        const { cakeRewardsApr, lpRewardsApr } = isActive
          ? getFarmApr(new BigNumber(farm.poolWeight), cakePrice, totalLiquidity, farm.lpAddresses[ChainId.TESTNET])
          : { cakeRewardsApr: 0, lpRewardsApr: 0 }

        return { ...farm, apr: cakeRewardsApr, lpRewardsApr, liquidity: totalLiquidity }
      })

      if (query) {
        const lowercaseQuery = latinise(query.toLowerCase())
        farmsToDisplayWithAPR = farmsToDisplayWithAPR.filter((farm: FarmWithStakedValue) => {
          return latinise(farm.lpSymbol.toLowerCase()).includes(lowercaseQuery)
        })
      }
      return farmsToDisplayWithAPR
    },
    [cakePrice, query, isActive],
  )

  const handleChangeQuery = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const [numberOfFarmsVisible, setNumberOfFarmsVisible] = useState(NUMBER_OF_FARMS_VISIBLE)
  const [observerIsSet, setObserverIsSet] = useState(false)

  const chosenFarmsMemoized = useMemo(() => {
    let chosenFarms = []

    const sortFarms = (farms: FarmWithStakedValue[]): FarmWithStakedValue[] => {
      switch (sortOption) {
        case 'apr':
          if (sortFlag) {
            return orderBy(farms, (farm: FarmWithStakedValue) => farm.apr + farm.lpRewardsApr, 'desc')
          }
          return orderBy(farms, (farm: FarmWithStakedValue) => farm.apr + farm.lpRewardsApr, 'asc')
        case 'multiplier':
          if (sortFlag) {
            return orderBy(
              farms,
              (farm: FarmWithStakedValue) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
              'desc',
            )
          }
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.multiplier ? Number(farm.multiplier.slice(0, -1)) : 0),
            'asc',
          )
        case 'earned':
          if (sortFlag) {
            return orderBy(
              farms,
              (farm: FarmWithStakedValue) => (farm.userData ? Number(farm.userData.earnings) : 0),
              'desc',
            )
          }
          return orderBy(
            farms,
            (farm: FarmWithStakedValue) => (farm.userData ? Number(farm.userData.earnings) : 0),
            'asc',
          )
        case 'liquidity':
          if (sortFlag) {
            return orderBy(farms, (farm: FarmWithStakedValue) => Number(farm.liquidity), 'desc')
          }
          return orderBy(farms, (farm: FarmWithStakedValue) => Number(farm.liquidity), 'asc')
        default:
          return farms
      }
    }

    if (isActive) {
      chosenFarms = stakedOnly ? farmsList(stakedOnlyFarms) : farmsList(activeFarms)
    }
    if (isInactive) {
      chosenFarms = stakedOnly ? farmsList(stakedInactiveFarms) : farmsList(inactiveFarms)
    }
    if (isArchived) {
      chosenFarms = stakedOnly ? farmsList(stakedArchivedFarms) : farmsList(archivedFarms)
    }

    return sortFarms(chosenFarms).slice(0, numberOfFarmsVisible)
  }, [
    sortOption,
    sortFlag,
    activeFarms,
    farmsList,
    inactiveFarms,
    archivedFarms,
    isActive,
    isInactive,
    isArchived,
    stakedArchivedFarms,
    stakedInactiveFarms,
    stakedOnly,
    stakedOnlyFarms,
    numberOfFarmsVisible,
  ])
  chosenFarmsLength.current = chosenFarmsMemoized.length

  useEffect(() => {
    const showMoreFarms = (entries) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setNumberOfFarmsVisible((farmsCurrentlyVisible) => {
          if (farmsCurrentlyVisible <= chosenFarmsLength.current) {
            return farmsCurrentlyVisible + NUMBER_OF_FARMS_VISIBLE
          }
          return farmsCurrentlyVisible
        })
      }
    }

    if (!observerIsSet) {
      const loadMoreObserver = new IntersectionObserver(showMoreFarms, {
        rootMargin: '0px',
        threshold: 1,
      })
      loadMoreObserver.observe(loadMoreRef.current)
      setObserverIsSet(true)
    }
  }, [chosenFarmsMemoized, observerIsSet])

  const rowData = chosenFarmsMemoized.map((farm) => {
    const { token, quoteToken } = farm
    const tokenAddress = token.address
    const quoteTokenAddress = quoteToken.address
    const lpLabel = farm.lpSymbol && farm.lpSymbol.split(' ')[0].toUpperCase().replace('PANCAKE', '')
    const row: RowProps = {
      apr: {
        value: getDisplayApr(farm.apr, farm.lpRewardsApr),
        multiplier: farm.multiplier,
        lpLabel,
        tokenAddress,
        quoteTokenAddress,
        cakePrice,
        originalValue: farm.apr,
      },
      farm: {
        label: lpLabel,
        pid: farm.pid,
        token: farm.token,
        quoteToken: farm.quoteToken,
      },
      farmLP: {
        label: lpLabel,
        pid: farm.pid,
        token: farm.token,
        quoteToken: farm.quoteToken,
      },
      earned: {
        earnings: getBalanceNumber(new BigNumber(farm.userData.earnings)),
        pid: farm.pid,
      },
      liquidity: {
        liquidity: farm.liquidity,
      },
      multiplier: {
        multiplier: farm.multiplier,
      },
      details: farm,
    }

    return row
  })

  const renderContent = (): JSX.Element => {
    if (viewMode === ViewMode.TABLE && rowData.length) {
      const columnSchema = DesktopColumnSchema

      const columns = columnSchema.map((column) => ({
        id: column.id,
        name: column.name,
        label: column.label,
        sort: (a: RowType<RowProps>, b: RowType<RowProps>) => {
          switch (column.name) {
            case 'farm':
              return b.id - a.id
            case 'apr':
              if (a.original.apr.value && b.original.apr.value) {
                return Number(a.original.apr.value) - Number(b.original.apr.value)
              }

              return 0
            case 'earned':
              return a.original.earned.earnings - b.original.earned.earnings
            default:
              return 1
          }
        },
        sortable: column.sortable,
      }))
      return <Table data={rowData} handleSortOptionChange={handleSortOptionChange} columns={columns} userDataReady={userDataReady} />
    }

    return (
      <FarmCardContainer>
        <Route exact path={`${path}`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              removed={false}
              viewMode={viewMode}
              userDataReady={userDataReady}
            />
          ))}
        </Route>
        <Route exact path={`${path}/history`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              viewMode={viewMode}
              userDataReady={userDataReady}
              removed
            />
          ))}
        </Route>
        <Route exact path={`${path}/archived`}>
          {chosenFarmsMemoized.map((farm) => (
            <FarmCard
              key={farm.pid}
              farm={farm}
              displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
              cakePrice={cakePrice}
              account={account}
              viewMode={viewMode}
              userDataReady={userDataReady}
              removed
            />
          ))}
        </Route>
      </FarmCardContainer>
    )
  }

  const handleSortOptionChange = (option: number, flag: boolean): void => {
    setSortState(option)
    setSortFlag(flag)
    if (option === 2) {
      setSortOption('apr')
    } else if (option === 3) {
      setSortOption("liquidity")
    } else if (option === 4) {
      setSortOption("earned")
    }
  }

  const TdElement = styled.div`
    background: #49468a;
    border-radius: 70px;
    color: white;
    padding: 5px 5px;
    text-align: center;
    display: flex;
    flex-direction:row;
    justify-content:space-between;
    align-items:center;
    padding: 10px 15px;
    ${({ theme }) => theme.mediaQueries.xs} {
      padding: 10px 15px;
    }
    ${({ theme }) => theme.mediaQueries.sm} {
      padding: 10px 15px;
    }
  `

  const CustomText = styled(Text)`
    font-size: 10px;
    ${({ theme }) => theme.mediaQueries.xs} {
      font-size: 10px;
    }
    ${({ theme }) => theme.mediaQueries.sm} {
      font-size: 14px;
      padding: 12px 30px;
    }
  `
  return (
    <>
      <PoolsBanner>
        {/* <Image src="/images/farms/bg-hero-farms.svg" alt="Monster Farms" width={100} height={300} /> */}
      </PoolsBanner>
      <Page>
        <PoolsHeader />
        <ControlContainer>
          <ViewControls>
            <ToggleView viewMode={viewMode} onToggle={(mode: ViewMode) => setViewMode(mode)} />
            <LabelWrapper>
              <SearchInput onChange={handleChangeQuery} placeholder="Search" />
            </LabelWrapper>
          </ViewControls>
          <FilterContainer>
            <FarmTabButtons hasStakeInFinishedFarms={stakedInactiveFarms.length > 0} />
            <ToggleWrapper>
              <Checkbox checked={stakedOnly} onChange={() => setStakedOnly(!stakedOnly)} />
              <CustomText color="#49468A"> {t('Staked only')}</CustomText>
            </ToggleWrapper>
          </FilterContainer>
        </ControlContainer>
        {viewMode === ViewMode.CARD && (
          <FarmHead>
            <table>
              <thead>
                <tr>
                  <td width="10%">
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={() => {
                        orderFlag = !orderFlag
                        handleSortOptionChange(0, orderFlag)
                      }}
                      // onClick={() => setSortState(0)}
                      onKeyDown={() => {
                        console.log()
                      }}
                    >
                      {sortState === 0 ? <TdElement>HOT</TdElement> : <span>HOT</span>}
                    </div>
                  </td>
                  <td width="20%">LP</td>
                  <td width="20%">
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={() => {
                        orderFlag = !orderFlag
                        handleSortOptionChange(2, orderFlag)
                      }}
                      // onClick={() => setSortState(2)}
                      onKeyDown={() => {
                        console.log()
                      }}
                    >
                      {sortState === 2 ? <TdElement>
                        APR
                        <img src={orderFlag ? orderAsc : orderDec} alt="ifo bunny" width="10x" height="6px" />
                      </TdElement>
                        : <span>APR</span>}
                    </div>
                  </td>
                  <td width="20%">
                    {/* <LiquidityHead>
                          Liquidity
                        <WhiteArrowDown /> }
                    </LiquidityHead>  */}
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={() => {
                        orderFlag = !orderFlag
                        handleSortOptionChange(3, orderFlag)
                      }}
                      // onClick={() => setSortState(3)}
                      onKeyDown={() => {
                        console.log()
                      }}
                    >
                      {sortState === 3 ? <TdElement>
                        Liquidity
                        <img src={orderFlag ? orderAsc : orderDec} alt="ifo bunny" width="10x" height="6px" />
                      </TdElement> : <span>Liquidity</span>}
                    </div>
                  </td>
                  <td width="20%">
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={() => {
                        orderFlag = !orderFlag
                        handleSortOptionChange(4, orderFlag)
                      }}
                      // onClick={() => setSortState(4)}
                      onKeyDown={() => {
                        console.log()
                      }}
                    >
                      {sortState === 4 ? <TdElement>
                        Earned
                        <img src={orderFlag ? orderAsc : orderDec} alt="ifo bunny" width="10x" height="6px" />
                      </TdElement> : <span>Earned</span>}
                    </div>
                  </td>
                  <td width="10%" />
                </tr>
              </thead>
            </table>
          </FarmHead>
        )}
        {renderContent()}

        {account && !userDataLoaded && stakedOnly && (
          <Flex justifyContent="center">
            <Loading />
          </Flex>
        )}
        <div ref={loadMoreRef} />
        {/* <StyledImage src="/images/decorations/monster-farms.png" alt="Monster Farms" width={280} height={88} /> */}
      </Page>
    </>
  )
}

export default EarnPools
