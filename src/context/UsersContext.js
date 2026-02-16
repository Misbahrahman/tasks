import { createContext, useContext } from 'react';
import { useUsers } from '../hooks/useUser';

const UsersContext = createContext(null);

export const UsersProvider = ({ children }) => {
  const value = useUsers();
  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
};

export const useAllUsers = () => useContext(UsersContext);
