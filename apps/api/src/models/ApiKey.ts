import mongoose, { Schema, models, model } from "mongoose";

export interface ApiKeyDoc extends mongoose.Document {
  ownerUserId: string; // ✅ Clerk userId
  namespaceId: mongoose.Types.ObjectId;

  keyPrefix: string;
  keyHash: string;

  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<ApiKeyDoc>(
  {
    ownerUserId: { type: String, required: true, index: true }, // ✅ NEW

    namespaceId: {
      type: Schema.Types.ObjectId,
      ref: "Namespace",
      required: true,
      index: true,
    },

    keyPrefix: { type: String, required: true },
    keyHash: { type: String, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ApiKey =
  models.ApiKey || model<ApiKeyDoc>("ApiKey", ApiKeySchema);
