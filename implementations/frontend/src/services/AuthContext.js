import React, { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext({ user: undefined, refresh: async () => {} });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  async function refresh() {
    try {
      const resp = await api.get('/auth/me');
      setUser(resp.data);
    } catch (err) {
      setUser(null);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
