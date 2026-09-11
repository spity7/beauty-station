import mongoose, {
  Schema,
  type InferSchemaType,
  type Types,
  type HydratedDocument,
} from "mongoose";
import type { UserRole } from "@platform/shared";
import { userAddressSchema } from "./UserAddress.js";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "customer"] satisfies UserRole[],
      default: "customer",
    },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    emailVerified: { type: Boolean, default: false },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpires: { type: Date },
    oauthProvider: { type: String },
    oauthId: { type: String },
    refreshTokenVersion: { type: Number, default: 0, min: 0 },
    passwordSetByUser: { type: Boolean, default: true },
    passwordResetTokenHash: { type: String },
    passwordResetExpires: { type: Date },
    deletedAt: { type: Date },
    isActive: { type: Boolean, default: true },
    addresses: [userAddressSchema],
  },
  { timestamps: true }
);

userSchema.index({ oauthProvider: 1, oauthId: 1 }, { sparse: true });

export type UserAddressSubdocument = InferSchemaType<
  typeof userAddressSchema
> & {
  _id: Types.ObjectId;
};

export type UserDocument = HydratedDocument<
  InferSchemaType<typeof userSchema>
> & {
  addresses: Types.DocumentArray<UserAddressSubdocument>;
};

export const User = mongoose.model("User", userSchema);
