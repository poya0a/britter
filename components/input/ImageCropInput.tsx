"use client";
import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useImageCrop } from "@hooks/useImageCrop";
import { useScrollLock } from "@hooks/useScrollLock";
import commonStyles from "@styles/components/_common.module.scss";

export default function ImageCropInput() {
  const { useImageCropState, setImageCustom, setImageSource, updateImageFile } =
    useImageCrop();
  const { toggleScrollLock } = useScrollLock();

  const imgRef = useRef<HTMLImageElement>(null);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [crop, setCrop] = useState<Crop>();

  const handleSaveImage = () => {
    if (completedCrop && imgRef.current) {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelCrop = {
        x: completedCrop.x * scaleX,
        y: completedCrop.y * scaleY,
        width: completedCrop.width * scaleX,
        height: completedCrop.height * scaleY,
      };

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], "cropped_image.jpg", {
              type: "image/jpeg",
            });
            updateImageFile(croppedFile);
            setImageSource(URL.createObjectURL(croppedFile));
            toggleScrollLock(false);
          } else {
            console.error("Failed to create blob from canvas");
          }
        }, "image/jpeg");
      }
    }
  };

  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };

  const onClickCancel = () => {
    toggleScrollLock(false);
    setImageCustom("");
  };

  return (
    <div className={commonStyles.imageCrop}>
      <ReactCrop
        crop={crop}
        onChange={handleCropChange}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={1}
        circularCrop
      >
        <img
          ref={imgRef}
          src={useImageCropState.imageCustom as string}
          alt="selected"
        />
      </ReactCrop>
      <p>드래그하여 이미지를 잘라주세요.</p>
      <div className={commonStyles.imageCropButton}>
        <button
          className={`button ${commonStyles.buttonWhite}`}
          onClick={onClickCancel}
        >
          취 소
        </button>
        <button
          className={`button ${commonStyles.buttonBlue}`}
          onClick={handleSaveImage}
        >
          저 장
        </button>
      </div>
    </div>
  );
}
