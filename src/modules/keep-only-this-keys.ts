import { AnyArray } from "mongoose";

export default function keepOnlyThisKeys<O extends Object>(object: O, keys: AnyArray<keyof O>): { [k in keyof O]: O[k] } {
    const obj: Partial<O> = {};
    keys.forEach(key => {
        obj[key] = object[key];
    });
    return obj as any;
}