import mongoose, { Schema, models, model } from "mongoose";

export interface NamespaceDoc extends mongoose.Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const NamespaceSchema = new Schema<NamespaceDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const Namespace =
  models.Namespace || model<NamespaceDoc>("Namespace", NamespaceSchema);
