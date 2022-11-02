import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import usernameValidity from "../../modules/username-validity";
import emailValidity from "../../modules/email-validity";
import passwordValidity from "../../modules/password-validity";
import { useFetch } from "../../modules/useFetch";
import "./register.scss";
import forEachChild from "../../modules/forEachChild";
import {
  setUser,
  fetchUser,
} from "../../features/current-user/current-user-slice";
import { Message } from "../../modules/message";

const Register = () => {
  const usernameRef = useRef("");
  const usernameValidityRef = useRef(null as HTMLDivElement);

  const emailRef = useRef("");
  const emailValidityRef = useRef(null as HTMLDivElement);

  const passwordRef = useRef("");
  const passwordValidityRef = useRef(null as HTMLDivElement);

  const { request } = useFetch();
  const dispatch = useDispatch();

  async function register(data: {
    username: string;
    password: string;
    email: string;
  }) {
    const res = await request("api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
    });
    Message(res.status === "OK" ? "success" : "error", res.message);
    if (res.status === "OK") {
      dispatch(setUser({ _token: res._token, _id: res._id }));
      dispatch(
        fetchUser({
          _token: res._token,
          _id: res._id,
          fn: () => window.location.replace("/"),
        }) as any
      );
    }
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    // username validating
    const username = usernameRef.current;
    const usernameValid = usernameValidity(username);
    if (usernameValid.length > 0) return;
    // email validating
    const email = emailRef.current;
    const emailValid = emailValidity(email);
    if (emailValid.length > 0) return;
    // password validating
    const password = passwordRef.current;
    const passwordValid = passwordValidity(password);
    if (passwordValid.length > 0) return;
    // console.log("Created new user");
    // console.log("Error occured while trying to create new user")
    register({ username, email, password });
  }

  async function handleUsernameTyping(username: string) {
    const usernameValid = usernameValidity(username);
    function doThis(element: any) {
      if (element.classList.contains("register-block")) return;
      if (
        usernameValid.find((err) =>
          element.classList.contains("register-" + err)
        )
      ) {
        element.classList.remove("register-valid");
      } else {
        element.classList.add("register-valid");
      }
    }
    forEachChild(usernameValidityRef.current, (element) => {
      if (element.classList.contains("register-length")) {
        forEachChild(element, doThis);
      } else {
        doThis(element);
      }
    });
  }

  function handlePasswordTyping(password: string) {
    const passwordValid = passwordValidity(password);
    forEachChild(passwordValidityRef.current, (element) => {
      if (
        passwordValid.find((err) =>
          element.classList.contains("register-" + err)
        )
      ) {
        element.classList.remove("register-valid");
      } else {
        element.classList.add("register-valid");
      }
    });
  }

  function handleEmailTyping(email: string) {
    const emailValid = emailValidity(email);
    forEachChild(emailValidityRef.current, (element) => {
      if (
        emailValid.find((err) => element.classList.contains("register-" + err))
      ) {
        element.classList.remove("register-valid");
      } else {
        element.classList.add("register-valid");
      }
    });
  }

  return (
    <div className="register">
      <h1>
        Sign Up - <span>Origin</span>
      </h1>
      <form className="register-form">
        <div className="register-input">
          <div className="register-validity-block" ref={usernameValidityRef}>
            <div className="register-length">
              <span className="register-min-length">2 &#62; </span>
              <span className="register-block">Length</span>
              <span className="register-max-length"> &#60; 17</span>
            </div>
            <span className="register-chars">a-z & 0-9</span>
          </div>
          <input
            type="text"
            id="register-username"
            placeholder="username"
            onKeyUp={(e) => handleUsernameTyping(usernameRef.current)}
            onChange={(e) => (usernameRef.current = e.target.value)}
          />
        </div>
        <div className="register-input">
          <div className="register-validity-block" ref={emailValidityRef}>
            <span className="register-invalid">Looks like an email</span>
          </div>
          <input
            type="email"
            id="register-email"
            placeholder="email"
            onKeyUp={(e) => handleEmailTyping(emailRef.current)}
            onChange={(e) => (emailRef.current = e.target.value)}
          />
        </div>
        <div className="register-input">
          <div className="register-validity-block" ref={passwordValidityRef}>
            <span className="register-uppercase">Uppercase</span>
            <span className="register-lowercase">Lowercase</span>
            <span className="register-numbers">Numbers</span>
            <span className="register-min-length">Length &#62; 5</span>
          </div>
          <input
            type="password"
            id="register-password"
            placeholder="password"
            onKeyUp={(e) => handlePasswordTyping(passwordRef.current)}
            onChange={(e) => (passwordRef.current = e.target.value)}
          />
        </div>
        <button className="register-submit-button" onClick={handleSubmit}>
          Sign Up
        </button>
        <span className="register-footer">
          Already registered?{" "}
          <a href="/login" className="prevent-default-a">
            Login
          </a>
        </span>
      </form>
    </div>
  );
};

export default Register;
