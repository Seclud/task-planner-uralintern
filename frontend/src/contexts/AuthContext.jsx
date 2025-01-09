import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            fetch('http://127.0.0.1:8000/users_login/me', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Not authenticated');
                })
                .then(data => {
                    setUser(data);
                    setLoading(false);
                    console.log(data); // Log user data after it has been set
                })
                .catch(() => {
                    setUser(null);
                    setIsAuthenticated(false);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const login = (data) => {
        localStorage.setItem('authToken', data.access_token);
        setIsAuthenticated(true);
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
