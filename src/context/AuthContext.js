import { createContext, useContext } from 'react';
import { useUser } from '../hooks/useUser';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const value = useUser();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
