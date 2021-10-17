import React from 'react'
import { Button, useWalletModal, Image } from 'uikit'
import useAuth from 'hooks/useAuth'
import { useTranslation } from 'contexts/Localization'

const ConnectWalletButton = (props) => {
  const { t } = useTranslation()
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout)
  const { btnText } = props

  return (
    <Button
      onClick={onPresentConnectModal} {...props}
      variant={`${btnText ? 'secondary' : 'success'}`}
    >
      { btnText || t('Connect') }
    </Button>
  )
}

export default ConnectWalletButton
