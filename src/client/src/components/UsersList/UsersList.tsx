import React from "react";
import "./UsersList.scss";

const UsersList = ({
  data,
}: {
  data: Array<{
    user?: UserDetails;
    [k: string | number]: any;
  }>;
}) => {
  function redirectTo(username: string) {
    window.location.href = window.location.origin + "/profile/" + username;
  }

  return data?.length === 0 ? (
    <span>It's empty yet..</span>
  ) : (
    <div className="mini-users-list">
      {data.map(({ user }: { user: UserDetails }) => {
        return (
          <div key={user._id} className="mini-user">
            <img
              onClick={() => redirectTo(user.username)}
              alt=""
              src={user.avatarFile}
            />
            <span onClick={() => redirectTo(user.username)}>
              {user.username}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default UsersList;
