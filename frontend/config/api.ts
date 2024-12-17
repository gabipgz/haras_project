export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' 
      ? 'http://localhost:3001'
      : 'http://34.56.65.192:3001';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
}; 