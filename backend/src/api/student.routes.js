import express from "express";
import {
  getStudentPublicProfile,
  getAllStudents,
} from "./student.controller.js";

const router = express.Router();

// هذا المسار عام ولا يتطلب تسجيل الدخول
router.get("/:id", getStudentPublicProfile);
router.get("/", getAllStudents);

export default router;
