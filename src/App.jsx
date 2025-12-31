import { useState } from "react";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";
import QRCode from "qrcode";

import ReactDOM from "react-dom/client"; // بالای فایل اضافه کن

import { GoShieldCheck } from "react-icons/go";
import { CiWifiOff } from "react-icons/ci";
import { MdOutlineConnectingAirports } from "react-icons/md";

/* ================= Utils ================= */
const VERSION = "1";

const generateSalt = (len = 3) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from(
    { length: len },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

const xor = (text, salt) =>
  [...text]
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ salt.charCodeAt(i % salt.length))
    )
    .join("");

const encodeText = (text) => {
  const salt = generateSalt();
  const encrypted = xor(text, salt);
  const payload = `${VERSION}.${salt}.${btoa(
    unescape(encodeURIComponent(encrypted))
  )}`;
  return btoa(payload);
};

const decodeText = (code) => {
  const decoded = atob(code);
  const [version, salt, encrypted] = decoded.split(".");
  if (version !== VERSION) throw new Error();
  return xor(decodeURIComponent(escape(atob(encrypted))), salt);
};

/* ================= Translations ================= */
const T = {
  fa: {
    title: "رمزنگاری محتوا",
    subtitle: "کاملاً آفلاین • بدون ارسال داده • مناسب متن و لینک فارسی",
    encode: "قفل کردن",
    decode: "باز کردن",
    encodeBtn: "رمزنگاری کن",
    decodeBtn: "رمزگشایی کن",
    encodePh: "متن یا لینک خود را وارد کنید...",
    decodePh: "کد رمز شده را وارد کنید...",
    encodeOut: "خروجی رمز شده اینجا نمایش داده می‌شود",
    decodeOut: "متن اصلی اینجا نمایش داده می‌شود",
    copy: "کپی",
    copied: "کیو-آر با موفقیت ساخته شد",
    errEncode: "خطا در رمزنگاری",
    errDecode: "کد نامعتبر است",
    bashe: "باشه",
    qrBtn: "QR Code",
    qrText: "متن شما کپی شد!",
  },
  en: {
    title: "Content Encryption",
    subtitle: "Fully offline • No data sent • Text & link encryption",
    encode: "Encrypt",
    decode: "Decrypt",
    encodeBtn: "Encrypt",
    decodeBtn: "Decrypt",
    encodePh: "Enter your text or link...",
    decodePh: "Enter encrypted code...",
    encodeOut: "Encrypted output will appear here",
    decodeOut: "Decrypted text will appear here",
    copy: "Copy",
    copied: "QR Code Generated",
    errEncode: "Encryption failed",
    errDecode: "Invalid code",
    bashe: "Okay",
    qrBtn: "QR Code",
  },
};

