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
  const [state, setState] = useRecoilState(imageCropState);

  const setImageCustom = (imageCustom: string | ArrayBuffer | null) => {
    setState((prevState) => ({
      ...prevState,
      imageCustom,
    }));
  };

  const setImageSource = (imageSource: string | ArrayBuffer | null) => {
    setState((prevState) => ({
      ...prevState,
      imageSource,
    }));
  };

  const updateImageFile = (imageFile: File | null) => {
    setState((prevState) => ({
      ...prevState,
      imageFile,
    }));
  };

  return {
    state,
    setImageCustom,
    setImageSource,
    updateImageFile,
  };
};
