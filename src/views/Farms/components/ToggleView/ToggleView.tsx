import React from 'react'
import styled from 'styled-components'
import { IconButton, useMatchBreakpoints } from 'uikit'
import { ReactComponent as CardViewIcon } from 'assets/images/CardViewIcon.svg'
import { ReactComponent as TableViewIcon } from 'assets/images/TableViewIcon.svg'
import { ViewMode } from '../types'

interface ToggleViewProps {
  viewMode: ViewMode
  onToggle: (mode: ViewMode) => void
}

const Container = styled.div`
  margin-right: 0px;
  margin-left: -8px;

  & button {
    & svg path {
      stroke: #c8c7dc;
    }
    &.active {
      & svg path {
        stroke: #454282;
      }
    }
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 0;
    margin-right: 16px;
  }
`

const ToggleView: React.FunctionComponent<ToggleViewProps> = ({ viewMode, onToggle }) => {
  const { isXl } = useMatchBreakpoints()
  const handleToggle = (mode: ViewMode) => {
    if (viewMode !== mode) {
      onToggle(mode)
    }
  }

  return (
    <Container>
      {isXl && (
        <IconButton
          className={viewMode === ViewMode.TABLE ? 'active' : ''}
          variant="text"
          scale="sm"
          id="clickFarmCardView"
          onClick={() => handleToggle(ViewMode.TABLE)}
        >
          <CardViewIcon />
        </IconButton>
      )}
      <IconButton
        className={ viewMode === ViewMode.CARD ? 'active' : ''}
        variant="text"
        scale="sm"
        id="clickFarmTableView"
        onClick={() => handleToggle(ViewMode.CARD)}
      >
        <TableViewIcon />
      </IconButton>
    </Container>
  )
}

export default ToggleView
