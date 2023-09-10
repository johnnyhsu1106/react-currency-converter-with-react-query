import CurrencyConverter from './components/CurrencyConverter';
import { CurrencyProvider } from './context/CurrencyContext';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import './App.css'

const queryClient = new QueryClient();


const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <CurrencyConverter />
      </CurrencyProvider>
    </QueryClientProvider>
  )
}
export default App;
