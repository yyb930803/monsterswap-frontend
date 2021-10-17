import BigNumber from 'bignumber.js'
import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from 'config'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

const refConst = "0x0000000000000000000000000000000000000000"

const getReferralValue = () => {
  let referralUrlVale1 = ""
  if (localStorage.getItem('referralUrlVale') !== undefined && localStorage.getItem('referralUrlVale') !== null && localStorage.getItem('referralUrlVale') !== "") {
    referralUrlVale1 = localStorage.getItem('referralUrlVale')
    return referralUrlVale1
  }
  referralUrlVale1 = refConst
  return referralUrlVale1
}

export const stakeFarm = async (masterChefContract, pid, amount) => {
  let referralUrlVale = getReferralValue();
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  if (pid === 0) {
    console.log("value", pid, value, referralUrlVale)
    const tx = await masterChefContract.deposit(pid, value, referralUrlVale, options)
    const receipt = await tx.wait()
    localStorage.removeItem('referralUrlVale')
    referralUrlVale = refConst
    return receipt.status
  }

  const tx = await masterChefContract.deposit(pid, value, referralUrlVale, options)
  const receipt = await tx.wait()
  localStorage.removeItem('referralUrlVale')
  referralUrlVale = refConst
  return receipt.status
}

export const unstakeFarm = async (masterChefContract, pid, amount) => {
  let referralUrlVale = getReferralValue();
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  // if (pid === 0) {
  //   const tx = await masterChefContract.deposit(pid, value, referralUrlVale, options)
  //   const receipt = await tx.wait()
  //   localStorage.removeItem('referralUrlVale')
  //   referralUrlVale = refConst
  //   return receipt.status
  // }

  const tx = await masterChefContract.withdraw(pid, value, options)
  const receipt = await tx.wait()
  localStorage.removeItem('referralUrlVale')
  referralUrlVale = refConst
  return receipt.status
}

export const harvestFarm = async (masterChefContract, pid) => {
  let referralUrlVale = getReferralValue();
  if (pid === 0) {
    const tx = await masterChefContract.deposit(pid, '0', referralUrlVale, options)
    const receipt = await tx.wait()
    localStorage.removeItem('referralUrlVale')
    referralUrlVale = refConst
    return receipt.status
  }
  console.log("asdadasdadasd");
  const tx = await masterChefContract.deposit(pid, '0', referralUrlVale, options)
  const receipt = await tx.wait()
  localStorage.removeItem('referralUrlVale')
  referralUrlVale = refConst
  return receipt.status
}
