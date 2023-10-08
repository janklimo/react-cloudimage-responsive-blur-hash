import React from "react";
import BackgroundImgComponent from "./background";
import BlurHashComponent from "./blurhash";
import ImgComponent from "./img";
import CloudimageProvider, { CloudimageContext } from "./provider";

const Img = (props = {}) => {
  return (
    <CloudimageContext.Consumer>
      {(context = {}) => <ImgComponent {...props} config={context.config} />}
    </CloudimageContext.Consumer>
  );
};

const BackgroundImg = (props = {}) => {
  return (
    <CloudimageContext.Consumer>
      {(context = {}) => (
        <BackgroundImgComponent {...props} config={context.config} />
      )}
    </CloudimageContext.Consumer>
  );
};

const BlurHash = (props = {}) => {
  return (
    <CloudimageContext.Consumer>
      {(context = {}) => (
        <BlurHashComponent {...props} config={context.config} />
      )}
    </CloudimageContext.Consumer>
  );
};

export default Img;

export { BackgroundImg, BlurHash, CloudimageProvider, Img };
