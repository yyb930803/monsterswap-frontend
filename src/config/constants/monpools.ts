import tokens from './tokens'
import { FarmConfig } from './types'

const monPools: FarmConfig[] = [
  {
    pid: 4,
    lpSymbol: 'MONSTER-BUSD',
    lpAddresses: {
      97: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
      56: '',
    },
    token: tokens.monster,
    quoteToken: tokens.busd,
  },
  {
    pid: 5,
    lpSymbol: 'MONSTER-BNB',
    lpAddresses: {
      97: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
      56: '',
    },
    token: tokens.monster,
    quoteToken: tokens.bnb,
  },  
]

export default monPools
