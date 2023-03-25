import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

let logoutTimer;

export const useAuth = ()=>{
    const navigate = useNavigate();
    const [token, setToken] = useState(false);
    const [expirationDate,setExpirationDate] = useState();
    const [userId, setUserId] = useState(false);
    
  
    const login = useCallback(
      (uid, token,expirationDate) => {
        setToken(token);
        setUserId(uid);
        const tokenExpirationDate =expirationDate ||  new Date(new Date().getTime() + 1000 * 60 * 60);
        setExpirationDate(tokenExpirationDate);
        localStorage.setItem(
          "userData",
          JSON.stringify({ userId: uid, token: token,expiration:tokenExpirationDate.toISOString() })
        );
      },
      []
    );
  
    const logout = useCallback(() => {
      setToken(null);
      setExpirationDate(null);
      setUserId(null);
      localStorage.removeItem('userData');
      navigate("/auth");
    }, [navigate]);
  
    useEffect(()=>{
      if (token && expirationDate){
        const remainingTime = expirationDate.getTime() - new Date().getTime();
        logoutTimer = setTimeout(logout,remainingTime);
      }else{
        clearTimeout(logoutTimer);
      }
    },[token,logout,expirationDate])
  
    useEffect(()=>{
      const storedData = JSON.parse(localStorage.getItem('userData'));
      if (storedData && storedData.token && new Date(storedData.expiration) > new Date()){
        login(storedData.userId,storedData.token,new Date(storedData.expiration));
      }
    },[login])

    return {token,login,logout,userId}

}