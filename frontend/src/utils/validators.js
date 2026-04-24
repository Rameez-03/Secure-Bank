export const isEmpty = (value) => !value || value.trim() === '';

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isLength = (value, min = 6) => !value || value.length < min;

export const isMatch = (val1, val2) => val1 === val2;

export const formatCurrency = (amount, absolute = false) => {
  const value = absolute ? Math.abs(amount) : amount;
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatShortDate = (date) =>
  new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
  });
