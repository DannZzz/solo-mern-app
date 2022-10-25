import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import AlertBox from './features/alerts/AlertBox';
import { selectAlerts } from './features/alerts/alertSlice';
import { fetchUser, getCurrentUserLocalStorage, isCurrentUser } from './features/current-user/current-user-slice';
import Home from './pages/home/Home';
import Login from './pages/login/Login';
import NewPost from './pages/new-post/NewPost';
import ProfileEdit from './pages/profile-edit/ProfileEdit';
import Profile from './pages/profile/Profile';
import Register from './pages/register/Register';
import Search from './pages/search/Search';
import './App.scss';
import OverlayContent from './features/overlay-content/OverlayContent';

function App() {
  const alerts = useSelector(selectAlerts);

  const dispatch = useDispatch();
  const [s, setS] = useState(0);
  useEffect(() => {
    const data = getCurrentUserLocalStorage();
    dispatch(fetchUser({ _id: data?._id, _token: data?._token }) as any);
  }, [])

  const ProtectedRoute = ({ children }: any): any => {
    if (!isCurrentUser()) {
      return <Navigate to="/login" />
    } else {
      return children;
    }
  }

  return (
    <BrowserRouter>
      <Navbar />
      <OverlayContent />
      <div className='app-content'>
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="new/post" element={<ProtectedRoute><NewPost /></ProtectedRoute>} />
            <Route path="user/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
            <Route path='profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path='profile/:username' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path='search' element={<ProtectedRoute><Search /></ProtectedRoute>} />
          </Route>
        </Routes>
        {alerts.length > 0 &&
          <div className='main-alerts'>
            {alerts.map(alertState => <AlertBox key={alertState.id} type={alertState.type} id={alertState.id} message={alertState.message} endsIn={alertState.endsIn} title={alertState.title} />)}
          </div>}
      </div>
    </BrowserRouter>
  );
}

export default App;
