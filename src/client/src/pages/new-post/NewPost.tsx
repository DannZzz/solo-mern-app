import React, { useState } from 'react'
import { IoCloseOutline, IoImageOutline } from 'react-icons/io5';
import { useDispatch } from 'react-redux';
import { addAlert } from '../../features/alerts/alertSlice';
import { getCurrentUserLocalStorage } from '../../features/current-user/current-user-slice';
import { useFetch } from '../../modules/useFetch';
import "./newpost.scss"

const textMaxLength = 250;
const imagesMaxLength = 4;

const NewPost = () => {
    const imageTemplate = [null, null, null, null] as any;
    const privacyList = [{ type: 'all', label: "Anyone" }, { type: 'followers', label: "Only my followers" }, { type: "following", label: "Only accounts I follow" }];

    const [text, setText] = useState('');
    const [privacy, setPrivacy] = useState(privacyList[0].type);
    const [images, setImages] = useState(imageTemplate as File[]);

    const dispatch = useDispatch();
    const { request } = useFetch();

    async function handleSubmit() {
        const user = getCurrentUserLocalStorage();

        if (!text) return dispatch(addAlert({ endsIn: 3000, message: "You mush write a description", type: "danger" }))

        const formdata = new FormData();
        formdata.append("_token", user._token);
        formdata.append("_id", user._id);
        formdata.append("text", text);
        formdata.append("privacyType", privacy)
        images.forEach(image => image && formdata.append("attachments", image));

        const res = await request("api/upload/post/new", {
            body: formdata,
            method: "POST",
        })

        if (res) {
            dispatch(addAlert({ endsIn: 3000, message: res.message, type: res.status === "OK" ? "success" : "danger" }))
            if (res.status === "OK") window.location.replace("/profile/" + user.details?.username)
        }
    }

    return (
        <div className='new-post'>
            <h2 className="new-post-title">New Post</h2>

            <div className="new-post-privacy">
                <h4 className="new-post-field-title">This Post can see</h4>
                <div className="new-post-inputs">

                    {privacyList.map((type, i) => {
                        return <div key={i} className="new-post-checkbox-div">
                            <input className='new-post-input-radio' onClick={() => setPrivacy(type.type)} type="radio" id={`radio-${type.type}`} name="post-privacy" checked={type.type === privacy} />
                            <label className='new-post-input-label' htmlFor={`radio-${type.type}`}>{type.label}</label>
                        </div>
                    })}
                </div>
            </div>

            <div className="new-post-text">
                <h4 className='new-post-field-title'>My Post's description is..</h4>
                <textarea placeholder='Today I won nothing..' value={text} onChange={e => textMaxLength >= e.target.value.length && setText(e.target.value)} rows={5} className="new-post-text-input"></textarea>
                <span className="new-post-text-length">{textMaxLength - text.length}</span>
            </div>

            <div className="new-post-images">
                <h4 className="new-post-field-title">And I'll put there attachments</h4>
                <div className='new-post-image-list'>
                    {
                        images.map((image, i) => {
                            return <div style={{ gridArea: `image-${i}` }} key={i} className="new-post-image-data">
                                {image ? <>
                                    {/* <div className="image-select"> */}
                                    <img className='new-post-image' src={URL.createObjectURL(image)} />
                                    <IoCloseOutline className='new-post-remove' onClick={() => setImages(images.map((_, index) => index === i ? null : _))} />
                                    {/* </div> */}
                                </> : <>
                                    <input onChange={e => {
                                        if (!e.target?.files?.[0]) return;
                                        const newImages = [...images];
                                        newImages[i] = e.target.files[0];
                                        setImages(newImages);
                                    }} className='new-post-image-input' type="file" id={"image-" + i} accept='image/*' />

                                    <label htmlFor={'image-' + i} className="new-post-image-select">
                                        <div>
                                            <IoImageOutline size={30} />
                                        </div>
                                    </label>
                                </>
                                }
                            </div>
                        })}
                </div>
            </div>

            <div className="new-post-buttons">
                <button className='new-post-reset-button' onClick={() => {
                    setImages(imageTemplate);
                    setText("");
                }}>Reset</button>
                <button className="new-post-post-button" onClick={handleSubmit}>Post</button>
            </div>
        </div >
    )
}

export default NewPost

