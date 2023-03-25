import React from "react";

import { Route, Routes, Navigate } from "react-router-dom";
import NewPlace from "./places/pages/NewPlace";
import UpdatePlace from "./places/pages/UpdatePlace";
import UserPlaces from "./places/pages/UserPlaces";
import MainNaviation from "./shared/components/Navigation/MainNavigation";
import Auth from "./users/pages/Auth";
import Users from "./users/pages/Users";

import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";


function App() {
 
  const {token,login,logout,userId} = useAuth();


  let routes;
  if (token) {
    routes = (
      <Routes>
        <Route exact path="/" element={<Users />} />
        <Route exact path="/:userId/places" element={<UserPlaces />} />
        <Route exact path="/places/new" element={<NewPlace />} />
        <Route exact path="/places/:placeId" element={<UpdatePlace />} />
        <Route exact path="*" element={<Navigate replace to="/" />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route exact path="/" element={<Users />} />
        <Route exact path="/:userId/places" element={<UserPlaces />} />
        <Route exact path="/auth" element={<Auth />} />
        <Route exact path="*" element={<Navigate replace to="/auth" />} />
      </Routes>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        login: login,
        logout: logout,
        userId: userId,
      }}
    >
      <MainNaviation />
      <main className="main">
        {routes}
      </main>
    </AuthContext.Provider>
  );
}

export default App;
