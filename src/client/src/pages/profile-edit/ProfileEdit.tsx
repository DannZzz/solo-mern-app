import React, { useEffect, useRef, useState } from 'react'
import { BsPlusSquare, BsXSquare } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom'
import { addAlert } from '../../features/alerts/alertSlice';
import { changeCurrentUserDetail, CurrentUser, UserDetails, fetchUser, getCurrentUserLocalStorage, isCurrentUser, selectCurrentUser } from '../../features/current-user/current-user-slice';
import { useFetch } from '../../modules/useFetch';
import "./profileEdit.scss";

const ProfileEdit = () => {
    const maxChars = 5;
    const { request } = useFetch();
    const dispatch = useDispatch();

    const avatarImageRef = useRef(null as HTMLInputElement);
    const usernameRef = useRef(null as HTMLInputElement);
    const bioRef = useRef(null as HTMLTextAreaElement);
    const nameRef = useRef(null as HTMLInputElement);

    const [selectAvatar, setSelectAvatar] = useState(null as File);

    const charInputRef = useRef(null as HTMLInputElement);

    const localeUser = getCurrentUserLocalStorage()?.details;

    const userState = useSelector(selectCurrentUser);

    const [updateCount, setUpdateCount] = useState(0);

    const [currentChars, setCurrentChars] = useState(localeUser.characteristics || [] as UserDetails['characteristics']);
    useEffect(() => {
        usernameRef.current.placeholder = localeUser.username;
        nameRef.current.value = localeUser.name;
        bioRef.current.value = localeUser.bio
    }, [userState])

    async function handleAvatarChange() {
        const file = avatarImageRef.current?.files?.[0];
        if (!file) return dispatch(addAlert({ endsIn: 4000, message: "Select image to update your avatar", type: "danger" }));
        setSelectAvatar(file);
    }

    async function updateAvatarInBaseReq(file: File) {
        const formdata = new FormData();
        formdata.append("_token", getCurrentUserLocalStorage()._token);
        formdata.append("_id", localeUser._id);
        formdata.append("avatar", file);
        // console.log(formdata);
        const res = await request("/api/upload/user/avatar", {
            method: "POST",
            body: formdata
        })

        if (res.status === "OK") {

            dispatch(changeCurrentUserDetail({ key: 'avatarFile', value: res.avatarFile }))
        };
    }

    async function handleSaveAll() {
        if (selectAvatar) updateAvatarInBaseReq(selectAvatar);
        const data = {
            username: usernameRef.current.value,
            name: nameRef.current.value,
            bio: bioRef.current.value,
            characteristics: currentChars,
        } as any;

        const __ = {
            _token: getCurrentUserLocalStorage()._token,
            _id: getCurrentUserLocalStorage()._id,
        }

        const res = await request("api/update/user/by/field", {
            method: "POST",
            body: JSON.stringify({
                ...__,
                update: data
            })
        })
        if (res?.status === "OK") {
            usernameRef.current.value = "";
        }
        setCurrentChars(currentChars)
        dispatch(fetchUser({ _token: getCurrentUserLocalStorage()._token, _id: localeUser._id }) as any);
        dispatch(addAlert({ type: res.status === "OK" ? "success" : "danger", message: res.message, endsIn: 4000 }))
    }

    const chars = currentChars;

    return (
        <div className="profile-edit">
            <input className='profile-edit-input-hide' ref={avatarImageRef} onChange={handleAvatarChange} id='avatar-input' type="file" maxLength={1} accept="image/*" />
            <div className='profile-edit-edit profile-edit-image-edit'>
                <label htmlFor="avatar-input" className='profile-edit-avatar-image'>
                    <img className='profile-edit-avatar' src={(selectAvatar && URL.createObjectURL(selectAvatar)) || localeUser.avatarFile} alt="user" />
                </label>

            </div>

            <div className="profile-edit-edit profile-edit-username-edit">

                <h3>Username</h3>
                <input maxLength={16} type="text" placeholder='username..' ref={usernameRef} />
            </div>

            <div className="profile-edit-edit profile-edit-name-edit">
                <h3>Name</h3>
                <input maxLength={32} type="text" placeholder='name..' ref={nameRef} />
            </div>

            <div className="profile-edit-edit profile-edit-bio-edit">
                <h3>Bio</h3>
                <textarea maxLength={150} placeholder="bio.." ref={bioRef} ></textarea>
            </div>

            <div className="profile-edit-characteristics">
                <h6>Characteristics {chars.length}/{maxChars}</h6>
                <ul>
                    {chars.length < maxChars && <li className="skill-add">
                        <input placeholder="gorgeous.." ref={charInputRef} type="text" />
                        <BsPlusSquare className='add-button' onClick={() => {
                            if (!charInputRef.current.value) return;
                            setCurrentChars([...currentChars, { text: charInputRef.current.value }]);
                            charInputRef.current.value = "";
                        }} />
                    </li>}
                    {(chars)?.map((obj, i) => <li className='item' key={i}>
                        <span>{obj.text}</span>
                        <BsXSquare className='remove' onClick={() => {
                            setCurrentChars(currentChars.filter((el, ind) => ind !== i));
                        }} />
                    </li>)}
                </ul>
            </div>
            <div className="profile-edit-buttons">
                <button className="save-all" onClick={handleSaveAll}>
                    Save All
                </button>
            </div>
        </div>
    )
}

export default ProfileEdit