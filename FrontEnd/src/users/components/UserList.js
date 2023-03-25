import React from "react";
import Card from "../../shared/components/UIElements/Card";
import UserItem from "./UserItem";

import "./UserList.css";

const UserList = (props) => {
  if (props.users.length === 0) {
    return (
      <div className="center">
        <Card>
          <h2>No Users yet</h2>
        </Card>
      </div>
    );
  }

  return (
    <ul className="users-list">
      {props.users.map((user) => {
        return (
          <UserItem
            key={user.id}
            id={user.id}
            name={user.name}
            image={user.image}
            placeCount={user.places.length}
          />
        );
      })}
    </ul>
  );
};

export default UserList;
