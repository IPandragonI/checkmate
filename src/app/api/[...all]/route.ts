import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import {NextRequest} from "next/server";
import prisma from "@/lib/prisma";

export const { POST, GET } = toNextJsHandler(auth);