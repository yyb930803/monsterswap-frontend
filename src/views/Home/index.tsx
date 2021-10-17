import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Flex, Card, Image } from 'uikit'
import { useWeb3React } from '@web3-react/core'
import useTheme from 'hooks/useTheme'
import { useTranslation } from 'contexts/Localization'
import { useGetStats } from 'hooks/api'
import { formatLocalisedCompactNumber } from 'utils/formatBalance'

import Slider from 'react-slick'
import { ReactComponent as NextIcon } from 'assets/images/NextIcon.svg'
import { ReactComponent as PrevIcon } from 'assets/images/PrevIcon.svg'
import { CardButton, MonsterDataRow, MonsterFarmDataRow } from './components'

const Container = styled.div`
  padding: 90px 30px;
  max-width: 1200px;
  margin: 0 auto;

  & > div {
    flex-direction: column;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & > div {
      flex-direction: row;
    }
  }
`

const StyledTitle = styled.h1<{ fontSize: string }>`
  font-size: ${(props) => props.fontSize};
  color: #4e4e9d;
  text-transform: uppercase;
`

const StyledText = styled.p<{ fontSize: string }>`
  font-family: 'Red Hat Text', sans-serif;
  font-size: ${(props) => props.fontSize};
  color: rgba(17, 5, 24, 0.6);
`

const StyledCard = styled(Card) <{ bgColor?: string }>`
  padding: 20px;
  box-shadow: 0 2px 0 rgba(25, 19, 38, 0.1);
  background-color: ${(props) => props.bgColor};
  overflow: hidden;
  position: relative;
  height: 100%;
`

const BannerContainer = styled.div`
  padding: 0 69px 30px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
  & h1 {
    margin-bottom: 12px;
  }

  > div {
    margin-bottom: 51px;
    margin-top: -53px;
  }
`

const MonsterBanner = styled.div`
  width: 667px;
  height: 667px;
  background: #524f9e;
  border-radius: 350px;
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
`
const SliderContainer = styled.div`
  height: 300px;
  ${({ theme }) => theme.mediaQueries.sm} {
    height: 100%;
  }
  & .slick-list,
  & .slick-track {
    height: 100%;
  }
  & .slick-slider {
    height: calc(100% - 40px);
    position: relative;
  }
  & .slick-slide {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  & .slick-dots {
    li {
      margin: 0;
      & button:before {
        font-size: 12px;
      }
      &.slick-active,
      &:hover {
        & button:before {
          color: #4e4e9d;
        }
      }
    }
  }
`

const SliderArrowWrapper = styled.div`
  background: #4e4e9d;
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex !important;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: -60px;
  top: unset;
  z-index: 9;
  &:hover {
    background: #4e4e9d;
  }
  &.slick-disabled {
    background: rgba(78, 78, 157, 0.23);
  }
  &.slick-next {
    right: 10px;
  }
  &.slick-prev {
    left: 10px;
  }
  &:before {
    content: '';
  }
`

const SliderItem = styled.div`
  text-align: center;
  height: 100%;
`

const LeftPart = styled.div`
  width: 100%;
  & > div {
    height: 381px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    width: 40%;
    & > div {
      height: 100%;
      min-height: 381px;
    }
  }
`

const RightPart = styled.div`
  width: 100%;
  margin-top: 20px;
  ${({ theme }) => theme.mediaQueries.sm} {
    width: calc(60% - 20px);
    margin-left: 20px;
    margin-top: 0;
  }
`

const RightSmall = styled.div`
  width: 100%;
  margin-top: 20px;
  ${({ theme }) => theme.mediaQueries.sm} {
    width: calc(30% - 20px);
    margin-left: 20px;
    margin-top: 0;
  }
`

const RightSmallUpper = styled.div`
  height: 137px;
  margin-bottom: 20px;
  ${({ theme }) => theme.mediaQueries.sm} {
    margin-bottom: 0;
  }
`

const RightSmallDown = styled.div`
  height: 242px;
  margin-top: 20px;
`

const FarmStakingPart = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

const TotalLockedPart = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  & p {
    font-family: 'Red Hat Text', sans-serif;
    font-size: 14px;
    line-height: 24px;
    color: #110518;
    & b {
      font-family: 'Red Hat Text', sans-serif;
      font-size: 24px;
      line-height: 32px;
      color: #4e4e9d;
    }
  }
  & > div:last-child {
    display: flex;
    justify-content: flex-end;
  }
  & h2 {
    color: #4e4e9d;
    & svg path {
      fill: #4e4e9d;
    }
  }
