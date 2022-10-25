import React, { useEffect, useState } from 'react'
import { BsArrowRight } from 'react-icons/bs'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUser, getCurrentUserLocalStorage, selectCurrentUser, UserDetails } from '../../features/current-user/current-user-slice'
import { useFetch } from '../../modules/useFetch'
import "./usercardmini.scss"

const UserCardMini = ({ user, withButtons = {} }: { user: UserDetails, withButtons?: { profile?: boolean, follow?: boolean } }) => {

    const [isFollower, setIsFollower] = useState(undefined);

    const userState = useSelector(selectCurrentUser);

    const dispatch = useDispatch();

    const { request } = useFetch();

    const exists = getCurrentUserLocalStorage();

    useEffect(() => {
        if (exists._id !== user._id) setIsFollower(Boolean(exists.details?.following?.find(obj => obj._id === user._id)))
    }, [userState]);


    async function handleFollowButton() {
        if (isFollower === undefined) return;
        const method = isFollower ? "remove" : "add";
        const secs = {
            _token: exists._token,
            _id: exists._id,
        }
        const res = await request("api/private/content/follower/" + method, {
            body: JSON.stringify({
                ...secs,
                targetId: user._id
            }),
            method: "POST"
        });

        if (res?.status === "OK") {
            dispatch(fetchUser(secs) as any)
        }
    }

    return (
        <div className='usercard-mini'>
            <img src={user.avatarFile} className='usercard-mini-avatar' />
            <div className="usercard-mini-texts">
                <span className="usercard-mini-username">{user.username}</span>
                <span className="usercard-mini-name">{user.name}</span>
            </div>
            {
                <div className="usercard-mini-buttons">
                    {withButtons.profile && <button className='usercard-mini-button usercard-mini-profile' onClick={() => window.location.replace("/profile/" + user.username)}>
                        <span>Profile</span>
                        <BsArrowRight />
                    </button>}
                    {withButtons.follow && isFollower !== undefined && (isFollower ? <button onClick={handleFollowButton} className="usercard-mini-button usercard-mini-unfollow">Unfollow</button> : <button onClick={handleFollowButton} className="usercard-mini-button usercard-mini-follow">Follow</button>)
                    }
                </div>
            }
        </div>
    )
}

export default UserCardMini