import React, { FC, useEffect, useRef, useState } from "react";
import { IoEllipsisVertical, IoHeart, IoHeartOutline } from "react-icons/io5";
import {
  HiChatBubbleLeftRight,
  HiLockClosed,
  HiPaperAirplane,
} from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUser,
} from "../../features/current-user/current-user-slice";
import moment from "moment";
import { Carousel, Dropdown, Image, Input, Menu, message } from "antd";
import { useFetch } from "../../modules/useFetch";
import "./post-ui.scss";
import { TextAreaRef } from "antd/lib/input/TextArea";
import { setOverlayContent } from "../../features/overlay-content/overlay-content-slice";
import UsersList from "../UsersList/UsersList";
import { uuid } from "anytool";
import { Message } from "../../modules/message";
import { ItemType } from "antd/lib/menu/hooks/useItems";

const Post: FC<{
  post: PostJson;
  creator?: UserDetails;
  onDelete?: (_id: string) => any;
}> = ({ post: p, creator, onDelete }) => {
  const dispatch = useDispatch();
  const [post, setPost] = useState(p as PostJson);
  const currentUser = useSelector(selectCurrentUser);

  const commentInputRef = useRef<TextAreaRef>(null);

  const [imagePreview, setImagePreview] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([] as PostComment[]);
  const [likeStatus, setLikeStatus] = useState(
    Boolean(post?.likes?.find((like) => like._id === currentUser._id))
  );
  const images = post.attachments;
  const [imageIndex, setImageIndex] = useState(0);
  const { request } = useFetch();

  // const tempComment: PostComment[] = [{ _iduser: { avatarFile: currentUser.details.avatarFile, username: currentUser.details.username }, userId: currentUser?._id, text: "Its's comment", date: new Date(), likes: [], replies: [] }]

  useEffect(() => {
    request(
      `/api/private/content/post/${post._id}/like/${
        likeStatus ? "like" : "unlike"
      }`,
      {
        method: "POST",
        body: JSON.stringify({
          _token: currentUser._token,
          _id: currentUser._id,
        }),
      }
    );
  }, [likeStatus]);

  useEffect(() => {
    request(`api/private/content/post/${post._id}/comments`, {
      query: {
        _token: currentUser._token,
        _id: currentUser._id,
      },
    }).then((res) => {
      if (res?.status === "OK") setComments(res.data || []);
    });
  }, [showComments]);

  function handleLike(type: boolean) {
    setLikeStatus(type);
    if (type && !post.likes.find((like) => like._id === currentUser._id)) {
      setPost({
        ...post,
        likes: [...post?.likes, { date: new Date(), _id: currentUser._id }],
        likeCount: post.likeCount + 1,
      });
    } else if (
      !type &&
      post.likes.find((like) => like._id === currentUser._id)
    ) {
      setPost({
        ...post,
        likes: post?.likes?.filter((like) => like._id !== currentUser._id),
        likeCount: post.likeCount - 1,
      });
    }
  }

  async function handleCommentSubmit(e: any) {
    e?.preventDefault();
    if (!commentInputRef.current.resizableTextArea.textArea.value) return;
    request(`api/private/content/post/${post._id}/comment/null/add`, {
      method: "POST",
      body: JSON.stringify({
        text: commentInputRef.current.resizableTextArea.textArea.value,
        _id: currentUser._id,
        _token: currentUser._token,
      }),
    }).then((res) => {
      if (res?.status === "OK") {
        setComments(res.data);
      }
    });
    commentInputRef.current.resizableTextArea.textArea.value = "";
  }

  async function showLikeUsers() {
    const res = await request(`api/private/content/post/${post._id}/likes`, {
      query: {
        _id: currentUser._id,
        _token: currentUser._token,
      },
    });

    if (res?.status === "OK") {
      const content = <UsersList data={res.data} />;
      dispatch(
        setOverlayContent({
          content,
          width: 350,
          footer: null,
        })
      );
    }
  }

  const PostSettingsContent: ItemType[] = [
    {
      label: "Copy Link",
      key: "copy-link",
      onClick() {
        navigator.clipboard
          .writeText(window.location.origin + "/post/" + post._id)
          .then(() => {
            Message("success", "Successfully copied link.");
          });
      },
    },
  ];

  if (currentUser?._id === creator?._id) {
    PostSettingsContent.push({
      label: "Delete Post",
      key: "delete",
      danger: true,
      onClick() {
        request("api/private/content/post/" + post._id, {
          method: "DELETE",
          body: JSON.stringify({
            _id: currentUser._id,
            _token: currentUser._token,
          }),
        }).then((res) => {
          if (res?.status === "OK") {
            Message("success", res.message);
            onDelete?.(post._id);
          } else if (res.status) {
            Message("error", res.message);
          }
        });
      },
    });
  }

  return (
    <div className="post-ui-data">
      {creator && (
        <div
          className="post-ui-creator"
          onClick={() =>
            window.location.replace("/profile/" + creator.username)
          }
        >
          <img src={creator.avatarFile} className="post-ui-creator-avatar" />
          <span className="post-ui-creator-username">{creator.username}</span>
        </div>
      )}
      <span className="post-ui-date">{moment(post.createdAt).fromNow()}</span>
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        overlay={<Menu items={PostSettingsContent} />}
      >
        <IoEllipsisVertical className="post-ui-settings" />
      </Dropdown>
      {post.text ? (
        <>
          <p className="post-ui-text">{post.text}</p>
          {images.length > 0 && (
            <div className="post-ui-image-container">
              <Carousel
                autoplay={images.length > 1}
                autoplaySpeed={5000}
                effect="fade"
                dots={{ className: "post-ui-image-slider-dots" }}
                className="post-ui-image-slider"
              >
                {images.map((image, i) => (
                  <div className="post-ui-slide-image-div" key={i}>
                    <Image className="post-ui-slide-image" src={image} />
                  </div>
                ))}
              </Carousel>
            </div>
          )}
          <div className="post-ui-methods">
            <div className="post-ui-method-block">
              {likeStatus ? (
                <IoHeart
                  post-ui-method-like
                  color="red"
                  onClick={(e) => handleLike(false)}
                />
              ) : (
                <IoHeartOutline
                  className="post-ui-method-like"
                  color="red"
                  onClick={(e) => handleLike(true)}
                />
              )}
              <span onClick={showLikeUsers} className="post-ui-method-count">
                {post.likeCount}
              </span>
            </div>
            <div
              className="post-ui-method-block"
              onClick={() => setShowComments(!showComments)}
            >
              <HiChatBubbleLeftRight className="post-ui-method-comment" />
              <span className="post-ui-method-count">{comments.length}</span>
            </div>
          </div>
          <div
            style={showComments ? {} : { display: "none" }}
            className="post-ui-comments"
          >
            <div className="post-ui-comments-container">
              {comments?.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment._id + uuid(20)}
                    className="post-ui-comment-data"
                  >
                    <img
                      className="post-ui-comment-avatar"
                      src={comment?.user?.avatarFile}
                      alt=""
                    />
                    <div className="post-ui-comment-texts">
                      <span className="post-ui-comment-username">
                        {comment.user?.username}
                      </span>
                      <p className="post-ui-comment-message">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <span className="post-ui-comment-empty">No comments yet</span>
              )}
            </div>
            <form
              onSubmit={handleCommentSubmit}
              className="post-ui-comment-input-block"
            >
              <Input.TextArea
                ref={commentInputRef}
                placeholder="Write a comment.."
                showCount
                maxLength={2048}
                className="post-ui-comments-input"
              ></Input.TextArea>
              <HiPaperAirplane
                size={30}
                onClick={handleCommentSubmit}
                className="post-ui-comment-input-send-icon"
              />
            </form>
          </div>
        </>
      ) : (
        <span className="post-ui-lock">
          <HiLockClosed /> This content is available only for{" "}
          {post.accessType === "followers"
            ? "followers"
            : "people who author is following"}
        </span>
      )}
    </div>
  );
};

export default Post;
