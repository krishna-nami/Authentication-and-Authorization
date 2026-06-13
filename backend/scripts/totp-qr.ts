import QRCode from "qrcode";

const otpAuthUrl = process.argv[2];
const outputFile = process.argv[3] ?? "totp.png";

if (!otpAuthUrl) {
  throw new Error("Pass otpAuthUrl as argument");
}
const main = async () => {
  await QRCode.toFile(outputFile, otpAuthUrl);
  console.error(`Saved QR code to ${outputFile}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
