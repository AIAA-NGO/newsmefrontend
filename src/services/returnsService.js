// services/returnsService.js
export const getSalesReturns = () => {
    const returns = JSON.parse(localStorage.getItem('sales_returns')) || [];
    return Promise.resolve(returns);
  };
  
  export const saveReturn = (returnData) => {
    const returns = JSON.parse(localStorage.getItem('sales_returns')) || [];
    const newReturn = {
      ...returnData,
      id: Date.now(),
      return_date: new Date().toISOString().split('T')[0],
    };
    returns.push(newReturn);
    localStorage.setItem('sales_returns', JSON.stringify(returns));
    return Promise.resolve(newReturn);
  };
  
  export const updateReturn = (id, updatedFields) => {
    let returns = JSON.parse(localStorage.getItem('sales_returns')) || [];
    returns = returns.map(r => (r.id === id ? { ...r, ...updatedFields } : r));
    localStorage.setItem('sales_returns', JSON.stringify(returns));
    return Promise.resolve();
  };
  
  export const deleteReturn = (id) => {
    let returns = JSON.parse(localStorage.getItem('sales_returns')) || [];
    returns = returns.filter(r => r.id !== id);
    localStorage.setItem('sales_returns', JSON.stringify(returns));
    return Promise.resolve();
  };
  