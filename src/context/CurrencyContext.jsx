import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';


const BASE_URL = 'https://api.apilayer.com/exchangerates_data';
const API_KEY = import.meta.env.VITE_API_TOKEN;
const REQUEST_BODY = {
  method: 'GET',
  redirect: 'follow',
  credentials: 'include',
  headers: {
    'content-type': 'application/json; charset=UTF-8',
    'apikey': API_KEY
  }
};

const CurrencyContext = createContext()

const useCurrencyContext = () => {
  return useContext(CurrencyContext)
};

const CurrencyProvider = ({ children }) => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('TWD');
  const [amount, setAmount] = useState(1);
  const [amountInFromCurrency, setAmountInFromCurrency] = useState(true);


  const {
    data : currencyOptions, 
    isLoading, 
    isError
  } = useQuery({
    queryKey: ['currencyOptions'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/symbols`, REQUEST_BODY);
      if (!res.ok) {
        throw new Error('Invalid Https Request');
      }
  
      const data = await res.json();

      return Object.keys(data?.symbols)
    }, 
    staleTime: Infinity
  });


  const { data : exchangeRate } = useQuery({
    queryKey: [fromCurrency, toCurrency],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/latest?base=${fromCurrency}&symbols=${toCurrency}`, REQUEST_BODY);
      if (!res.ok) {
        throw new Error('Invalid Https Request');
      }

      const data = await res.json();

      return data?.rates[toCurrency];
    }
  });


  const fromAmount = useMemo(() => {
    return amountInFromCurrency ? amount : amount / exchangeRate;
  },  [amount, amountInFromCurrency, exchangeRate]);

  const toAmount = useMemo(() => {
    return amountInFromCurrency ? amount * exchangeRate : amount;
  }, [amount, amountInFromCurrency, exchangeRate]);


  const handleFromCurrencySelect = (currency) => {
    setFromCurrency(currency);
  };

  const handleToCurrencySelect = (currency) => {
    setToCurrency(currency);
  };

  const handleFromAmountChange = (amount) => {
    setAmount(amount);
    setAmountInFromCurrency(true);
  };

  const handleToAmountChange = (amount) => {
    setAmount(amount);
    setAmountInFromCurrency(false);
  };
  
  const value = {
    isLoading,
    isError,
    currencyOptions,
    fromAmount,
    fromCurrency,
    toAmount,
    toCurrency,
    handleFromCurrencySelect,
    handleFromAmountChange,
    handleToCurrencySelect,
    handleToAmountChange,
  };


  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider> 
  )
}

export { useCurrencyContext, CurrencyProvider };