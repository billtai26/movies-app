import { useMock } from './config'
import { api as mockApi } from './mockApi'
import { api as backendApi } from './backendApi'

export const api = useMock ? mockApi : backendApi
