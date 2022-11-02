import { Drawer, Input, InputRef, Segmented } from "antd";
import classNames from "classnames";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetch } from "../../modules/useFetch";
import {
  getCurrentUserLocalStorage,
  selectCurrentUser,
} from "../current-user/current-user-slice";
import {
  Messages as Msgs,
  selectMessages,
  setCurrentMessageMemberId,
  setMessagesList,
  setUserThunk,
  toggleMessagesStatus,
  updateUserChat,
} from "./messages-slice";
import "./Messages.scss";
import { Web } from "../../config";
import io from "socket.io-client";
const socket = io(Web);

const Messages = () => {
  const messagesState = useSelector(selectMessages);

  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const messageInputRef = useRef<InputRef>();
  const listRef = useRef<HTMLDivElement>();

  const { request } = useFetch();

  const secs = { _id: currentUser._id, _token: currentUser._token };

  useEffect(() => {
    if (currentUser) {
      socket.emit("connect-message:add", secs);
      socket.removeAllListeners("update-message:list");
      socket.on("update-message:list", (id) => {
        if (messagesState.status === "on") dispatch(updateUserChat(id));
      });
    }
  }, [currentUser]);

  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 500);
  }, [messagesState]);

  function onClose() {
    dispatch(toggleMessagesStatus("off"));
  }

  async function onMessageAddSubmit(e: any) {
    e.preventDefault();
    const msg = messageInputRef?.current?.input.value;

    if (!msg || !msg.trim()) return;

    const res = await request("api/private/content/message/dm/add", {
      method: "POST",
      body: JSON.stringify({
        _id: currentUser._id,
        _token: currentUser._token,
        targetId: messagesState?.current,
        data: {
          text: msg,
          senderId: currentUser._id,
          channelType: "dm",
        },
      }),
    });

    if (res?.status === "OK") {
      messageInputRef.current.input.value = "";
    }
  }
  return (
    <Drawer
      title="Direct Messages"
      placement="right"
      width={500}
      onClose={onClose}
      open={messagesState.status === "on"}
    >
      <div className="messages-drawer">
        {messagesState.list.length > 0 && (
          <Segmented
            onChange={(value) =>
              dispatch(setCurrentMessageMemberId(value.toString()))
            }
            value={messagesState.current}
            className="messages-drawer-users"
            options={messagesState.list.map((message) => {
              return {
                label: (
                  <div key={message.with._id} className="messages-drawer-user">
                    <img src={message?.with?.avatarFile} />
                  </div>
                ),
                value: message.with._id,
              };
            })}
          ></Segmented>
        )}

        <div className="messages-drawer-chat">
          <div className="messages-drawer-chat-container">
            <h3>
              {
                messagesState.list.find(
                  (msg) => messagesState?.current === msg.with._id
                )?.with.username
              }
            </h3>
            <div className="messages-drawer-chat-list">
              {messagesState.list
                .find((msg) => messagesState?.current === msg.with._id)
                ?.messages.map((message, i, arr) => {
                  return (
                    <div
                      ref={arr.length - 1 === i ? listRef : null}
                      key={message._id}
                      className={classNames("messages-drawer-message", {
                        "messages-drawer-current-user":
                          currentUser._id === message.senderId,
                      })}
                    >
                      <div className="messages-drawer-message-text">
                        <span>{message.text}</span>
                        <span className="message-drawer-message-text-date">
                          {moment(message.date).fromNow()}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="messages-drawer-chat-input">
            <Input
              onPressEnter={onMessageAddSubmit}
              type="text"
              placeholder="Send message.."
              ref={messageInputRef}
            />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default Messages;