/* ================= App ================= */
export default function App() {
  const [lang, setLang] = useState("fa");
  const t = T[lang];

  const [encodeInput, setEncodeInput] = useState("");
  const [encodeOutput, setEncodeOutput] = useState("");
  const [decodeInput, setDecodeInput] = useState("");
  const [decodeOutput, setDecodeOutput] = useState("");
  const [copiedBox, setCopiedBox] = useState(null);
  const [error, setError] = useState("");

  const copy = async (text, box) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedBox(box);
    setTimeout(() => setCopiedBox(null), 2000);
  };

  const showQrModal = async (text) => {
    try {
      const dataUrl = await QRCode.toDataURL(text, { width: 200, margin: 2 });
      Swal.fire({
        title: t.copied,
        html: `<img src="${dataUrl}" class="block mx-auto" alt="QR Code" />`,
        icon: "success",
        confirmButtonText: t.bashe,
        width: 720,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      dir={lang === "fa" ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white p-6"
    >
      {/* Language Switch */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => setLang("fa")}
          className={`px-3 py-1 text-xs rounded ${
            lang === "fa" ? "bg-teal-500" : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          FA
        </button>
        <button
          onClick={() => setLang("en")}
          className={`px-3 py-1 text-xs rounded ${
            lang === "en" ? "bg-teal-500" : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          EN
        </button>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col justify-center pt-36">
        <div className="flex w-full items-center justify-center">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl shadow-lg shadow-teal-500/30 mb-4 sm:mb-6">
            <GoShieldCheck className="text-5xl" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-2">{t.title}</h1>
        <p className="text-center text-slate-300 mb-8 text-sm">{t.subtitle}</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Encode */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 border-1 border-white/10">
            <h2 className="mb-3 font-semibold">🔒 {t.encode}</h2>

            <textarea
              className="w-full h-28 sm:h-36 px-4 sm:px-5 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm sm:text-base text-white placeholder-slate-500 "
              placeholder={t.encodePh}
              value={encodeInput}
              maxLength={100}
              minLength={4}
              onChange={(e) => setEncodeInput(e.target.value)}
            />

            <button
              onClick={() => {
                setError("");
                try {
                  const output = encodeText(encodeInput);
                  setEncodeOutput(output);
                } catch {
                  setError(t.errEncode);
                }
              }}
              className=" w-full mt-5.5 mb-6 bg-teal-500 hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow py-2 rounded-lg"
            >
              {t.encodeBtn}
            </button>

            <div className="relative">
              <textarea
                readOnly
                className="relative w-full h-28 default_text sm:h-36 px-4 sm:px-5 py-3 sm:py-4 bg-teal-950/50 border rounded-lg sm:rounded-xl text-sm sm:text-base font-medium overflow-auto transition-all duration-200 cursor-pointer border-emeratealld-500/20 border-teal-500/20 hover:border-teal-500/40 hover:bg-teal-950/70 active:scale-[0.99] "
                value={encodeOutput}
                placeholder={t.encodeOut}
              />
              <div className="absolute top-2 end-2 text-xs flex gap-1">
                <button
                  onClick={() => showQrModal(encodeOutput)}
                  className=" bg-slate-700 px-2 py-1 rounded"
                >
                  {t.qrBtn}
                </button>
                <button
                  onClick={() => copy(encodeOutput, "encode")}
                  className=" bg-slate-700 px-2 py-1 rounded"
                >
                  {t.copy}
                </button>
              </div>
              {copiedBox === "encode" && (
                <div className="absolute inset-0 flex items-center justify-center bg-teal-500 rounded-lg animate-fade">
                  <span className="px-3 py-1 rounded text-sm">{t.qrText}</span>
                </div>
              )}
            </div>
          </div>

          {/* Decode */}
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 border-1 border-white/10">
            <h2 className="mb-3 font-semibold">🔓 {t.decode}</h2>

            <textarea
              className="w-full h-28 sm:h-36 px-4 sm:px-5 py-3 sm:py-4 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm sm:text-base text-white placeholder-slate-500"
              placeholder={t.decodePh}
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
            />

            <button
              onClick={() => {
                setError("");
                try {
                  const output = decodeText(decodeInput);
                  setDecodeOutput(output);
                } catch {
                  setError(t.errDecode);
                }
              }}
              className="w-full mt-5.5 mb-6 bg-sky-500 hover:shadow-xl hover:shadow-sky-500/30 transition-shadow py-2 rounded-lg cursor-pointer"
            >
              {t.decodeBtn}
            </button>

            <div className="relative">
              <textarea
                readOnly
                className="relative w-full h-28 default_text sm:h-36 px-4 sm:px-5 py-3 sm:py-4 bg-sky-950/50 border rounded-lg sm:rounded-xl text-sm sm:text-base font-medium overflow-auto transition-all duration-200 cursor-pointer border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-950/70 active:scale-[0.99]"
                value={decodeOutput}
                placeholder={t.decodeOut}
              />

              <div className="absolute top-2 end-2 text-xs flex gap-1">
                <button
                  onClick={() => copy(decodeOutput, "decode")}
                  className=" bg-slate-700 px-2 py-1 rounded"
                >
                  {t.copy}
                </button>
                <button
                  onClick={() => showQrModal(decodeOutput)}
                  className=" bg-slate-700 px-2 py-1 rounded"
                >
                  {t.qrBtn}
                </button>
              </div>
              {copiedBox === "decode" && (
                <div className="absolute inset-0 flex items-center justify-center bg-sky-500 rounded-lg animate-fade">
                  <span className=" px-3 py-1 rounded text-sm">{t.qrText}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 lg:mt-12 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-right">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-teal-500/20 rounded-lg">
                <CiWifiOff />
              </div>
              <div className="">
                <p class="text-sm sm:text-base text-white font-medium">
                  بدون نیاز به اینترنت
                </p>
                <p class="text-[10px] sm:text-xs text-slate-400">
                  حتی با قطع اینترنت کار می‌کند
                </p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10"></div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                <GoShieldCheck />
              </div>
              <div className="">
                <p class="text-sm sm:text-base text-white font-medium">
                  کاملا امن و محلی
                </p>
                <p class="text-[10px] sm:text-xs text-slate-400">
                  هیچ اطلاعاتی به سرور ارسال نمی‌شود
                </p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/10"></div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-teal-500/20 rounded-lg">
                <MdOutlineConnectingAirports />
              </div>
              <div className="">
                <p class="text-sm sm:text-base text-white font-medium">
                  یکبار باز کنید
                </p>
                <p class="text-[10px] sm:text-xs text-slate-400">
                  سپس آفلاین استفاده کنید
                </p>
              </div>
            </div>
          </div>
        </div>
          <p className="text-center text-xs text-white/30 mt-6">
            تمام عملیات رمزنگاری در مرورگر انجام می‌شود و هیچ اطلاعاتی به سرور منتقل نمی‌شود!
          </p>
          <p className="text-center text-xs text-white/30 mt-1">
              نسخه 1.0
          </p>
          <p className="text-center text-xs text-white/30 mt-1">
              ساخته شده توسط <a href="https://parsahasani.ir" className="text-teal-500" target="blank_">
                پارسا حسنی
              </a>
          </p>

        {error && (
          <p className="text-center text-red-400 mt-4 text-sm">{error}</p>
        )}
      </div>

      <style>{`
        .animate-fade {
          animation: fade 2s ease forwards;
        }
        @keyframes fade {
          0% { opacity: 0 }
          15% { opacity: 1 }
          85% { opacity: 1 }
          100% { opacity: 0 }
        }
      `}</style>
    </div>
  );
}
