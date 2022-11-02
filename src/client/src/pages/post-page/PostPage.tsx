import { Result } from "antd";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Post from "../../components/post-ui/Post";
import { getCurrentUserLocalStorage } from "../../features/current-user/current-user-slice";
import { useFetch } from "../../modules/useFetch";
import "./PostPage.scss";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<PostJson>();

  const { request } = useFetch();

  useEffect(() => {
    request("api/private/content/post/id/" + id, {
      query: {
        _token: getCurrentUserLocalStorage()._token,
        _id: getCurrentUserLocalStorage()._id,
      },
    }).then((res) => {
      if (res?.status === "OK") {
        setPost(res.data);
      }
    });
  }, []);

  return post ? (
    <div className="post-page">
      <Post creator={post.user} post={post} />
    </div>
  ) : (
    <Result
      className="page-error-container"
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
    />
  );
};

export default PostPage;
