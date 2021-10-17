import React from 'react'
import { Text } from 'uikit'

export interface FarmProps {
  label: string
}

const FarmLP: React.FunctionComponent<FarmProps> = ({ label }) => {
  return (
    <Text bold>{label}</Text>
  )
}

export default FarmLP
