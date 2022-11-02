import { Input } from "antd";
import type { InputRef } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Tags from "../../components/Tags/Tags";
import {
  changeCurrentUserDetail,
  CurrentUser,
  fetchUser,
  getCurrentUserLocalStorage,
  isCurrentUser,
  selectCurrentUser,
} from "../../features/current-user/current-user-slice";
import { Message } from "../../modules/message";
import { useFetch } from "../../modules/useFetch";
import "./profileEdit.scss";
import type { TextAreaRef } from "antd/lib/input/TextArea";

const ProfileEdit = () => {
  const maxChars = 10;
  const { request } = useFetch();
  const dispatch = useDispatch();

  const avatarImageRef = useRef<InputRef>(null);
  const usernameRef = useRef<InputRef>(null);
  const bioRef = useRef<TextAreaRef>(null);
  const nameRef = useRef<InputRef>(null);

  const [selectAvatar, setSelectAvatar] = useState(null as File);

  const charInputRef = useRef<InputRef>(null);

  const localeUser = getCurrentUserLocalStorage()?.details;

  const userState = useSelector(selectCurrentUser);

  const [currentChars, setCurrentChars] = useState<
    UserDetails["characteristics"]
  >(localeUser.characteristics || []);

  useEffect(() => {
    usernameRef.current.input.value = localeUser.username;
    nameRef.current.input.value = localeUser.name;
    bioRef.current.resizableTextArea.textArea.value = localeUser.bio;
  });

  async function handleAvatarChange() {
    const file = avatarImageRef.current?.input?.files?.[0];
    if (!file) return Message("error", "Select image to update your avatar");
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
      body: formdata,
    });

    if (res.status === "OK") {
      dispatch(
        changeCurrentUserDetail({ key: "avatarFile", value: res.avatarFile })
      );
    }
  }

  function onCharacteristicsChange(tags: UserDetails["characteristics"]) {
    setCurrentChars(tags);
  }

  async function handleSaveAll() {
    if (selectAvatar) updateAvatarInBaseReq(selectAvatar);
    const data = {
      username: usernameRef.current.input.value,
      name: nameRef.current.input.value,
      bio: bioRef.current.resizableTextArea.textArea.value,
      characteristics: currentChars,
    } as any;
    if (data.username === localeUser.username) delete data.username;

    const __ = {
      _token: getCurrentUserLocalStorage()._token,
      _id: getCurrentUserLocalStorage()._id,
    };

    const res = await request("api/update/user/by/field", {
      method: "POST",
      body: JSON.stringify({
        ...__,
        update: data,
      }),
    });
    if (res?.status === "OK") {
      usernameRef.current.input.value = "";
    }
    setCurrentChars(currentChars);
    dispatch(
      fetchUser({
        _token: getCurrentUserLocalStorage()._token,
        _id: localeUser._id,
      }) as any
    );
    Message(res.status === "OK" ? "success" : "error", res.message);
  }

  const chars = currentChars;

  return (
    <div className="profile-edit">
      <Input
        className="profile-edit-input-hide"
        ref={avatarImageRef}
        onChange={handleAvatarChange}
        id="avatar-input"
        type="file"
        maxLength={1}
        accept="image/*"
      />
      <div className="profile-edit-edit profile-edit-image-edit">
        <label htmlFor="avatar-input" className="profile-edit-avatar-image">
          <img
            className="profile-edit-avatar"
            src={
              (selectAvatar && URL.createObjectURL(selectAvatar)) ||
              localeUser.avatarFile
            }
            alt="user"
          />
        </label>
      </div>

      <div className="profile-edit-edit profile-edit-username-edit">
        <h3>Username</h3>
        <Input
          showCount
          maxLength={16}
          type="text"
          placeholder={localeUser?.username || "username.."}
          ref={usernameRef}
        />
      </div>

      <div className="profile-edit-edit profile-edit-name-edit">
        <h3>Name</h3>
        <Input
          showCount
          maxLength={32}
          type="text"
          placeholder={localeUser?.name || "name.."}
          ref={nameRef}
        />
      </div>

      <div className="profile-edit-edit profile-edit-bio-edit">
        <h3>Bio</h3>
        <Input.TextArea
          showCount
          maxLength={150}
          placeholder={localeUser?.bio || "bio.."}
          ref={bioRef}
        />
      </div>

      <div className="profile-edit-characteristics">
        <h6>
          Characteristics {chars.length}/{maxChars}
        </h6>
        <div className="profile-edit-characteristics-container">
          <Tags
            maxTags={maxChars}
            onChange={onCharacteristicsChange}
            tags={chars}
          />
        </div>
      </div>
      <div className="profile-edit-buttons">
        <button className="save-all" onClick={handleSaveAll}>
          Save All
        </button>
      </div>
    </div>
  );
};

export default ProfileEdit;
