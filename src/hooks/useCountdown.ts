import { useCallback, useEffect, useReducer } from 'react'

type Actions =
  | { type: 'START' }
  | { type: 'RESET'; payload: number }
  | { type: 'PAUSE' }
  | { type: 'RUNNING' }
  | { type: 'TICK'; payload: number }

type State = {
  canStart: boolean
  timeLeft: number
  isRunning: boolean
}

function reducer(state: State, action: Actions): State {
  switch (action.type) {
    case 'START':
      return {
        ...state,
        canStart: state.timeLeft !== 0,
      }
    case 'RESET':
      return {
        ...state,
        timeLeft: action.payload,
        canStart: false,
        isRunning: false,
      }
    case 'PAUSE':
      return {
        ...state,
        canStart: false,
        isRunning: false,
      }
    case 'RUNNING':
      return {
        ...state,
        isRunning: true,
      }
    case 'TICK':
      return {
        ...state,
        timeLeft: state.timeLeft - action.payload,
      }
    default:
      return state
  }
}

export interface ICountdownParams {
  /**
   * Countdown time in milliseconds.
   */
  timeToCount: number
  /**
   * Default: 1000.
   * Interval between ticks in milliseconds.
   */
  interval?: number
  /**
   * Default: false.
   * Determines if the countdown will start ticking on mount. This value has no effect on
   * a timer after it has expired or been reset.
   */
  autoStart?: boolean
  /**
   * Default: false
   * Determines if the countdown will expire immediately when ticking to 0. If false,
   * the timer will first set countdown to 0 and then expire on the next interval tick.
   */
  expireImmediate?: boolean
  /**
   * Default: true.
   * Reset the countdown to it's initial value after expiration. If false,
   * the countdown will remain at 0 in a non-running state until reset.
   */
  resetOnExpire?: boolean
  /**
   * Callback fired on countdown expiration.
   */
  onExpire?: () => void
  /**
   * Callback fired when countdown is reset, either by setting resetOnExpire to true
   * or explicitly calling the reset method.
   */
  onReset?: () => void
}

export type CountdownResult = {
  /**
   * Current value of the countdown.
   */
  timeLeft: number
  /**
   * Is the countdown currently ticking.
   */
  isRunning: boolean
  /**
   * Start a non-running and non-expired timer. If countdown has expired and
   * resetOnExpire = false, reset must be called before starting again.
   */
  start: () => void
  /**
   * Reset a countdown to it's initial state.
   */
  reset: () => void
  /**
   * Pause a running countdown.
   */
  pause: () => void
}

/**
 * Create a configurable countdown timer.
 */
export function useCountdown({
  timeToCount,
  interval = 1000,
  autoStart = false,
  expireImmediate = false,
  resetOnExpire = true,
  onExpire,
  onReset,
}: ICountdownParams): CountdownResult {
  const [state, dispatch] = useReducer(reducer, {
    canStart: autoStart,
    timeLeft: timeToCount,
    isRunning: false,
  })

  function start() {
    dispatch({ type: 'START' })
  }

  function pause() {
    dispatch({ type: 'PAUSE' })
  }

  function initStopped(time: number) {
    dispatch({ type: 'RESET', payload: time })
  }

  const reset = useCallback(() => {
    initStopped(timeToCount)
    if (onReset && typeof onReset === 'function') {
      onReset()
    }
  }, [timeToCount, onReset])

  const expire = useCallback(() => {
    initStopped(resetOnExpire ? timeToCount : 0)
    if (onExpire && typeof onExpire === 'function') {
      onExpire()
    }
  }, [timeToCount, onExpire, resetOnExpire])

  useEffect(() => {
    function tick() {
      if (state.timeLeft / 1000 <= 0 || (expireImmediate && (state.timeLeft - interval) / 1000 <= 0)) {
        expire()
      } else {
        dispatch({ type: 'TICK', payload: interval })
      }
    }

    let id: NodeJS.Timeout
    if (state.canStart) {
      id = setInterval(tick, interval)
      if (!state.isRunning) {
        dispatch({ type: 'RUNNING' })
      }
    }
    return () => clearInterval(id)
  }, [expire, expireImmediate, interval, state.canStart, state.timeLeft, state.isRunning])

  return {
    timeLeft: state.timeLeft,
    isRunning: state.isRunning,
    start,
    reset,
    pause,
  }
}
