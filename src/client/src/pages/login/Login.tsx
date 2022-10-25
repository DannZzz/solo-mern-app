import React, { useRef } from 'react'
import { useDispatch } from 'react-redux';
import { addAlert } from '../../features/alerts/alertSlice';
import { fetchUser, setUser } from '../../features/current-user/current-user-slice';
import { useFetch } from '../../modules/useFetch';
import "./login.scss"

const Login = () => {
    const usernameRef = useRef('');
    const passwordRef = useRef('');
    const dispatch = useDispatch();

    const { request } = useFetch();

    async function login(e: any) {
        e.preventDefault();
        if (!usernameRef.current || !passwordRef.current) return;
        const res = await request("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                username: usernameRef.current,
                password: passwordRef.current
            })
        });

        dispatch(addAlert({ type: res.status === "OK" ? "success" : "danger", message: res.message, endsIn: 4000 }))
        if (res.status === "OK") {
            dispatch(setUser({ _token: res._token, _id: res._id }));
            dispatch(fetchUser({
                _token: res._token,
                _id: res._id,
                fn: () => {
                    window.location.replace("/")
                }
            }) as any)
        }
    }

    return (
        <div className='login'>
            <h1 className='login-title'>Sign In - <span className='login-special-name'>Origin</span></h1>
            <form className='login-form'>
                <input className='login-input' type="text" placeholder='username' onChange={(e) => usernameRef.current = e.target.value} />
                <input className='login-input' type="password" placeholder='password' onChange={(e) => passwordRef.current = e.target.value} />
                <button className="login-submit-button" onClick={login}>Sign in</button>
                <span >Want to create new account? <a href="/register" className='prevent-default-a' >Register</a></span>
            </form>
        </div>
    )
}

export default Login