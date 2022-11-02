import Modal from "antd/lib/modal/Modal";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  removeOverlayContent,
  selectOverlayContent,
} from "./overlay-content-slice";
import "./overlaycontent.scss";

const OverlayContent = () => {
  const dispatch = useDispatch();
  const overlay = useSelector(selectOverlayContent);

  function handleClick(e: any) {
    if (e.target.classList.contains("overlay-content")) {
      dispatch(removeOverlayContent());
    }
  }

  function handleOk(e: any) {
    overlay?.onOk?.(e, () => {
      dispatch(removeOverlayContent());
    });
  }

  function handleCancel(e: any) {
    overlay?.onCancel?.(e);
    dispatch(removeOverlayContent());
  }

  return (
    <Modal
      open={overlay.status === "on"}
      onOk={handleOk}
      onCancel={handleCancel}
      title={overlay.title}
      width={overlay.width}
      footer={overlay.footer}
      centered={overlay.centered}
    >
      {overlay.content}
    </Modal>
  );
};

export default OverlayContent;
