import express from "express";
import { getStudentPublicProfile } from "./student.controller.js";

const router = express.Router();

// هذا المسار عام ولا يتطلب تسجيل الدخول
router.get("/:id", getStudentPublicProfile);

export default router;
