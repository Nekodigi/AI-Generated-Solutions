document.addEventListener("DOMContentLoaded", () => {
  const qrText = document.getElementById("qrText");
  const qrSize = document.getElementById("qrSize");
  const qrColor = document.getElementById("qrColor");
  const generateBtn = document.getElementById("generateBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const qrCodeDiv = document.getElementById("qrCode");

  let qrCode = null;

  // QRコードを生成する関数
  function generateQRCode() {
    const text = qrText.value.trim();
    if (!text) {
      alert("テキストを入力してください。");
      return;
    }

    const size = parseInt(qrSize.value);
    const color = qrColor.value;

    // 既存のQRコードをクリア
    qrCodeDiv.innerHTML = "";

    // QRコードを生成
    qrCode = new QRCode(qrCodeDiv, {
      text: text,
      width: size,
      height: size,
      colorDark: color,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    downloadBtn.disabled = false;
  }

  // QRコードをダウンロードする関数
  function downloadQRCode() {
    const canvas = qrCodeDiv.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "qrcode.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  // イベントリスナー
  generateBtn.addEventListener("click", generateQRCode);
  downloadBtn.addEventListener("click", downloadQRCode);

  // EnterキーでQRコードを生成
  qrText.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      generateQRCode();
    }
  });
});
