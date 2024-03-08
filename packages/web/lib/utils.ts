import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const objSchema = z.record(z.string(), z.any());
const arrSchema = z.array(z.any());
// accepts an Array with any entries that are any kind of Object and goes
// through each Object's keys to ensure that values containing an Object or
// Array are `stringify`ed.  This enables showing nested data in an html table
// without the dreded "[object Object]"
export function objectToTableData<TData>(data: any[]) {
  data = arrSchema.parse(data);

  return data.map(function (d) {
    return Object.fromEntries(
      Object.entries(objSchema.parse(d)).map(function ([key, val]) {
        // check for Object or Array
        if (typeof val === "object" && val !== null) {
          try {
            val = JSON.stringify(val);
          } catch (err) {
            console.log(`could not stringify`, err);
          }
        }

        return [key, val];
      }),
    ) as TData;
  });
}
