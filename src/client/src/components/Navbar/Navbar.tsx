import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUserLocalStorage, isCurrentUser, removeUser, selectCurrentUser, setUser, takeCurrentUser } from '../../features/current-user/current-user-slice'
import { BsSearch } from "react-icons/bs"
import "./navbar.scss"
import { selectSearchQuery } from '../../features/search-query/search-query'
import { IoCloudUploadOutline } from 'react-icons/io5'
import { setOverlayContent } from '../../features/overlay-content/overlay-content-slice'

const Navbar = () => {
    const dispatch = useDispatch();

    const searchInputRef = useRef({} as HTMLInputElement);

    const searchState = useSelector(selectSearchQuery);
    const currentUser = useSelector(selectCurrentUser)

    useEffect(() => {
        if (searchState.query && searchInputRef.current) searchInputRef.current.value = searchState.query;
    }, [searchState, searchInputRef.current])

    function logout() {
        dispatch(removeUser());
        window.location.replace("/login")
    }

    function locateToSearchPage(e: any) {
        e.preventDefault();
        const q = searchInputRef.current.value;
        if (q) window.location.replace("/search?query=" + q);
    }

    const Items = ({ children }: { children?: any }): any => {
        if (isCurrentUser(true) && currentUser.details) {
            const user = getCurrentUserLocalStorage();

            return <>
                <div className="navbar-item">
                    <a className='navbar-link' href="/"><span>Home</span></a>
                </div>

                <div className="navbar-item">
                    <form className="navbar-input-field" onSubmit={locateToSearchPage}>
                        <BsSearch className="search-icon" onClick={locateToSearchPage} />
                        <input ref={searchInputRef} type="text" placeholder='Search..' />
                    </form>
                </div>

                <div className="navbar-item">
                    <a className='navbar-link' href="/new/post">
                        <span>Post</span>
                        <IoCloudUploadOutline />
                    </a>
                </div>

                <div className="navbar-item">
                    <div className='navbar-item-dropdown'>
                        <a href={`/profile/${currentUser.details.username}`} className='summary'>
                            <span>{currentUser.details.username}</span>
                            <img className='' src={currentUser.details.avatarFile} />
                        </a>
                        <div className="dropdown-items">
                            <a className='navbar-link' href="#" onClick={logout}><span>Logout</span></a>
                        </div>
                    </div>
                </div>

                {children}
            </>
        } else {
            return <>
                <div className="navbar-item">
                    <a className='navbar-link' href="/">Home</a>
                </div>
                <div className="navbar-item">
                    <a className='navbar-link' href="/login" onClick={logout}>Login</a>
                </div>
            </>
        }
    }

    return <div className='navbar'>
        <div className="navbar-items">
            <Items></Items>
        </div>
    </div>
}

export default Navbar