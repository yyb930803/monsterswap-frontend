import styled from 'styled-components'
import { variant as StyledSystemVariant } from 'styled-system'
import { ImageProps, Variant, variants } from './types'
import Image from './Image'
import TokenImage from './TokenImage'

interface StyledImageProps extends ImageProps {
  variant: Variant
}

export const StyledPrimaryImage = styled(TokenImage)<StyledImageProps>`
  width: ${({ list }) => list ? '35px' : '25px'};
  height: ${({ list }) => list ? '35px' : '25px'};
`

export const StyledSecondaryImage = styled(TokenImage)<StyledImageProps>`
  width: ${({ list }) => list ? '35px' : '25px'};
  height: ${({ list }) => list ? '35px' : '25px'};
`

export const ListPrimaryImage = styled(TokenImage)<StyledImageProps>``

export const ListSecondaryImage = styled(TokenImage)<StyledImageProps>``


const TreeImage = styled(Image)``

export const StyledTreeImage = styled(TreeImage)<StyledImageProps>`
  position: absolute;
  width: 100%;
`
