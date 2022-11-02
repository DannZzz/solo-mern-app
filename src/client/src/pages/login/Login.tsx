import { Input, Checkbox, Button, Form } from "antd";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";
import {
  fetchUser,
  setUser,
} from "../../features/current-user/current-user-slice";
import { Message } from "../../modules/message";
import { useFetch } from "../../modules/useFetch";
import { UsernamePattern } from "../../modules/username-validity";
import "./login.scss";

const Login = () => {
  const dispatch = useDispatch();

  const { request } = useFetch();

  async function onFinish(values: any) {
    const { username, password } = values;
    if (!username || !password) return;
    const res = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: username?.toLowerCase(),
        password,
      }),
    });

    Message(res.status === "OK" ? "success" : "error", res.message);
    if (res.status === "OK") {
      dispatch(setUser({ _token: res._token, _id: res._id }));
      dispatch(
        fetchUser({
          _token: res._token,
          _id: res._id,
          fn: () => {
            window.location.replace("/");
          },
        }) as any
      );
    }
  }

  return (
    <div className="login">
      <h1 className="login-title">
        Sign In - <span className="login-special-name">Origin</span>
      </h1>

      <Form
        name="login"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        className="login-form"
      >
        <Form.Item
          label="Username"
          className="login-form-item"
          name="username"
          rules={[
            { required: true, message: "Please input your username!" },
            { pattern: UsernamePattern },
          ]}
        >
          <Input style={{ textTransform: "lowercase" }} />
        </Form.Item>

        <Form.Item
          label="Password"
          className="login-form-item"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          className="login-form-item"
          name="remember"
          valuePropName="checked"
          wrapperCol={{ offset: 10, span: 16 }}
        >
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <Form.Item
          className="login-form-item"
          wrapperCol={{ offset: 10, span: 16 }}
        >
          <button className="login-submit-button" type="submit">
            Sign in
          </button>
        </Form.Item>
      </Form>

      {/* <form className="login-form">
        <input
          className="login-input"
          type="text"
          placeholder="username"
          onChange={(e) => (usernameRef.current = e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="password"
          onChange={(e) => (passwordRef.current = e.target.value)}
        />
        <button className="login-submit-button" onClick={login}>
          Sign in
        </button>
        <span>
          Want to create new account?{" "}
          <a href="/register" className="prevent-default-a">
            Register
          </a>
        </span>
      </form> */}
    </div>
  );
};

export default Login;
