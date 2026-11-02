import { CONSTANTS, generateURL, getImgSRC } from 'cloudimage-responsive-utils';

const { DEVICE_PIXEL_RATIO_LIST } = CONSTANTS;

/**
 * cloudimage-responsive-utils only computes sizes for the pixel ratios in
 * DEVICE_PIXEL_RATIO_LIST ([1, 1.5, 2]). A device at any other ratio (3 on
 * most phones, 1.25 on many laptops) matched nothing, so its src carried no
 * w or h and Cloudimage served the full original. Use the smallest supported
 * ratio that still covers the device, or the largest one.
 */
export const nearestDevicePixelRatio = (devicePixelRatio = 1) => {
  const ratios = [...DEVICE_PIXEL_RATIO_LIST].sort((a, b) => a - b);

  return ratios.find((ratio) => ratio >= devicePixelRatio) || ratios[ratios.length - 1];
};

/**
 * Never ask for more than the original is wide. A wide container times the
 * pixel ratio can exceed the original many times over (a 629px wide image
 * requested at w=3000&h=12333), which Cloudimage rejects with 422 before
 * org_if_sml can apply, and every size above the original is a separate
 * cached variant of the same pixels anyway.
 */
export const capSize = (size = {}, maxWidth) => {
  if (!maxWidth || !size.width || size.width <= maxWidth) return size;

  const scale = maxWidth / size.width;

  return {
    ...size,
    width: maxWidth,
    height: size.height && Math.round(size.height * scale),
  };
};

// org_if_sml only guards w and h, so it is noise on a URL that has neither.
const withoutEnlargementGuard = (params = {}) => {
  const { org_if_sml, ...rest } = params;

  return rest;
};

/**
 * Rebuilds the URLs processReactNode produced, with the fixes above applied.
 * Adaptive (sizes prop) and SVG images are returned untouched.
 */
export const constrainURLs = (data, { config = {}, maxWidth, devicePixelRatio } = {}) => {
  if (!data || !data.sizes || !data.imgProps || data.imgProps.adaptive) return data;

  const [src, svg] = getImgSRC(data.imgProps.imgNodeSRC, config.baseURL);

  if (svg) return data;

  const containerProps = {
    ...data,
    sizes: data.sizes.map((size) => capSize(size, maxWidth)),
  };

  const urlFor = (ratio) => {
    const size = containerProps.sizes[DEVICE_PIXEL_RATIO_LIST.indexOf(ratio)] || {};
    const sized = size.width || size.height;
    const urlConfig = sized
      ? config
      : { ...config, params: withoutEnlargementGuard(config.params) };

    // generateURL always appends a separator, which dangles when no
    // parameters follow it.
    return generateURL({
      src,
      params: data.imgProps.params,
      config: urlConfig,
      containerProps,
      devicePixelRatio: ratio,
    }).replace(/[?&]$/, '');
  };

  const ratios = config.devicePixelRatioList || DEVICE_PIXEL_RATIO_LIST;

  return {
    ...data,
    sizes: containerProps.sizes,
    cloudimgURL: urlFor(nearestDevicePixelRatio(devicePixelRatio)),
    cloudimgSRCSET: ratios.map((ratio) => ({ dpr: ratio.toString(), url: urlFor(ratio) })),
  };
};
