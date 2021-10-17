import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, IconButton, ArrowBackIcon } from 'uikit'
import { Link } from 'react-router-dom'
import SubNav from 'components/Menu/SubNav'
import Settings from './Settings'
import Transactions from './Transactions'
import QuestionHelper from '../QuestionHelper'

interface Props {
  title?: string
  subtitle?: string
  helper?: string
  backTo?: string
  noConfig?: boolean
}

const AppHeaderContainer = styled(Flex)`
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  font-family: 'Ubuntu';
`

const AppHeader: React.FC<Props> = ({ title, subtitle, helper, backTo, noConfig = false }) => {
  return (
    <AppHeaderContainer>
      <Flex alignItems="center" mr={noConfig ? 0 : '16px'}>
        <Flex flexDirection="column">
          { title && 
            <Heading as="h2" mb="8px">
              {title}
            </Heading>
          }
          <Flex alignItems="center">
            {helper && <QuestionHelper text={helper} mr="4px" />}
            {subtitle && 
              <Text as={Link} to={backTo} color="textSubtle" fontSize="14px" fontFamily="Ubuntu" >
                {subtitle}
              </Text>
            }
          </Flex>
          <SubNav />
        </Flex>
      </Flex>
      {!noConfig && (
        <Flex>
          <Settings />
          {/* <Transactions /> */}
        </Flex>
      )}
    </AppHeaderContainer>
  )
}

export default AppHeader
