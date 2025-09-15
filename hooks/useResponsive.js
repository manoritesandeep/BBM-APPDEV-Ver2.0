import { useState, useEffect } from "react";
import { Dimensions, PixelRatio } from "react-native";
import {
  getAccessibleFontSize,
  getScreenData,
  getOrientation,
  getDeviceSize,
  getComponentSizes,
} from "../constants/responsive";

export const useResponsive = () => {
  const [screenData, setScreenData] = useState(getScreenData());
  const [fontScale, setFontScale] = useState(PixelRatio.getFontScale());

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      setScreenData(getScreenData());
      setFontScale(PixelRatio.getFontScale());
    });

    return () => subscription?.remove();
  }, []);

  return {
    ...screenData,
    fontScale,
    getAccessibleFontSize: (size, options) =>
      getAccessibleFontSize(size, options),
    componentSizes: getComponentSizes(screenData.orientation),
  };
};

export const useFontScale = () => {
  const [fontScale, setFontScale] = useState(PixelRatio.getFontScale());

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      setFontScale(PixelRatio.getFontScale());
    });

    return () => subscription?.remove();
  }, []);

  return fontScale;
};

export const useDeviceOrientation = () => {
  // Simple, reliable orientation detection without complex initialization
  const [orientation, setOrientation] = useState(() => {
    try {
      const { width, height } = Dimensions.get("window");
      return width > height ? "landscape" : "portrait";
    } catch {
      return "portrait";
    }
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      try {
        const newOrientation =
          window.width > window.height ? "landscape" : "portrait";
        setOrientation(newOrientation);
      } catch (error) {
        console.warn("Error updating orientation:", error);
      }
    });

    return () => subscription?.remove();
  }, []);

  return {
    orientation,
    isLandscape: orientation === "landscape",
    isPortrait: orientation === "portrait",
  };
};
