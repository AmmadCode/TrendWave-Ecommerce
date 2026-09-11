import { Router, type Request, type Response } from "express";
import { getDbUserFromReq, requireAdmin } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { Category } from "../../models/Category";
import { ok } from "../../utils/envelope";
import { requireFound, requireNumber, requireText } from "../../utils/helper";
import { Product } from "../../models/Products";
import multer from "multer";
import { AppError } from "../../utils/AppError";
import { uploadManyBufferToCloudinary } from "../../utils/cloudinary";

export const adminProductRouter = Router();

type uploadedImages = {
  url: string;
  publicId: string;
  isCover: boolean;
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
});

adminProductRouter.use(requireAdmin);

// categories get

adminProductRouter.get(
  "/categories",
  asyncHandler(async (_req: Request, res: Response) => {
    const categories = await Category.find({}).sort({
      name: 1,
    });

    res.json(ok(categories));
  }),
);

// create

adminProductRouter.post(
  "/categories",
  asyncHandler(async (req: Request, res: Response) => {
    const name = String(req.body.name || "").trim();

    requireText(name, "Category name is needed!");

    const category = await Category.create({ name });

    res.status(201).json(ok(category));
  }),
);

// update

adminProductRouter.put(
  "/categories/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const name = String(req.body.name || "").trim();
    const extractedId = req.params.id as string;

    requireText(name, "Category name is needed!");

    const existingCategory = await Category.findById(extractedId);
    const category = requireFound(existingCategory, "Category not Found!");

    category.name = name;
    await category.save();

    res.json(ok(category));
  }),
);

// products routes

adminProductRouter.get(
  "/products",
  asyncHandler(async (req: Request, res: Response) => {
    const search = String(req.query.search || "").trim();

    const query: Record<string, unknown> = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(ok(products));
  }),
);

adminProductRouter.get(
  "/products/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;

    const product = await Product.findById(productId).populate(
      "category",
      "name",
    );

    requireText(product, "Product not found", 404);

    res.json(ok(product));
  }),
);

// product upload routes

adminProductRouter.post(
  "/products",
  upload.array("images", 10),
  asyncHandler(async (req: Request, res: Response) => {
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const category = String(req.body.category || "").trim();
    const brand = String(req.body.brand || "").trim();
    const price = Number(req.body.price);
    const salePercentage = Number(req.body.salePercentage || 0);
    const stock = Number(req.body.stock);
    const status = String(req.body.status || "active").trim();
    const colors = req.body.colors || [];
    const sizes = req.body.sizes || [];

    requireText(title, "Title is required!");
    requireText(description, "description is required!");
    requireText(category, "category is required!");
    requireText(brand, "brand is required!");
    requireText(status, "Status is required!");

    requireNumber(price, "price is required");
    requireNumber(salePercentage, "Sale percentage is required");
    requireNumber(stock, "stock is required");

    const existingCategory = await Category.findById(category);
    requireFound(existingCategory, "Category not found", 404);

    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) {
      throw new AppError(400, "Atleast One image is needed!!!");
    }

    const uploadedImages = await uploadManyBufferToCloudinary(
      files.map((file) => file.buffer),
    );

    const images = uploadedImages.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      isCover: index === 0,
    }));

    const user = await getDbUserFromReq(req);

    const product = await Product.create({
      title,
      description,
      category,
      brand,
      images,
      colors,
      sizes,
      price,
      salePercentage,
      stock,
      status,
      createdBy: user._id,
    });

    const createdProduct = await Product.findById(product._id).populate(
      "category",
      "name",
    );

    res.status(201).json(ok(createdProduct));
  }),
);

adminProductRouter.put(
  "/products/:id",
  upload.array("images", 10),
  asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;
    const title = String(req.body.title || "").trim();
    const description = String(req.body.description || "").trim();
    const category = String(req.body.category || "").trim();
    const brand = String(req.body.brand || "").trim();
    const price = Number(req.body.price);
    const salePercentage = Number(req.body.salePercentage || 0);
    const stock = Number(req.body.stock);
    const status = String(req.body.status || "active").trim() as
      | "active"
      | "inactive";
    const colors = req.body.colors || [];
    const sizes = req.body.sizes || [];
    const coverImagePublicId = String(req.body.coverImagePublicId).trim();

    requireText(title, "Title is required!");
    requireText(description, "description is required!");
    requireText(category, "category is required!");
    requireText(brand, "brand is required!");
    requireText(status, "Status is required!");

    requireNumber(price, "price is required");
    requireNumber(salePercentage, "Sale percentage is required");
    requireNumber(stock, "stock is required");

    const existingCategoryDoc = await Category.findById(category);
    const existingCategory = requireFound(
      existingCategoryDoc,
      "Category not found",
      404,
    );

    const productDoc = await Product.findById(productId);
    const product = requireFound(productDoc, "product not found", 404);

    const files = (req.files as Express.Multer.File[]) || [];

    const uploadNewImages = await uploadManyBufferToCloudinary(
      files.map((file) => file.buffer),
    );
    const newlyUploadedImage = uploadNewImages.map((img, index) => ({
      url: img.url,
      publicId: img.publicId,
      isCover: false,
    }));

    let existingImages: uploadedImages[] = product.images.map(
      (img: uploadedImages) => ({
        url: img.url,
        publicId: img.publicId,
        isCover: img.isCover,
      }),
    );

    const mergedImages: uploadedImages[] = [
      ...existingImages,
      ...newlyUploadedImage,
    ];

    const finalImages: uploadedImages[] = mergedImages.map(
      (img: uploadedImages, index) => ({
        url: img.url,
        publicId: img.publicId,
        isCover: coverImagePublicId
          ? img.publicId === coverImagePublicId
          : index === 0,
      }),
    );

    if (!mergedImages.length) {
      throw new AppError(400, "Atleast one image is needed!");
    }

    product.title = title;
    product.description = description;
    product.category = existingCategory._id;
    product.brand = brand;
    product.colors = colors;
    product.sizes = sizes;
    product.price = price;
    product.salePercentage = salePercentage;
    product.stock = stock;

    product.status = status;
    product.set("images", finalImages);

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate(
      "category",
      "name",
    );

    res.json(ok(updatedProduct));
  }),
);
