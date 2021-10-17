import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import { useMatchBreakpoints, NFTImage } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import useDelayedUnmount from 'hooks/useDelayedUnmount'
import { useFarmUser } from 'state/farms/hooks'
import { ReactComponent as ArrowDown } from 'assets/images/ArrowDown.svg'
import { ReactComponent as ArrowUp } from 'assets/images/ArrowUp.svg'

import Apr, { AprProps } from './Apr'
import Farm, { FarmProps } from './Farm'
import FarmLP from './FarmLP'
import Earned, { EarnedProps } from './Earned'
// import Details from './Details'
import StakedAction from './Actions/StakedAction'
import Multiplier, { MultiplierProps } from './Multiplier'
import Liquidity, { LiquidityProps } from './Liquidity'
import ActionPanel from './Actions/ActionPanel'
import { DesktopColumnSchema, MobileColumnSchema } from '../types'

export interface RowProps {
  apr: AprProps
  farm: FarmProps
  farmLP: FarmProps
  earned: EarnedProps
  multiplier: MultiplierProps
  liquidity: LiquidityProps
  details: FarmWithStakedValue
}

interface RowPropsWithLoading extends RowProps {
  userDataReady: boolean
}

const DetailsTr = styled.tr`
  & td {
    background: #eaf2f7;
    overflow: hidden;
    &:first-child {
      border-bottom-left-radius: 10px;
    }
    &:last-child {
      border-bottom-right-radius: 10px;
    }
    & div {
      background: #eaf2f7;
      ${({ theme }) => theme.mediaQueries.xl} {
        padding-left: 0;
      }
    }
  }
`

const Row: React.FunctionComponent<RowPropsWithLoading> = (props) => {
  const { details, userDataReady, farmLP, apr, liquidity, earned, farm } = props
  const hasStakedAmount = !!useFarmUser(details.pid).stakedBalance.toNumber()
  const [actionPanelExpanded, setActionPanelExpanded] = useState(hasStakedAmount)
  const shouldRenderChild = useDelayedUnmount(actionPanelExpanded, 300)
  const { t } = useTranslation()

  const toggleActionPanel = () => {
    console.log('twet')
    setActionPanelExpanded(!actionPanelExpanded)
  }

  useEffect(() => {
    // setActionPanelExpanded(hasStakedAmount)
  }, [hasStakedAmount])

  const { isXs, isSm, isMd, isLg, isXl } = useMatchBreakpoints()
  const isMobile = !isXl
  const tableSchema = isMobile ? MobileColumnSchema : DesktopColumnSchema
  const columnNames = tableSchema.map((column) => column.name)

  const TableRow = styled.tr`
    cursor: pointer;
    color: #4e4e9d;
    width: 100%;
  `

  const ItemElement = styled.div`
    background-color: #eaf2f7;
    padding: 24px;
    margin-top: 12px;
    min-height: 90px;
    display: flex;
    align-items: center;
    & > div {
      display: block;
    }
  `
  const CustomFirstItemElement = styled.div`
    background-color: #eaf2f7;
    padding: 24px;
    margin-top: 12px;
    min-height: 90px;
    display: flex;
    align-items: center;
    font-size: 12px;
    width: 150px;
    & > div {
      display: block;
    }
  `

  const FirstElement = styled.div`
    margin-top: 12px;
    border-radius: 10px 0 0 10px;
    background-color: #fcf5d8;
    background-image: url('/images/farms/tree.svg');
    background-repeat: no-repeat;
    background-position: bottom;
    background-size: 90px 80px;
    min-width: 100px;
    height: 90px;
    display: flex;
    justify-content: center;
    gap: 5px;
    align-items: center;
  `

  const LastElement = styled(ItemElement)`
    padding: 0 12px;
    ${({ theme }) => theme.mediaQueries.xs} {
      padding: 0 24px;
    }
    ${({ theme }) => theme.mediaQueries.sm} {
      padding: 0 30px;
    }
    border-top-right-radius: 10px;
    border-bottom-right-radius: 10px;
  `
  const mobileRow = (
    <TableRow onClick={toggleActionPanel}>
      <td>
        <CustomFirstItemElement>{farmLP.label}</CustomFirstItemElement>
      </td>

      <td>
        <LastElement>
          <StakedAction {...details} userDataReady={userDataReady} />
          <div style={{ marginLeft: '10px' }}>{actionPanelExpanded ? <ArrowUp /> : <ArrowDown />}</div>
        </LastElement>
      </td>
    </TableRow>
  )

  const desktopRow = (
    <TableRow onClick={toggleActionPanel}>
      <td>
        <FirstElement>
          <NFTImage {...farm} />
        </FirstElement>
      </td>

      <td>
        <ItemElement>{farmLP.label}</ItemElement>
      </td>
      <td>
        <ItemElement>
          <Apr {...apr} hideButton={isMobile} />
        </ItemElement>
      </td>

      <td>
        <ItemElement>
          <Liquidity {...liquidity} />
        </ItemElement>
      </td>
      <td>
        <ItemElement>
          <Earned {...earned} userDataReady={userDataReady} />
        </ItemElement>
      </td>
      <td>
        <LastElement>
          <StakedAction {...details} userDataReady={userDataReady} />
          {actionPanelExpanded ? <ArrowUp /> : <ArrowDown />}
        </LastElement>
      </td>
    </TableRow>
  )

  return (
    <>
      {isMobile ? mobileRow : desktopRow}
      {shouldRenderChild && (
        <DetailsTr>
          {isXl && <td colSpan={2} />}
          <td colSpan={4}>
            <ActionPanel {...props} expanded={actionPanelExpanded} />
          </td>
        </DetailsTr>
      )}
    </>
  )
}

export default Row
