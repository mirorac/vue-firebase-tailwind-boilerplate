import { app } from './app'
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from 'firebase/analytics'

export const analytics = (() => {
  if (import.meta.env.SSR || import.meta.env.DEV) {
    return {
      logEvent: console.log.bind(null, 'Analytics logEvent:'),
      setUserId: console.log.bind(null, 'Analytics setUserId:'),
      setUserProperties: console.log.bind(null, 'Analytics setUserProperties:'),
    }
  } else {
    const analytics = getAnalytics(app)
    return {
      logEvent: logEvent.bind(null, analytics),
      setUserId: setUserId.bind(null, analytics),
      setUserProperties: setUserProperties.bind(null, analytics),
    }
  }
})()
