import React, { useRef, useState } from 'react'
import styled from 'styled-components'
import { useTable, Button, ChevronUpIcon, ColumnType, useMatchBreakpoints } from 'uikit'
import { useTranslation } from 'contexts/Localization'
import { ReactComponent as WhiteArrowDown } from 'assets/images/WhiteArrowDown.svg'

import Row, { RowProps } from './Row'

const orderDec = "/images/arrowImage.png";
const orderAsc = "/images/anti-arrow.png";

export interface ITableProps {
  data: RowProps[]
  columns: ColumnType<RowProps>[]
  userDataReady: boolean
  sortColumn?: string
  handleSortOptionChange: (option: number, sortFlag: boolean) => void
}

const Container = styled.div`
  padding: 1px 1px 3px 1px;
  background-size: 400% 400%;
`

const StyledTable = styled.div`
  background-color: transparent;
`
const StyledRow = styled.div`
  background-color: transparent;
  margin-top: 20px;
  display: flex;
  align-items: center;
  height: 60px;
  border-radius: 60px;
  background: white;
  filter: ${({ theme }) => theme.card.dropShadow};
  @media (max-width: 767.98px) {
    padding-left: 20px;
  }
`
const StyledCell = styled.div`
  flex: 5;
  flex-direction: row;
  padding: 0 4px;
  color: #464486;
  ${({ theme }) => theme.mediaQueries.sm} {
    flex: 1 0 150px;
    padding: 0 20px;
  }
`

const FarmBody = styled.table`
  width: 100%;
`

const TableHead = styled.thead`
  filter: ${({ theme }) => theme.card.dropShadow};
  border-radius: 10px;
  margin-bottom: 16px;
  & tr {
    td {
      font-size: 14px;
      color: #464486;
      padding: 12px 0;
      text-align: center;
      background: ${({ theme }) => theme.card.background};
      &:first-child {
        border-top-left-radius: 70px;
        border-bottom-left-radius: 70px;
      }
      &:last-child {
        border-top-right-radius: 70px;
        border-bottom-right-radius: 70px;
      }
      ${({ theme }) => theme.mediaQueries.md} {
        padding-right: 32px;
      }
    }
  }
`

const TableBody = styled.tbody`
  & tr {
    border-radius: 10px;
    border: none;
    td {
      font-size: 16px;
      vertical-align: middle;
    }
  }
`

const ScrollButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 5px;
  padding-bottom: 5px;
`

const LiquidityHead = styled.div`
  background: #49468a;
  border-radius: 70px;
  padding: 12px 10px;
  color: white;
  display: flex;
  justify-content: space-around;
  align-items: center;
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
      text-align: center;
      line-height: 16px;
      letter-spacing: 0.04em;
      color: #464486;
      font-size: 9px;
      ${({ theme }) => theme.mediaQueries.xs} {
        font-size: 10px;
        padding-left: 20px;
      }
      ${({ theme }) => theme.mediaQueries.sm} {
        padding-right: 32px;
        font-size: 14px;
      }
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
const TdElement = styled.div`
  background: #49468a;
  border-radius: 70px;
  color: white;
  padding: 12px 15px;
  display: flex;
  flex-direction:row;
  justify-content:space-between;
  align-items:center;
`
const CustomButton = styled(Button)`
  font-size: 10px;
  ${({ theme }) => theme.mediaQueries.xs} {
    font-size: 10px;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    font-size: 14px;
  }
  `
let sortFlag = true

const FarmTable: React.FC<ITableProps> = (props) => {
  const tableWrapperEl = useRef<HTMLDivElement>(null)
  const { isXl } = useMatchBreakpoints()
  const { t } = useTranslation()
  const [sortState, setSortState] = useState(0)
  const { data, columns, userDataReady, handleSortOptionChange } = props

  const { rows } = useTable(columns, data, { sortable: true, sortColumn: 'farm' })

  const scrollToTop = (): void => {
    tableWrapperEl.current.scrollIntoView({
      behavior: 'smooth',
    })
  }


  const sortOptionChange = (option: number): void => {
    sortFlag = !sortFlag;
    setSortState(option)
    handleSortOptionChange(option, sortFlag)
  }

  return (
    <Container>
      <StyledTable role="table" ref={tableWrapperEl}>
        <FarmHead>
          <table>
            <thead>
              <tr>
                <td width="10%">
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => sortOptionChange(0)}
                    onKeyDown={() => {
                      console.log()
                    }}
                  >
                    {sortState === 0 ? <TdElement>HOT</TdElement> : <span>HOT</span>}
                  </div>
                </td>
                <td width="15%">LP</td>
                <td width="17%">
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => sortOptionChange(2)}
                    onKeyDown={() => {
                      console.log()
                    }}
                  >
                    {sortState === 2 ? <TdElement>
                      APR
                      <img src={sortFlag? orderAsc:orderDec} alt="ifo bunny" width="10x" height="6px" />
                    </TdElement>
                      : <span>APR</span>}
                  </div>
                </td>
                <td width="8%">
                  {/* <LiquidityHead>
                          Liquidity
                        <WhiteArrowDown /> }
                    </LiquidityHead>  */}
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => sortOptionChange(3)}
                    onKeyDown={() => {
                      console.log()
                    }}
                  >
                    {sortState === 3 ? <TdElement>
                      Liquidity
                      <img src={sortFlag? orderAsc:orderDec} alt="ifo bunny" width="10x" height="6px" />
                    </TdElement> : <span>Liquidity</span>}
                  </div>
                </td>
                <td width="35%">
                  <div
                    tabIndex={0}
                    role="button"
                    onClick={() => sortOptionChange(4)}
                    onKeyDown={() => {
                      console.log()
                    }}
                  >
                    {sortState === 4 ? <TdElement>
                      Earned
                      <img src={sortFlag? orderAsc:orderDec} alt="ifo bunny" width="10x" height="6px" />
                    </TdElement> : <span>Earned</span>}
                  </div>
                </td>
                <td width="15%" />
              </tr>
            </thead>
          </table>
        </FarmHead>
        <FarmBody>
          <TableBody>
            {rows.map((row) => {
              return <Row {...row.original} userDataReady={userDataReady} key={`table-row-${row.id}`} />
            })}
          </TableBody>
        </FarmBody>
      </StyledTable>
      <ScrollButtonContainer>
        <CustomButton variant="text" onClick={scrollToTop}>
          {t('To Top')}
          <ChevronUpIcon color="primary" />
        </CustomButton>
      </ScrollButtonContainer>
    </Container>
  )
}

export default FarmTable
