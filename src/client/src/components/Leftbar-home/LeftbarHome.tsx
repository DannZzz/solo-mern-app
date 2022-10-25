import React from 'react'
import { IoEarthOutline } from "react-icons/io5"
import "./leftbarhome.scss"

const LeftbarHome = ({ className }: { className: string }) => {
    return (
        <div className={className}>
            <div className=" paths">
                <div className="home-left-path home-left-feed">
                    <span>Feed</span>
                    <IoEarthOutline />
                </div>
            </div>
        </div>
    )
}

export default LeftbarHome