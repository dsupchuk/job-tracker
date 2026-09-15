import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * Requests are intercepted at the network layer, so the Axios instance under
 * test — interceptors, refresh, retry and all — runs exactly as it does in the
 * browser. Mocking the api module would skip the part worth testing.
 */
export const server = setupServer(...handlers)
