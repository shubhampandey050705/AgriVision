import { twMerge } from "tailwind-merge";
import clsx from "clsx";
export const cn = (...c) => twMerge(clsx(c));
