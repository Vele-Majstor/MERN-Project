import React, { Fragment, useState, useEffect } from "react";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import UserList from "../components/UserList";
import {useHttp} from "../../shared/hooks/http-hook";


const Users = () => {
    const {isLoading,error,sendRequest,clearError} = useHttp();

  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const getUsers = async () => {
      try {
        const responseData = await sendRequest("http://localhost:5000/api/users/");
        setLoadedUsers(responseData.users);
      } catch (err) {
        
      }
    };
    getUsers();
  }, [sendRequest]);


  return (
    <Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UserList users={loadedUsers} />}
    </Fragment>
  );
};

export default Users;
