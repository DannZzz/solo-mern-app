import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeOverlayContent, selectOverlayContent } from './overlay-content-slice';
import "./overlaycontent.scss";

const OverlayContent = () => {
    const dispatch = useDispatch();
    const overlay = useSelector(selectOverlayContent);

    function handleClick(e: any) {
        if (e.target.classList.contains("overlay-content")) {
            dispatch(removeOverlayContent());
        }
    }

    return overlay.status === "on" ?
        <div className="overlay-content" onClick={handleClick}>
            <div className="overlay-content-container">
                {overlay.content}
            </div>
        </div> : <></>

}

export default OverlayContent