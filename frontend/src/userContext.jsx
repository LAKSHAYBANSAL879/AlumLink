import axios from "axios";
import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
const [role,setRole]=useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = Cookies.get('token');
console.log(token);
        if (token) {
          const response = await axios.get('http://localhost:8080/api/v1/auth/getuser', {
            headers: {
              Authorization: `${token}`,
            },
          });

          setUser(response.data.user);
setRole(response.data.role);
          setReady(true); 
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, role, ready }}>
      {children}
    </UserContext.Provider>
  );
}