import { Router } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { uploadFile, deleteFileIfExists } from "../services/storage.service.js";
import { getManagedCatalogObjectPath } from "../utils/managed-catalog-path.js";
import { deleteUploadSchema } from "@platform/shared";
import { attributesRouter } from "./attributes.routes.js";
import { authRouter } from "./auth.routes.js";
import { brandsRouter } from "./brands.routes.js";
import { categoriesRouter } from "./categories.routes.js";
import { healthRouter } from "./health.routes.js";
import { productsRouter } from "./products.routes.js";
import { cartRouter } from "./cart.routes.js";
import { ordersRouter } from "./orders.routes.js";
import { usersRouter } from "./users.routes.js";
import { wishlistRouter } from "./wishlist.routes.js";

const ALLOWED_UPLOAD_FOLDERS = new Set(["categories", "brands", "products"]);
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/brands", brandsRouter);
apiRouter.use("/attributes", attributesRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/wishlist", wishlistRouter);

apiRouter.post(
  "/uploads",
  requireAuth,
  requireAdmin,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        throw new AppError(400, "No file uploaded. Use field name 'file'.");
      }

      if (!ALLOWED_UPLOAD_MIME_TYPES.has(req.file.mimetype)) {
        throw new AppError(400, "Only PNG, JPG, and WebP images are allowed.");
      }

      const folder =
        typeof req.body.folder === "string"
          ? req.body.folder.trim()
          : undefined;

      if (folder && !ALLOWED_UPLOAD_FOLDERS.has(folder)) {
        throw new AppError(400, "Invalid upload folder.");
      }

      if (!env.gcs.isConfigured) {
        throw new AppError(
          503,
          "File uploads are unavailable until GCS is configured."
        );
      }

      const result = await uploadFile(req.file.buffer, req.file.originalname, {
        folder,
        contentType: req.file.mimetype,
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

apiRouter.delete(
  "/uploads",
  requireAuth,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { url } = deleteUploadSchema.parse(req.body);

      try {
        const parsed = new URL(url);
        if (parsed.hostname !== "storage.googleapis.com") {
          throw new AppError(400, "Invalid or unsupported catalog image URL.");
        }
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }
        throw new AppError(400, "Invalid or unsupported catalog image URL.");
      }

      if (!env.gcs.isConfigured || !env.gcs.bucketName) {
        throw new AppError(
          503,
          "File uploads are unavailable until GCS is configured."
        );
      }

      const objectPath = getManagedCatalogObjectPath(url, env.gcs.bucketName);
      if (!objectPath) {
        throw new AppError(400, "Invalid or unsupported catalog image URL.");
      }

      await deleteFileIfExists(objectPath);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);
