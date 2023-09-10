import { createContext, useContext, useState, useEffect } from 'react';
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

  const currencyOptionsData = useQuery({
    queryKey: ['currencyOptions'],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/symbols`, REQUEST_BODY);
      if (!res.ok) {
        throw new Error('Invalid Https Request');
      }
  
      return res.json();
    },
    staleTime: 1000
  });

  const currencyOptions = Object.keys(currencyOptionsData?.data?.symbols || {});

  const exchangeRateData = useQuery({
    queryKey: [fromCurrency, toCurrency],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/latest?base=${fromCurrency}&symbols=${toCurrency}`, REQUEST_BODY);
      if (!res.ok) {
        throw new Error('Invalid Https Request');
      }

      return res.json();
    },
    staleTime: Infinity
  });

  const exchangeRate = exchangeRateData?.data?.rates[toCurrency]
  let fromAmount = amountInFromCurrency ? amount : '';
  let toAmount = amountInFromCurrency ? '' : amount;

  if (exchangeRate) {
    fromAmount = amountInFromCurrency ? amount : amount / exchangeRate;
    toAmount = amountInFromCurrency ? amount * exchangeRate : amount;
  }


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
    console.log(amount);
    setAmount(amount);
    setAmountInFromCurrency(false);
  };
  
  const context = {
    isLoading : currencyOptionsData?.isLoading,
    isError: currencyOptions?.isError,
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
    <CurrencyContext.Provider value={context}>
      {children}
    </CurrencyContext.Provider> 
  )
}

export { useCurrencyContext, CurrencyProvider };