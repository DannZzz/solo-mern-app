import classNames from "classnames";
import React from "react";
import LeftbarHome from "./Leftbar-home/LeftbarHome";
import RightbarHome from "./Rightbar-home/RightbarHome";
import "./home.scss";
import HomeContent from "./HomeContent/HomeContent";

const Home = () => {
  return (
    <div className="Home">
      <div className="home-main">
        <LeftbarHome className={classNames("home-main-child", "home-left")} />

        <HomeContent
          className={classNames("home-main-child", "home-content")}
        />

        <RightbarHome className={classNames("home-main-child", "home-right")} />
      </div>
      <div className="home-footer-bar"></div>
    </div>
  );
};

export default Home;
