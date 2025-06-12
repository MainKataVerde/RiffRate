/**
 * Esta función crea una imagen recortada a partir de una imagen original y el área seleccionada
 */
export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Establecer dimensiones del canvas al tamaño del recorte
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Dibujar la imagen recortada en el canvas
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

  // Convertir el canvas a una URL de datos
  return canvas.toDataURL("image/jpeg");
};

/**
 * Función auxiliar para crear una imagen a partir de una URL
 */
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
