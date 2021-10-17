import React from 'react'
import styled from 'styled-components'
import { Link, useLocation } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem } from 'uikit'
import { useTranslation } from 'contexts/Localization'

const StyledNav = styled.nav`
  margin-bottom: 0px;
`

const getActiveIndex = (pathname: string): number => {
  if (
    pathname === '/pool' ||
    pathname === '/create' ||
    pathname === '/add' ||
    pathname === '/remove' ||
    pathname === '/find' ||
    pathname === '/liquidity'||
    pathname === '/earnpools'
  ) {
    return 1
  }
  return 0
}

const Nav = () => {
  const location = useLocation()
  const { t } = useTranslation()
  return (
    <StyledNav>
      <ButtonMenu activeIndex={getActiveIndex(location.pathname)} variant="subtle">
        <ButtonMenuItem id="pool-nav-link" to="/pools" as={Link}>
          {t('Stake Monster')}
        </ButtonMenuItem>
        <ButtonMenuItem id="swap-nav-link" to="/earnpools" as={Link}>
          {t('Earn Monster')}
        </ButtonMenuItem>
      </ButtonMenu>
    </StyledNav>
  )
}

export default Nav
