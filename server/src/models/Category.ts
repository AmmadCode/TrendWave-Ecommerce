import mongoose, { HydratedDocument } from "mongoose";

export type Category = {
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type categoryDocument = HydratedDocument<Category>;

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

export const Category =
  mongoose.models.Category ||
  mongoose.model<Category>("Category", categorySchema);
