import { PlusOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import { Input, Tag, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import "./Tags.scss";

interface TagOptions {
  tags: UserDetails["characteristics"];
  readonly?: boolean;
  maxTags?: number;
  onChange?: (tags: UserDetails["characteristics"]) => any;
}

const Tags = (props: TagOptions) => {
  const [tags, setTags] = useState<UserDetails["characteristics"]>(props.tags);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState("");
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);
  const maxTagLength = 20;
  const { maxTags = 10 } = props;

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [inputValue]);

  if (props.readonly) {
    return (
      <>
        {props.tags.map((tag, i) => (
          <Tag key={i}>{tag.text}</Tag>
        ))}
      </>
    );
  }

  const handleClose = (removedTag: string) => {
    const newTags = tags.filter((tag) => tag.text !== removedTag);
    // console.log(newTags);
    props?.onChange?.(newTags);
    setTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !tags.find((tag) => inputValue === tag.text)) {
      const newTags = [...tags, { text: inputValue }];
      props?.onChange?.(newTags);
      setTags(newTags);
    }
    setInputVisible(false);
    setInputValue("");
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditInputValue(e.target.value);
  };

  const handleEditInputConfirm = () => {
    const newTags = [...tags];
    newTags[editInputIndex].text = editInputValue;
    setTags(newTags);
    props?.onChange?.(newTags);
    setEditInputIndex(-1);
    setInputValue("");
  };

  return (
    <>
      {tags.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag.text}
              size="small"
              className="profile-edit-tag-input"
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          );
        }

        const tagElem = (
          <Tag
            className="profile-edit-edit-tag"
            key={tag.text}
            closable
            onClose={() => handleClose(tag.text)}
          >
            <span
              onDoubleClick={(e) => {
                if (index !== 0) {
                  setEditInputIndex(index);
                  setEditInputValue(tag.text);
                  e.preventDefault();
                }
              }}
            >
              {tag.text.slice(0, maxTagLength)}
            </span>
          </Tag>
        );
        return tagElem;
      })}
      {maxTags > tags.length && inputVisible && (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          className="profile-edit-tag-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}
      {maxTags > tags.length && !inputVisible && (
        <Tag key="newTag" className="site-tag-plus" onClick={showInput}>
          <PlusOutlined /> New Tag
        </Tag>
      )}
    </>
  );
};

export default Tags;
