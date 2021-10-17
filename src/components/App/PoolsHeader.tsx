import React from 'react'
import styled from 'styled-components'
import { Text, Flex, Heading, IconButton, ArrowBackIcon } from 'uikit'
import { Link } from 'react-router-dom'
import PoolsSubNav from 'components/Menu/PoolsSubNav'
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

const PoolsHeaderContainer = styled(Flex)`
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px;
  width: 100%;
  font-family: 'Ubuntu';
`

const PoolsHeader: React.FC<Props> = ({ title, subtitle, helper, backTo, noConfig = false }) => {
  return (
    <PoolsHeaderContainer>
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
          <PoolsSubNav />
        </Flex>
      </Flex>
    </PoolsHeaderContainer>
  )
}

export default PoolsHeader
