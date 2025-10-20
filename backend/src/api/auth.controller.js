import PrismaClientPkg from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { PrismaClient } = PrismaClientPkg;
const prisma = new PrismaClient();

// export the register function
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  // --- بداية: التحقق من صحة كلمة المرور ---

  // الكود القديم الخاطئ (لا يسمح بالرموز):
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;

  // الكود الجديد الصحيح (يسمح بكل الرموز):
  // Regex للتحقق من:
  // - 8 أحرف على الأقل (أي حرف أو رمز)
  // - حرف كبير واحد على الأقل
  // - حرف صغير واحد على الأقل
  // - رقم واحد على الأقل
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل وأن تحتوي على حرف كبير وحرف صغير ورقم واحد على الأقل.",
    });
  }
  // --- نهاية: التحقق من صحة كلمة المرور ---

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "الاسم والبريد الإلكتروني حقول إلزامية." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // سيتم تعيين الدور الافتراضي 'STUDENT' تلقائيًا
      },
    });

    user.password = undefined;
    res.status(201).json({ message: "تم إنشاء المستخدم بنجاح", user });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ message: "هذا البريد الإلكتروني مستخدم بالفعل." });
    }
    res.status(500).json({ message: "حدث خطأ ما", error: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Basic validation
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  try {
    // 2. Find the user by their email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." }); // Use a generic message for security
    }

    // 3. Compare the provided password with the stored hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // 4. If credentials are correct, generate a JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role }, // Payload: data you want to store in the token
      process.env.JWT_SECRET, // Secret key from your .env file
      { expiresIn: "1d" } // Options: e.g., token expires in 1 day
    );

    // 5. Send the token back to the client
    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};
