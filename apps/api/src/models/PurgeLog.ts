import mongoose, { Schema, models, model } from "mongoose";

export type PurgeAction = "PURGE_TAG" | "PURGE_KEY";
export type PurgeStatus = "SUCCESS" | "FAILED";

export interface PurgeLogDoc extends mongoose.Document {
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
    namespaceId: {
      type: Schema.Types.ObjectId,
      ref: "Namespace",
      required: true,
    },

    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
      required: false,
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
