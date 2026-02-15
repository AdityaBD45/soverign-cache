import mongoose, { Schema, models, model } from "mongoose";

export interface NamespaceDoc extends mongoose.Document {
  ownerUserId: string; // ✅ Clerk userId

  name: string;
  slug: string;

  // ✅ Encrypted redisUrl storage
  redisUrlEnc: string;
  redisUrlIv: string;
  redisUrlTag: string;

  createdAt: Date;
  updatedAt: Date;
}

const NamespaceSchema = new Schema<NamespaceDoc>(
  {
    ownerUserId: { type: String, required: true, index: true }, // ✅ NEW

    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    redisUrlEnc: { type: String, required: true },
    redisUrlIv: { type: String, required: true },
    redisUrlTag: { type: String, required: true },
  },
  { timestamps: true }
);

export const Namespace =
  models.Namespace || model<NamespaceDoc>("Namespace", NamespaceSchema);
