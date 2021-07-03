import React from 'react'
import styled from 'styled-components'
import { useRouteMatch, Link } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem, Toggle, Text, Flex, NotificationDot, useMatchBreakpoints } from '@heswap/uikit'
import { useTranslation } from 'contexts/Localization'
import useTheme from 'hooks/useTheme'
import ToggleView, { ViewMode } from './ToggleView'

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 16px;

  a {
    padding-left: 12px;
    padding-right: 12px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 16px;
  }
`

const StyledMenu = styled(ButtonMenu)`
  border: none;
  border-radius: 8px;
  background-color: rgb(16, 38, 72);
`

const PoolTabButtons = ({ stakedOnly, setStakedOnly, hasStakeInFinishedPools, viewMode, setViewMode }) => {
  const { url, isExact } = useRouteMatch()
  const { isXs, isSm } = useMatchBreakpoints()
  const { t } = useTranslation()
  const { theme } = useTheme()

  const viewModeToggle = <ToggleView viewMode={viewMode} onToggle={(mode: ViewMode) => setViewMode(mode)} />

  const liveOrFinishedSwitch = (
    <Wrapper>
      <StyledMenu activeIndex={isExact ? 0 : 1} scale="sm" variant="subtle">
        <ButtonMenuItem
          height="48px"
          paddingX="16px"
          as={Link}
          to={`${url}`}
          variant={isExact ? 'primary' : 'text'}
          style={{
            borderRadius: '8px',
            paddingLeft: '16px',
            paddingRight: '16px',
            backgroundColor: isExact ? theme.colors.primary : 'transparent',
            fontSize: '14px'
          }}
        >
          {t('Live')}
        </ButtonMenuItem>
        <NotificationDot show={hasStakeInFinishedPools}>
          <ButtonMenuItem
            height="48px"
            paddingX="16px"
            as={Link}
            to={`${url}/history`}
            variant={!isExact ? 'primary' : 'text'}
            style={{
              borderRadius: '8px',
              paddingLeft: '16px',
              paddingRight: '16px',
              backgroundColor: !isExact ? theme.colors.primary : 'transparent',
              fontSize: '14px'
            }}
          >
            {t('Finished')}
          </ButtonMenuItem>
        </NotificationDot>
      </StyledMenu>
    </Wrapper>
  )

  const stakedOnlySwitch = (
    <Flex mt={['4px', null, 0, null]} ml={[0, null, '24px', null]} justifyContent="center" alignItems="center">
      <Toggle scale="sm" checked={stakedOnly} onChange={() => setStakedOnly((prev) => !prev)} />
      <Text ml={['4px', '4px', '8px']}>{t('Staked only')}</Text>
    </Flex>
  )

  if (isXs || isSm) {
    return (
      <Flex flexDirection="column" alignItems="flex-start" mb="24px">
        <Flex width="100%" justifyContent="space-between">
          {viewModeToggle}
          {liveOrFinishedSwitch}
        </Flex>
        {stakedOnlySwitch}
      </Flex>
    )
  }

  return (
    <Flex
      alignItems="center"
      justifyContent={['space-around', 'space-around', 'flex-start']}
      mb={['24px', '24px', '24px', '0px']}
    >
      {viewModeToggle}
      {liveOrFinishedSwitch}
      {stakedOnlySwitch}
    </Flex>
  )
}

export default PoolTabButtons
