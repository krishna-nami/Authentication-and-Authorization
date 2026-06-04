import bcrypt from "bcryptjs";

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  const hashPass = await bcrypt.hash(password, salt);
  return hashPass;
};

export const comparePassword = async (password: string, hash: string) => {
  const result = bcrypt.compare(password, hash);
  return result;
};
