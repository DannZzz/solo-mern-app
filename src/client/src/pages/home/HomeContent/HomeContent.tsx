import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Post from "../../../components/post-ui/Post";
import {
  getCurrentUserLocalStorage,
  selectCurrentUser,
} from "../../../features/current-user/current-user-slice";
import { useFetch } from "../../../modules/useFetch";
import "./HomeContent.scss";

const HomeContent: React.FC<{ className: string }> = ({ className }) => {
  const [feedContent, setFeedContent] = useState<PostJson[]>([]);
  const { request } = useFetch();
  const userState = getCurrentUserLocalStorage();

  useEffect(() => {
    request("api/private/content/feed/content", {
      query: {
        _token: userState._token,
        _id: userState._id,
      },
    }).then((res) => {
      if (res?.status === "OK" && res?.data) {
        setFeedContent(res.data);
      }
    });
  }, []);

  function onDelete(_id: string) {
    setFeedContent(feedContent.filter((post) => post._id !== _id));
  }

  return (
    <div className={className}>
      <div className="home-content-header"></div>
      {feedContent.length > 0 ? (
        feedContent.map((post) => (
          <Post
            key={post._id}
            onDelete={onDelete}
            creator={post.user}
            post={post}
          />
        ))
      ) : (
        <span>No Content</span>
      )}
    </div>
  );
};

export default HomeContent;
