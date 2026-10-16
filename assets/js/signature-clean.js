/** Turn a photo of a signature into ink on a clear background. */
function cleanSignatureCanvas(source) {
  const maxSide = 1000;
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = image.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const light = 0.299 * red + 0.587 * green + 0.114 * blue;
    const color = max === 0 ? 0 : (max - min) / max;
    let ink = 0;
    if (light < 175 || color > 0.22) {
      ink = light > 210 ? (235 - light) / 40 : 1;
    } else if (light < 235) {
      ink = (235 - light) / 70;
    }
    ink = Math.max(0, Math.min(1, ink));
    pixels[index + 3] = Math.round(pixels[index + 3] * ink);
    if (ink > 0.15 && color < 0.2) {
      pixels[index] = Math.round(red * 0.45);
      pixels[index + 1] = Math.round(green * 0.5);
      pixels[index + 2] = Math.round(blue * 0.45);
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function placeCleanSignature(file, targetCtx, target) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read signature"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not read signature"));
      image.onload = () => {
        const cleaned = cleanSignatureCanvas(image);
        const sample = cleaned.getContext("2d").getImageData(0, 0, cleaned.width, cleaned.height).data;
        let minX = cleaned.width;
        let minY = cleaned.height;
        let maxX = 0;
        let maxY = 0;
        for (let y = 0; y < cleaned.height; y += 1) {
          for (let x = 0; x < cleaned.width; x += 1) {
            if (sample[(y * cleaned.width + x) * 4 + 3] < 24) continue;
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
        targetCtx.clearRect(0, 0, target.width, target.height);
        if (maxX < minX) {
          resolve(false);
          return;
        }
        const margin = 10;
        minX = Math.max(0, minX - margin);
        minY = Math.max(0, minY - margin);
        maxX = Math.min(cleaned.width - 1, maxX + margin);
        maxY = Math.min(cleaned.height - 1, maxY + margin);
        const sourceWidth = maxX - minX + 1;
        const sourceHeight = maxY - minY + 1;
        const fit = Math.min(target.width / sourceWidth, target.height / sourceHeight) * 0.9;
        const drawWidth = sourceWidth * fit;
        const drawHeight = sourceHeight * fit;
        targetCtx.drawImage(
          cleaned,
          minX,
          minY,
          sourceWidth,
          sourceHeight,
          (target.width - drawWidth) / 2,
          (target.height - drawHeight) / 2,
          drawWidth,
          drawHeight
        );
        resolve(true);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

window.placeCleanSignature = placeCleanSignature;
