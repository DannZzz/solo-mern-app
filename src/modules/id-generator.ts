import { randomNumber } from "anytool";
import { Database } from "../Database/Database";

function generator(): string {
  return randomNumber(1_000_000_000_000_000, 9_999_999_999_999_999) + "";
}

export function idGenerator(): string {
  return generator();
}

export async function idGeneratorUnique(
  key: keyof Database.models
): Promise<string>;
export async function idGeneratorUnique(
  array: Array<{ _id?: string; [k: string]: any }>
): Promise<string>;
export async function idGeneratorUnique(
  key: Array<{ _id?: string; [k: string]: any }> | keyof Database.models
): Promise<string> {
  let id: string;
  do {
    id = generator();
  } while (
    Array.isArray(key)
      ? key.find((d) => d._id === id)
      : await Database.getModel(key).findOne("_id", id)
  );
  return id;
}
