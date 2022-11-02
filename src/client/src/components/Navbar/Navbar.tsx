import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getCurrentUserLocalStorage,
  isCurrentUser,
  removeUser,
  selectCurrentUser,
  setUser,
  takeCurrentUser,
} from "../../features/current-user/current-user-slice";
import { BsPlusSquare, BsSearch } from "react-icons/bs";
import "./navbar.scss";
import { selectSearchQuery } from "../../features/search-query/search-query";
import { TbMessageCircle } from "react-icons/tb";
import { Dropdown, Input, Menu, Popover } from "antd";
import {
  getAllMessages,
  toggleMessagesStatus,
} from "../../features/messages/messages-slice";

const Navbar = () => {
  const dispatch = useDispatch();

  const searchInputRef = useRef({} as HTMLInputElement);

  const searchState = useSelector(selectSearchQuery);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (searchState.query && searchInputRef.current)
      searchInputRef.current.value = searchState.query;
  }, [searchState, searchInputRef.current]);

  function logout() {
    dispatch(removeUser());
    window.location.replace("/login");
  }

  function locateToSearchPage(value: string, e: any) {
    const q = value;
    if (q) window.location.replace("/search?query=" + q);
  }

  const DropdownContent = (
    <Menu
      items={[
        {
          label: (
            <a className="navbar-link" href="#" onClick={logout}>
              <span>Logout</span>
            </a>
          ),
          key: "logout",
          danger: true,
        },
      ]}
    />
  );

  const Items = ({ children }: { children?: any }): any => {
    if (isCurrentUser(true) && currentUser.details) {
      const user = getCurrentUserLocalStorage();

      return (
        <>
          <div className="navbar-item">
            <a className="navbar-link" href="/">
              <span>Feed</span>
            </a>
          </div>

          <div className="navbar-item">
            <Input.Search
              onSearch={locateToSearchPage}
              placeholder="Search.."
              enterButton
            />
          </div>

          <div className="navbar-item">
            <a className="navbar-link" href="/new/post">
              <BsPlusSquare size={30} />
            </a>
            <span
              className="navbar-link"
              onClick={() => {
                dispatch(getAllMessages() as any);
              }}
            >
              <TbMessageCircle size={30} />
            </span>
          </div>

          <div className="navbar-item">
            <div className="navbar-item-dropdown">
              <Dropdown overlay={DropdownContent}>
                <a
                  href={`/profile/${currentUser.details.username}`}
                  className="summary"
                >
                  <img
                    className="navbar-avatar"
                    src={currentUser.details.avatarFile}
                  />
                </a>
              </Dropdown>
            </div>
          </div>

          {children}
        </>
      );
    } else {
      return (
        <>
          <div className="navbar-item">
            <a className="navbar-link" href="/">
              Feed
            </a>
          </div>
          <div className="navbar-item">
            <a className="navbar-link" href="/login" onClick={logout}>
              Sign in
            </a>
          </div>
        </>
      );
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-items">
        <Items></Items>
      </div>
    </div>
  );
};

export default Navbar;