`
// Values fetched from bitQuery effective 13/8/21
const txCount = 44713126
const addressCount = 2607499

const Home: React.FC = (props) => {
  // const { theme } = useTheme()
  // const { account } = useWeb3React()

  const { t } = useTranslation()
  const data = useGetStats()
  const { theme } = useTheme()

  const tvlString = data ? formatLocalisedCompactNumber(data.tvl) : '-'
  const trades = formatLocalisedCompactNumber(txCount)
  const users = formatLocalisedCompactNumber(addressCount)

  const tvlText = t('And those users are now entrusting the platform with over $%tvl% in funds.', { tvl: tvlString })
  const [entrusting, inFunds] = tvlText.split(tvlString)

  console.log('[home-tvlString]', tvlString, data)

  useEffect(() => {
    const appUrl = window.location.href
    if (appUrl.indexOf("ref=") >= 0) {
      const referralUrlVale = appUrl.split("ref=")[1]
      localStorage.setItem('referralUrlVale', referralUrlVale);
    } else {
      console.log("homeProps===------", appUrl)
    }
  }, [])

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: (
      <SliderArrowWrapper>
        <NextIcon />
      </SliderArrowWrapper>
    ),
    prevArrow: (
      <SliderArrowWrapper>
        <PrevIcon />
      </SliderArrowWrapper>
    ),
  }

  const CustomImage = styled(Image)`
    & > img {
      position: unset;
    }
  `
  return (
    <Container>
      <Flex>
        <LeftPart>
          <StyledCard>
            <BannerContainer>
              <CustomImage src="/images/home/logo-monster-home.svg" alt="Monster Swap" width={150} height={170} />
              <StyledTitle fontSize="36px">MONSTERSWAP</StyledTitle>
              <StyledText fontSize="14px">The #1 AMM and yield farm on Binance Smart Chain</StyledText>
            </BannerContainer>
          </StyledCard>
        </LeftPart>
        <RightPart>
          <StyledCard>
            <SliderContainer>
              <Slider {...sliderSettings}>
                <SliderItem>
                  <StyledTitle fontSize="32px">🎉 We are officially opening 🎉</StyledTitle>
                  <StyledText fontSize="14px">Start swapping right now!</StyledText>
                </SliderItem>
                <SliderItem>
                  <StyledTitle fontSize="32px">🎉 We are officially opening 🎉</StyledTitle>
                  <StyledText fontSize="14px">Start swapping right now!</StyledText>
                </SliderItem>
                <SliderItem>
                  <StyledTitle fontSize="32px">🎉 We are officially opening 🎉</StyledTitle>
                  <StyledText fontSize="14px">Start swapping right now!</StyledText>
                </SliderItem>
                <SliderItem>
                  <StyledTitle fontSize="32px">🎉 We are officially opening 🎉</StyledTitle>
                  <StyledText fontSize="14px">Start swapping right now!</StyledText>
                </SliderItem>
              </Slider>
            </SliderContainer>
          </StyledCard>
        </RightPart>
      </Flex>
      <Flex mt="20px">
        <LeftPart>
          <StyledCard>
            <FarmStakingPart>
              <StyledTitle fontSize="26px">Farms + Staking</StyledTitle>
              <div style={{ textAlign: 'center' }}>
                <StyledTitle fontSize="24px">Locked</StyledTitle>
              </div>
              <CardButton bgColor="#4E4E9D">Unlock Wallet</CardButton>
            </FarmStakingPart>
          </StyledCard>
        </LeftPart>
        <RightSmall>
          <StyledCard>
            <FarmStakingPart>
              <StyledTitle fontSize="26px">Monster Stats</StyledTitle>
              <MonsterDataRow />
              <CardButton bgColor="#4E4E9D">Learn More</CardButton>
            </FarmStakingPart>
          </StyledCard>
        </RightSmall>
        <RightSmall>
          <RightSmallUpper>
            <StyledCard bgColor="#4E4E9D">
              <MonsterFarmDataRow />
            </StyledCard>
          </RightSmallUpper>
          <RightSmallDown>
            <StyledCard>
              <TotalLockedPart>
                <StyledTitle fontSize="16px">Total Value Locked (TVL)</StyledTitle>
                <div>
                  <p>
                    <b>$900,000</b>
                  </p>
                  <p>Across all LPs and Pool</p>
                  <p>
                    <b>Locked</b>
                  </p>
                </div>
                <div>
                  <h2>
                    Account TVL <NextIcon />
                  </h2>
                </div>
              </TotalLockedPart>
            </StyledCard>
          </RightSmallDown>
        </RightSmall>
      </Flex>
    </Container>
  )
}

export default Home
