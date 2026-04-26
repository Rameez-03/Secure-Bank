export const isEmpty = (value) => !value || value.trim() === '';

export const isEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export const isLength = (value, min = 12) => !value || value.length < min;

export const isMatch = (val1, val2) => val1 === val2;

// Matches backend PASSWORD_REGEX: 12+ chars, upper, lower, digit, special char
export const isStrongPassword = (password) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{12,}$/.test(password);

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
