import { Input, Modal, Radio, RadioChangeEvent, Upload } from "antd";
import { RcFile, UploadProps } from "antd/lib/upload";
import React, { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { IoCloseOutline, IoImageOutline } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { getCurrentUserLocalStorage } from "../../features/current-user/current-user-slice";
import { Message } from "../../modules/message";
import { useFetch } from "../../modules/useFetch";
import type { UploadFile } from "antd/es/upload/interface";
import "./newpost.scss";

const textMaxLength = 250;
const imagesMaxLength = 10;

const NewPost = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const privacyList = [
    { value: "all", label: "Anyone" },
    { value: "followers", label: "Only my followers" },
    { value: "following", label: "Only accounts I follow" },
  ];

  const [text, setText] = useState("");
  const [privacy, setPrivacy] = useState(privacyList[0].value);

  const { request } = useFetch();

  async function handleSubmit() {
    const user = getCurrentUserLocalStorage();

    if (!text) return Message("error", "You must write a description");

    const formdata = new FormData();
    formdata.append("_token", user._token);
    formdata.append("_id", user._id);
    formdata.append("text", text);
    formdata.append("privacyType", privacy);
    fileList
      .slice(0, imagesMaxLength)
      .filter((image) => image?.type?.startsWith("image/"))
      .forEach(
        (image) => image && formdata.append("attachments", image.originFileObj)
      );

    const res = await request("api/upload/post/new", {
      body: formdata,
      method: "POST",
    });

    if (res) {
      Message(res.status === "OK" ? "success" : "error", res.message);
      if (res.status === "OK")
        window.location.replace("/profile/" + user.details?.username);
    }
  }

  const onChangeRadio = ({ target: { value } }: RadioChangeEvent) => {
    setPrivacy(value);
  };

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1)
    );
  };

  const beforeUpload: UploadProps["beforeUpload"] = (file, files) => {
    if (files.some((file) => !file?.type?.startsWith("image/"))) {
      Message("error", "You can upload only images!");
      return true;
    }
    return false;
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) =>
    setFileList(newFileList);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div className="new-post">
      <h2 className="new-post-title">New Post</h2>

      <div className="new-post-privacy">
        <h4 className="new-post-field-title">This Post can see</h4>
        <div className="new-post-inputs">
          <Radio.Group
            options={privacyList}
            onChange={onChangeRadio}
            value={privacy}
            optionType="button"
            buttonStyle="solid"
          />
        </div>
      </div>

      <div className="new-post-text">
        <h4 className="new-post-field-title">My Post's description is..</h4>
        <Input.TextArea
          placeholder="Today I won nothing.."
          showCount
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={textMaxLength}
          className="new-post-text-input"
        ></Input.TextArea>
      </div>

      <div className="new-post-images">
        <h4 className="new-post-field-title">And I'll put there attachments</h4>
        <div className="new-post-image-list">
          <Upload
            maxCount={imagesMaxLength}
            accept="image/*"
            beforeUpload={beforeUpload}
            listType="picture-card"
            fileList={fileList}
            onPreview={handlePreview}
            multiple
            onChange={handleChange}
          >
            {fileList.length >= imagesMaxLength ? null : uploadButton}
          </Upload>
          <Modal
            open={previewOpen}
            title={previewTitle}
            footer={null}
            onCancel={handleCancel}
          >
            <img alt="" style={{ width: "100%" }} src={previewImage} />
          </Modal>
        </div>
      </div>

      <div className="new-post-buttons">
        <button
          className="new-post-reset-button"
          onClick={() => {
            setFileList([]);
            setText("");
          }}
        >
          Reset
        </button>
        <button className="new-post-post-button" onClick={handleSubmit}>
          Post
        </button>
      </div>
    </div>
  );
};

export default NewPost;
