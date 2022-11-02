import { Tag } from "antd";
import { uuid } from "anytool";
import React, { useEffect, useState } from "react";
import { BsPencilSquare } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Post from "../../components/post-ui/Post";
import Tags from "../../components/Tags/Tags";
import UsersList from "../../components/UsersList/UsersList";
import {
  fetchUser,
  getCurrentUserLocalStorage,
  isCurrentUser,
  selectCurrentUser,
} from "../../features/current-user/current-user-slice";
import {
  setUserThunk,
  toggleMessagesStatus,
} from "../../features/messages/messages-slice";
import { setOverlayContent } from "../../features/overlay-content/overlay-content-slice";
import { useFetch } from "../../modules/useFetch";
import "./profile.scss";

const Profile = () => {
  const params = useParams();
  let username: string = params.username;

  const dispatch = useDispatch();
  const thisUser = useSelector(selectCurrentUser);

  const [author, setAuthor] = useState(false);
  const [user, setUser] = useState({} as UserDetails);
  const [posts, setPosts] = useState([] as PostJson[]);
  const { request } = useFetch();
  const _exists = getCurrentUserLocalStorage()?.details?.username;
  const [isFollower, setIsFollower] = useState(false);

  if (!_exists) {
    window.location.replace("/login");
  } else if (!username) {
    window.location.replace(_exists ? `/profile/${_exists}` : "/home");
  }

  const secs = {
    _token: getCurrentUserLocalStorage()._token,
    _id: getCurrentUserLocalStorage()._id,
  };

  useEffect(() => {
    const exists = getCurrentUserLocalStorage();
    if (isCurrentUser()) {
      request("api/auth/token/user/username", {
        method: "POST",
        body: JSON.stringify({
          _token: exists._token,
          username,
        }),
      }).then((res) => {
        if (res?.status === "OK") setAuthor(true);
      });
    }

    if (username) {
      request("api/auth/user/by/username", {
        method: "POST",
        body: JSON.stringify({
          _token: exists._token,
          _id: exists._id,
          username,
        }),
      }).then((res) => {
        if (res.status === "OK") {
          setUser(res.data);
          setIsFollower(
            Boolean(
              thisUser?.details?.following?.find((obj) => obj._id === user._id)
            )
          );
        }
      });
    }
  }, [thisUser]);

  useEffect(() => {
    if (user.username) {
      request("api/private/content/post/" + user.username, {
        query: secs,
      }).then((res) => {
        if (res && res.data) setPosts(res.data);
      });
    }
  }, [user]);

  function onPostDelete(_id: string) {
    setPosts(posts.filter((post) => post._id !== _id));
    setUser(user);
  }

  async function handleFollowButton() {
    const method = isFollower ? "remove" : "add";

    const res = await request("api/private/content/follower/" + method, {
      body: JSON.stringify({
        ...secs,
        targetId: user._id,
      }),
      method: "POST",
    });

    if (res?.status === "OK") {
      dispatch(fetchUser(secs) as any);
    }
  }

  async function fetchFollows(type: "followers" | "following") {
    const res = await request(`api/private/content/user/${user._id}/${type}`, {
      query: {
        ...secs,
      },
    });

    if (res?.status === "OK") {
      dispatch(
        setOverlayContent({
          content: <UsersList data={res.data} />,
          title: `${user.username}'s ${type}`,
          footer: null,
        })
      );
    }
  }

  async function handleMessageOpen() {
    dispatch(setUserThunk({ userId: user._id, show: true }) as any);
  }

  return (
    <>
      <div className="profile">
        <div className="profile-first-column">
          <img className="profile-avatar" src={user.avatarFile} alt="user" />
          <div className="profile-following">
            <div className="profile-follow-item">
              <span>{user.postCount}</span> posts
            </div>
            <div
              onClick={() => fetchFollows("followers")}
              className="profile-follow-item"
            >
              <span>{user.followerCount}</span> followers
            </div>
            <div
              onClick={() => fetchFollows("following")}
              className="profile-follow-item"
            >
              <span>{user.followingCount}</span> following
            </div>
          </div>
        </div>
        <h3 className="profile-username">{user.username}</h3>

        <p className="profile-bio">
          {user.name && <strong>{user.name}</strong>}
          {user.bio && (
            <>
              <br />
              {user.bio}
            </>
          )}
        </p>

        <div className="profile-last-column">
          <div className="profile-buttons">
            {author ? (
              <a className="profile-edit-button" href="/user/edit">
                <span>Edit Profile</span>
                <BsPencilSquare />
              </a>
            ) : (
              <>
                <button onClick={handleMessageOpen} className="profile-message">
                  Send Message
                </button>
                {isFollower ? (
                  <button
                    onClick={handleFollowButton}
                    className="profile-unfollow"
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    onClick={handleFollowButton}
                    className="profile-follow"
                  >
                    Follow
                  </button>
                )}
              </>
            )}
          </div>

          <div className="profile-characteristics">
            {user?.characteristics?.length > 0 && (
              <>
                <h6>Characteristics</h6>
                <div>
                  <Tags tags={user.characteristics} readonly />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="profile-posts-container">
        {posts.length > 0 ? (
          posts.map((post) => (
            <Post
              onDelete={onPostDelete}
              key={uuid(20)}
              post={post}
              creator={user}
            />
          ))
        ) : (
          <span>No posts yet!</span>
        )}
      </div>
    </>
  );
};

export default Profile;
