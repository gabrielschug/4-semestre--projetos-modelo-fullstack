import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      !file.mimetype.startsWith("image/jpeg") &&
      !file.mimetype.startsWith("image/png")
    ) {
      return cb(new Error("Apenas arquivos de imagem são permitidos."));
    }
    cb(null, true);
  },
});
