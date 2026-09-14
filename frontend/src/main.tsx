import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthBootstrap } from '@/features/auth/AuthBootstrap'
import { queryClient } from '@/lib/queryClient'
import { store } from '@/store'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthBootstrap>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
