import sharp from "sharp";

("use strict");

const m_WEBP_OPTS = Object.freeze({
  alphaQuality: 95, // 透明通道压缩质量 (max 100)
  effort: 6, // 允许 sharp 使用的 CPU 资源量，偏重质量 6 (max 6)
  quality: 90, // 压缩质量，偏重质量 90 (max 100)
  smartSubsample: true, // 自动 YUV 4:2:0 子采样
});
const m_WEBP_ADJUST_OPT = Object.freeze({
  NONE: 1, // 不变
  CROP: 2, // 裁剪或填充
  RESIZE: 3, // 缩放
});
const m_WEBP_ADJUST_POS = Object.freeze({
  CENTER: 0,
  TOP: 1,
  LEFT: 1 << 2,
  BOTTOM: 1 << 3,
  RIGHT: 1 << 4,
});

async function imgMeta(buffer) {
  return await sharp(Buffer.from(buffer)).metadata();
}

async function toWebpFile(
  buffer,
  file,
  lossless = false,
  width = { resize: m_WEBP_ADJUST_OPT.NONE, size: 0 },
  height = { resize: m_WEBP_ADJUST_OPT.NONE, size: 0 },
  position = m_WEBP_ADJUST_POS.CENTER
) {
  await sharp(Buffer.from(await toWebp(buffer, lossless, width, height, position))).toFile(file);
}

// position: 或操作连接的几个位置，上、下、左、右、左上、左下、右上、右下
//           上: m_WEBP_ADJUST_POS.TOP
//           左上: m_WEBP_ADJUST_POS.LEFT | m_WEBP_ADJUST_POS.TOP
// 错误则抛出异常
async function toWebp(
  buffer,
  lossless = false,
  width = { resize: m_WEBP_ADJUST_OPT.NONE, size: 0 },
  height = { resize: m_WEBP_ADJUST_OPT.NONE, size: 0 },
  position = m_WEBP_ADJUST_POS.CENTER
) {
  const image = sharp(Buffer.from(buffer));
  const { width: imgWidth, height: imgHeight } = await image.metadata();
  const widthTo = parseInt(width.size > 0 ? width.size : imgWidth);
  const heightTo = parseInt(height.size > 0 ? height.size : imgHeight);
  const transparent = Object.freeze({ r: 0, g: 0, b: 0, alpha: 0 });

  if (m_WEBP_ADJUST_OPT.CROP === width.resize) {
    const diff = Math.abs(widthTo - imgWidth);
    let left = Math.round(diff / 2);
    let right = left;

    if (0 !== (m_WEBP_ADJUST_POS.LEFT & position)) {
      left = 0;
      right = diff;
    }

    if (0 !== (m_WEBP_ADJUST_POS.RIGHT & position)) {
      left = diff;
      right = 0;
    }

    if (widthTo < imgWidth) {
      await image.extract({ left, top: 0, width: widthTo, height: imgHeight });
    }

    if (widthTo > imgWidth) {
      await image.extend({ top: 0, left, bottom: 0, right, background: transparent });
    }
  }

  if (m_WEBP_ADJUST_OPT.CROP === height.resize) {
    const diff = Math.abs(heightTo - imgHeight);
    let top = Math.round(diff / 2);
    let bottom = top;

    if (0 !== (m_WEBP_ADJUST_POS.TOP & position)) {
      top = 0;
      bottom = diff;
    }

    if (0 !== (m_WEBP_ADJUST_POS.BOTTOM & position)) {
      top = diff;
      bottom = 0;
    }

    if (heightTo < imgHeight) {
      await image.extract({ left: 0, top, width: imgWidth, height: heightTo });
    }

    if (heightTo > imgHeight) {
      await image.extend({ top, left: 0, bottom, right: 0, background: transparent });
    }
  }

  if (m_WEBP_ADJUST_OPT.RESIZE === width.resize || m_WEBP_ADJUST_OPT.RESIZE === height.resize) {
    await image.resize({
      fit: sharp.fit.outside,
      position: sharp.position.bottom,
      gravity: sharp.gravity.south,
      width: widthTo,
      height: heightTo,
    });
  }

  return await image.webp(true === lossless ? { lossless: true } : m_WEBP_OPTS).toBuffer();
}

export { imgMeta, toWebp, toWebpFile, m_WEBP_ADJUST_OPT as webpOpt, m_WEBP_ADJUST_POS as webpPos };
