import { Schema, model, type InferSchemaType, Types } from "mongoose";

const attributeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    displayType: {
      type: String,
      enum: ["Dropdown", "Swatch", "Text"],
      default: "Dropdown",
    },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    values: { type: [String], default: [] },
    productCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export type AttributeDocument = InferSchemaType<typeof attributeSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Attribute = model("Attribute", attributeSchema);
