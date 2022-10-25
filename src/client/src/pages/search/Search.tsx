import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import UserCardMini from '../../components/UserCard-mini/UserCardMini';
import { UserDetails, getCurrentUserLocalStorage } from '../../features/current-user/current-user-slice';
import { setSearchQuery } from '../../features/search-query/search-query';
import { useFetch } from '../../modules/useFetch';
import "./search.scss";

interface Result {
    users: UserDetails[];
    characteristicUsers: UserDetails[];
}

function isEmpty(data: Result) {
    if (Object.keys(data || {}).length === 0) return true;
    if (Object.values(data || {}).every(arr => !arr || arr.length === 0)) return true;

    return false;
}

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Search = () => {
    const dispatch = useDispatch();

    const secs = {
        _token: getCurrentUserLocalStorage()._token,
        _id: getCurrentUserLocalStorage()._id
    }

    let q = useQuery();

    const [result, setResult] = useState({} as Result);
    const { request } = useFetch();

    const searchQuery = q.get("query");

    useEffect(() => {
        dispatch(setSearchQuery({ query: searchQuery }));
        console.log(searchQuery)
        request("api/private/content/search", {
            method: "POST",
            query: { query: searchQuery },
            body: JSON.stringify(secs)
        })
            .then(res => {
                console.log(res);
                if (res && res.status === "OK") {
                    setResult(res.data);
                }
            })
    }, [])

    if (isEmpty(result)) return <div className="search">
        <div className="search-empty">No Results :(</div>
    </div>

    return (
        <div className='search'>
            {result?.users?.length > 0 &&
                <div className="search-group search-users">
                    <h3 className="search-group-name">Matched Users</h3>
                    <div className="search-list">
                        {result.users.map((user, i) => <UserCardMini key={i} withButtons={{ profile: true, follow: true }} user={user} />)}
                    </div>
                </div>
            }

            {
                result?.characteristicUsers?.length > 0 &&
                <div className="search-group search-users">
                    <h3 className="search-group-name">Matched Users by Characteristic</h3>
                    <div className="search-list">
                        {result.characteristicUsers.map((user, i) => <UserCardMini key={i} withButtons={{ profile: true, follow: true }} user={user} />)}
                    </div>
                </div>
            }
        </div>
    )
}

export default Search
