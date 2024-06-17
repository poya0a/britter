import { atom } from "recoil";
import { useRecoilState } from "recoil";

type ImageCropData = {
  imageCustom: string | ArrayBuffer | null;
  imageSource: string | ArrayBuffer | null;
  imageFile: File | null;
};

const initialImageCropData: ImageCropData = {
  imageCustom: null,
  imageSource: null,
  imageFile: null,
};

export const imageCropState = atom<ImageCropData>({
  key: "imageCropState",
  default: initialImageCropData,
});

export const useImageCrop = () => {
  const [useImageCropState, setUseImageCropState] =
    useRecoilState<ImageCropData>(imageCropState);

  const setImageCustom = (imageCustom: string | ArrayBuffer | null) => {
    setUseImageCropState((prevState) => ({
      ...prevState,
      imageCustom,
    }));
  };

  const setImageSource = (imageSource: string | ArrayBuffer | null) => {
    setUseImageCropState((prevState) => ({
      ...prevState,
      imageSource,
    }));
  };

  const updateImageFile = (imageFile: File | null) => {
    setUseImageCropState((prevState) => ({
      ...prevState,
      imageFile,
    }));
  };

  return {
    useImageCropState,
    setImageCustom,
    setImageSource,
    updateImageFile,
  };
};
