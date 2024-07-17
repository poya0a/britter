"use client";
import React, { useState, useRef } from "react";
import ReactCrop, { type Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useImageCrop } from "@hooks/useImageCrop";
import { useScrollLock } from "@hooks/useScrollLock";
import styles from "@styles/components/_input.module.scss";
import buttonStyles from "@styles/components/_button.module.scss";

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
            const maxSizeBytes = 2 * 1024 * 1024;
            if (blob.size > maxSizeBytes) {
              resizeImage(blob, maxSizeBytes);
            } else {
              processCroppedImage(blob);
            }
          } else {
            console.error("Failed to create blob from canvas");
          }
        }, "image/jpeg");
      }
    }
  };

  const resizeImage = (originalBlob: Blob, maxSizeBytes: number) => {
    const image = new Image();
    image.src = URL.createObjectURL(originalBlob);

    image.onload = () => {
      let width = image.width;
      let height = image.height;
      let quality = 0.92;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const resize = () => {
        const scale = Math.sqrt(maxSizeBytes / originalBlob.size);
        width *= scale;
        height *= scale;

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (resizedBlob) => {
            if (resizedBlob) {
              if (resizedBlob.size <= maxSizeBytes || quality < 0.5) {
                processCroppedImage(resizedBlob);
              } else {
                quality *= 0.9;
                resize();
              }
            } else {
              console.error("Failed to resize image blob");
            }
          },
          "image/jpeg",
          quality
        );
      };

      resize();
    };
  };

  const processCroppedImage = (croppedBlob: Blob) => {
    const url = new URL(useImageCropState.imageCustom as string);
    const originalFileName: string =
      url.pathname.split("/").pop() || "cropped_image";
    const originalFileType = croppedBlob.type;

    const croppedFile = new File([croppedBlob], `${originalFileName}.jpg`, {
      type: originalFileType,
    });
    updateImageFile(croppedFile);
    setImageSource(URL.createObjectURL(croppedFile));
    toggleScrollLock(false);
  };

  const handleCropChange = (newCrop: Crop) => {
    setCrop(newCrop);
  };

  const onClickCancel = () => {
    toggleScrollLock(false);
    setImageCustom("");
  };

  return (
    <div className={styles.imageCrop}>
      <ReactCrop
        crop={crop}
        onChange={handleCropChange}
        onComplete={(c) => setCompletedCrop(c)}
        aspect={1}
        style={{ borderRadius: "5px" }}
      >
        <img
          ref={imgRef}
          src={useImageCropState.imageCustom as string}
          alt="selected"
        />
      </ReactCrop>
      <p>드래그하여 이미지를 잘라주세요.</p>
      <div className={styles.imageCropButton}>
        <button
          className={`button ${buttonStyles.buttonWhite}`}
          onClick={onClickCancel}
        >
          취 소
        </button>
        <button
          className={`button ${buttonStyles.buttonBlue}`}
          onClick={handleSaveImage}
        >
          저 장
        </button>
      </div>
    </div>
  );
}
