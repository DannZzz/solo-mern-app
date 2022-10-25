import classNames from 'classnames'
import React from 'react'
import LeftbarHome from '../../components/Leftbar-home/LeftbarHome'
import RightbarHome from '../../components/Rightbar-home/RightbarHome'
import "./home.scss"

const Home = () => {
    return <div className='Home'>
        <div className='home-main'>
            <LeftbarHome className={classNames('home-main-child', 'home-left')} />

            <div className={classNames('home-main-child', 'home-content')}>

            </div>

            <RightbarHome className={classNames('home-main-child', 'home-right')} />
        </div>
        <div className='home-footer-bar'></div>
    </div>
}

export default Home