import { create } from "zustand";

type ImageCropData = {
  imageCustom: string | ArrayBuffer | null;
  imageSource: string | ArrayBuffer | null;
  imageFile: File | null;
};

interface ImageCropState {
  useImageCropState: ImageCropData;
  setImageCustom: (imageCustom: string | ArrayBuffer | null) => void;
  setImageSource: (imageSource: string | ArrayBuffer | null) => void;
  updateImageFile: (imageFile: File | null) => void;
  reset: () => void;
}

export const useImageCropStore = create<ImageCropState>((set) => ({
  useImageCropState: {
    imageCustom: null,
    imageSource: null,
    imageFile: null,
  },

  setImageCustom: (imageCustom: string | ArrayBuffer | null) => {
    set((state) => ({
      useImageCropState: { ...state.useImageCropState, imageCustom },
    }));
  },

  setImageSource: (imageSource: string | ArrayBuffer | null) => {
    set((state) => ({
      useImageCropState: { ...state.useImageCropState, imageSource },
    }));
  },

  updateImageFile: (imageFile: File | null) => {
    set((state) => ({
      useImageCropState: { ...state.useImageCropState, imageFile },
    }));
  },
  reset: () => {
    set({
      useImageCropState: {
        imageCustom: null,
        imageSource: null,
        imageFile: null,
      },
    });
  },
}));
