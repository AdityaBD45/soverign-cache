import mongoose, { Schema, models, model } from "mongoose";

export type PurgeAction = "PURGE_TAG" | "PURGE_KEY";
export type PurgeStatus = "SUCCESS" | "FAILED";

export interface PurgeLogDoc extends mongoose.Document {
  ownerUserId: string; // ✅ Clerk userId

  namespaceId: mongoose.Types.ObjectId;
  apiKeyId?: mongoose.Types.ObjectId;

  action: PurgeAction;
  value: string;
  status: PurgeStatus;
  message?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PurgeLogSchema = new Schema<PurgeLogDoc>(
  {
    ownerUserId: { type: String, required: true, index: true }, // ✅ NEW

    namespaceId: {
      type: Schema.Types.ObjectId,
      ref: "Namespace",
      required: true,
      index: true,
    },

    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
      required: false,
      index: true,
    },

    action: { type: String, required: true },
    value: { type: String, required: true },

    status: { type: String, required: true },
    message: { type: String, required: false },
  },
  { timestamps: true }
);

export const PurgeLog =
  models.PurgeLog || model<PurgeLogDoc>("PurgeLog", PurgeLogSchema);
