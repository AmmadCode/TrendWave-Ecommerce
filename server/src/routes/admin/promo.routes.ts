import { Router, type Request, type Response } from "express";
import { requireAdmin } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ok } from "../../utils/envelope";
import { Promo } from "../../models/Promo";
import { Types } from "mongoose";
import { requireFound, requireText } from "../../utils/helper";
import { AppError } from "../../utils/AppError";

type PromoDbItem = {
  _id?: Types.ObjectId;
  code: string;
  percentage: number;
  count: number;
  minimumOrderValue: number;
  startsAt: Date;
  endsAt: Date;
  createdAt?: Date;
};

function mapPromo(item: PromoDbItem) {
  return {
    _id: String(item._id || ""),
    code: item.code,
    percentage: item.percentage,
    count: item.count,
    minimumOrderValue: item.minimumOrderValue,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    createdAt: item.createdAt,
  };
}

export const adminPromoRouter = Router();

adminPromoRouter.use(requireAdmin);

function parsePromoPayLoad(req: Request) {
  const code = String(req.body.code || "")
    .trim()
    .toUpperCase();
  const percentage = Number(req.body.percentage);
  const count = Number(req.body.code);
  const minimumOrderValue = Number(req.body.minimumOrderValue);
  const startsAt = new Date(req.body.startsAt);
  const endsAt = new Date(req.body.endsAt);

  requireText(code, "Promo code is required.");
  if (Number.isNaN(percentage) || percentage < 1 || percentage > 100) {
    throw new AppError(400, "percentage must be between 1 and 100");
  }

  if (!Number.isInteger(count) || count < 1) {
    throw new AppError(400, "Promo count must be atleast 1.");
  }

  if (Number.isNaN(minimumOrderValue) || minimumOrderValue < 0) {
    throw new AppError(400, "Promo count must be atleast 0 or more ");
  }

  if (Number.isNaN(startsAt.getTime())) {
    throw new AppError(400, "Valid start time is required");
  }
  if (Number.isNaN(endsAt.getTime())) {
    throw new AppError(400, "Valid end time is required");
  }

  if (endsAt <= startsAt) {
    throw new AppError(400, "End time should be after start time");
  }

  return {
    code,
    percentage,
    count,
    minimumOrderValue,
    startsAt,
    endsAt,
  };
}

async function getAllPromos() {
  const promos = await Promo.find({}).sort({ createdAt: -1 });

  return promos.map((item) => mapPromo(item.toObject()));
}

// 1
adminPromoRouter.get(
  "/promos",
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(
      ok({
        items: await getAllPromos(),
      }),
    );
  }),
);
// 2
adminPromoRouter.post(
  "/promos",
  asyncHandler(async (req: Request, res: Response) => {
    const payLoad = parsePromoPayLoad(req);

    const existingPromo = await Promo.findOne({ code: payLoad.code });

    if (existingPromo) {
      throw new AppError(400, "Promo code already exist.");
    }

    await Promo.create(payLoad);

    res.json(
      ok({
        items: await getAllPromos(),
      }),
    );
  }),
);
// 3
adminPromoRouter.patch(
  "/promos/:promoId",
  asyncHandler(async (req: Request, res: Response) => {
    const promoId = String(req.params.promoId || "").trim();
    requireText(promoId, "Promo id is required.");

    const payLoad = parsePromoPayLoad(req);
    const promo = await Promo.findById(promoId);

    const foundPromo = requireFound(promo, "Promo not found", 404);

    const existingPromo = await Promo.findOne({
      code: payLoad.code,
      _id: { $ne: foundPromo._id },
    });

    if (existingPromo) {
      throw new AppError(400, "Promo code alreqdy exist");
    }

    foundPromo.code = payLoad.code;
    foundPromo.percentage = payLoad.percentage;
    foundPromo.count = payLoad.code;
    foundPromo.minimumOrderValue = payLoad.minimumOrderValue;
    foundPromo.startsAt = payLoad.startsAt;
    foundPromo.endsAt = payLoad.endsAt;

    await foundPromo.save();

    res.json(
      ok({
        items: await getAllPromos(),
      }),
    );
  }),
);
// 4
adminPromoRouter.delete(
  "/promos/:PromoId",
  asyncHandler(async (req: Request, res: Response) => {
    const promoId = String(req.params.promoId || "").trim();
    requireText(promoId, "Promo Id is required");

    const promo = await Promo.findById(promoId);
    requireFound(promo, "Promo not found", 404);

    await Promo.findByIdAndDelete(promoId);

    res.json(
      ok({
        items: await getAllPromos(),
      }),
    );
  }),
);
