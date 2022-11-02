import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import {
  fetchUser,
  getCurrentUserLocalStorage,
  isCurrentUser,
} from "./features/current-user/current-user-slice";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import NewPost from "./pages/new-post/NewPost";
import ProfileEdit from "./pages/profile-edit/ProfileEdit";
import Profile from "./pages/profile/Profile";
import Register from "./pages/register/Register";
import Search from "./pages/search/Search";
import OverlayContent from "./features/overlay-content/OverlayContent";
import "./App.scss";
import PostPage from "./pages/post-page/PostPage";
import { Result } from "antd";
import Messages from "./features/messages/Messages";

function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const data = getCurrentUserLocalStorage();
    dispatch(fetchUser({ _id: data?._id, _token: data?._token }) as any);
  }, []);

  const ProtectedRoute = ({ children }: any): any => {
    if (!isCurrentUser()) {
      return (
        <Result
          status="403"
          className="page-error-container"
          title="403"
          subTitle="Sorry, you are not authorized to access this page."
          extra={
            <a href="/login">
              <button>Sign in</button>
            </a>
          }
        />
      );
    } else {
      return children;
    }
  };

  return (
    <BrowserRouter>
      <Navbar />
      <OverlayContent />
      <Messages />

      <div className="app-content">
        <Routes>
          <Route path="/">
            <Route
              index
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="new/post"
              element={
                <ProtectedRoute>
                  <NewPost />
                </ProtectedRoute>
              }
            />
            <Route
              path="user/edit"
              element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="post/:id" element={<PostPage />} />
            <Route
              path="profile/:username"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="search"
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
