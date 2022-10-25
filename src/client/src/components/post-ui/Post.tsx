import React, { useEffect, useRef, useState } from 'react'
import { IoChevronBackCircleOutline, IoChevronForwardCircleOutline, IoHeart, IoHeartOutline, IoSend } from "react-icons/io5"
import { HiChatBubbleLeftRight, HiLockClosed } from "react-icons/hi2"
import { useSelector } from 'react-redux';
import { selectCurrentUser, UserDetails } from '../../features/current-user/current-user-slice';
import moment from "moment";
import "./post-ui.scss";
import { useFetch } from '../../modules/useFetch';

const Post = ({ post: p, creator }: { post: PostJson, creator?: UserDetails }) => {
    const [post, setPost] = useState(p as PostJson);
    const currentUser = useSelector(selectCurrentUser);

    const commentInputRef = useRef(null as HTMLTextAreaElement);

    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([] as PostComment[]);
    const [likeStatus, setLikeStatus] = useState(Boolean(post?.likes?.find(like => like._id === currentUser._id)));
    const images = post.attachments;
    const [imageIndex, setImageIndex] = useState(0);
    const { request } = useFetch();

    // const tempComment: PostComment[] = [{ _iduser: { avatarFile: currentUser.details.avatarFile, username: currentUser.details.username }, userId: currentUser?._id, text: "Its's comment", date: new Date(), likes: [], replies: [] }]

    useEffect(() => {
        request(`/api/private/content/post/${post._id}/like/${likeStatus ? "like" : "unlike"}`, {
            method: "POST",
            body: JSON.stringify({
                _token: currentUser._token,
                _id: currentUser._id
            })
        })
    }, [likeStatus]);

    useEffect(() => {
        request(`api/private/content/post/${post._id}/comments`, {
            query: {
                _token: currentUser._token,
                _id: currentUser._id
            }
        }).then(res => {
            if (res?.status === "OK") setComments(res.data || [])
        })
    }, [showComments])

    function handleLike(type: boolean) {
        setLikeStatus(type);
        if (type && !post.likes.find(like => like._id === currentUser._id)) {
            setPost({ ...post, likes: [...post?.likes, { date: new Date(), _id: currentUser._id }], likeCount: post.likeCount + 1 })
        } else if (!type && post.likes.find(like => like._id === currentUser._id)) {
            setPost({ ...post, likes: post?.likes?.filter(like => like._id !== currentUser._id), likeCount: post.likeCount - 1 })
        }
    }

    async function handleCommentSubmit(e: any) {
        e?.preventDefault();
        if (!commentInputRef.current.value) return;
        request(`api/private/content/post/${post._id}/comment/null/add`, {
            method: "POST",
            body: JSON.stringify({
                text: commentInputRef.current.value,
                _id: currentUser._id,
                _token: currentUser._token
            })
        }).then(res => {
            if (res?.status === "OK") {
                setComments(res.data);
            }
        })
        commentInputRef.current.value = '';
    }

    return (
        <div className='post-ui-data'>
            {creator && <div className='post-ui-creator'>
                <img src={creator.avatarFile} className='post-ui-creator-avatar' />
                <span className="post-ui-creator-username">{creator.username}</span>
            </div>}
            <span className="post-ui-date">{moment(post.createdAt).fromNow()}</span>
            {post.text ? <>
                <p className="post-ui-text">{post.text}</p>
                {
                    images.length > 0 && <div className="post-ui-image-slider">
                        {images.length !== 1 && <><IoChevronBackCircleOutline onClick={() => setImageIndex(imageIndex === 0 ? images.length - 1 : imageIndex - 1)} className="post-ui-slide-controller post-ui-slide-controller-left" />
                            <IoChevronForwardCircleOutline onClick={() => setImageIndex(images.length - 1 === imageIndex ? 0 : imageIndex + 1)} className="post-ui-slide-controller post-ui-slide-controller-right" /></>}
                        <img className='post-ui-slide-image' src={images[imageIndex]} />
                    </div>
                }
                <div className="post-ui-methods">
                    <div className="post-ui-method-block">
                        {likeStatus ? <IoHeart color='red' onClick={e => handleLike(false)} /> : <IoHeartOutline color='red' onClick={e => handleLike(true)} />}
                        <span className='post-ui-method-count'>{post.likeCount}</span>
                    </div>
                    <div className="post-ui-method-block" onClick={() => setShowComments(!showComments)}>
                        <HiChatBubbleLeftRight color='white' />
                        <span className='post-ui-method-count'>{comments.length}</span>
                    </div>
                </div>
                <div style={showComments ? {} : { display: "none" }} className="post-ui-comments">
                    <div className="post-ui-comments-container">
                        {
                            comments?.length > 0 ?
                                comments.map(comment => <div key={comment._id} className='post-ui-comment-data'>
                                    <img className='post-ui-comment-avatar' src={comment?.user?.avatarFile} alt="" />
                                    <div className="post-ui-comment-texts">
                                        <span className="post-ui-comment-username">{comment.user?.username}</span>
                                        <p className="post-ui-comment-message">{comment.text}</p>
                                    </div>

                                </div>)
                                : <span className='post-ui-comment-empty'>No comments yet</span>
                        }
                    </div>
                    <form onSubmit={handleCommentSubmit} className="post-ui-comment-input-block">
                        <textarea ref={commentInputRef} placeholder="Write a comment.." className="post-ui-comments-input" ></textarea>
                        <IoSend onClick={handleCommentSubmit} className='post-ui-comment-input-send-icon' />
                    </form>
                </div>
            </> : <span className='post-ui-lock'><HiLockClosed /> This content is available only for {post.accessType === "followers" ? "followers" : "people who author is following"}</span>}
        </div>

    )
}

export default Post;
