import * as fs from "fs";
import { config } from "../config";

const storagePath = config.storage.cache;

if (!fs.existsSync(storagePath)) fs.writeFileSync(storagePath, "{}");

export const storage = {
  getItem: (key: string) => {
    const data = fs.readFileSync(storagePath, "utf8");
    return JSON.parse(data)[key];
  },
  setItem: (key: string, value: any) => {
    const data = fs.readFileSync(storagePath, "utf8");
    const parsedData = JSON.parse(data);
    parsedData[key] = value;
    fs.writeFileSync(storagePath, JSON.stringify(parsedData, null, 2));
  },
  removeItem: (key: string) => {
    const data = fs.readFileSync(storagePath, "utf8");
    const parsedData = JSON.parse(data);
    delete parsedData[key];
    fs.writeFileSync(storagePath, JSON.stringify(parsedData, null, 2));
  },
};
