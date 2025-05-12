class ImageEditor {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.image = null;
    this.originalImage = null;
    this.fisheyeStrength = 0;
    this.mosaicSize = 10;
    this.isMosaic = false;
    this.blurStrength = 0;
    this.isRadialBlur = false;

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // 画像読み込み
    document
      .getElementById("imageInput")
      .addEventListener("change", (e) => this.loadImage(e));

    // 効果の強さ調整
    const slider = document.getElementById("mirrorPosition");
    const sliderValue = document.querySelector(".slider-value");
    slider.addEventListener("input", (e) => {
      this.fisheyeStrength = e.target.value;
      sliderValue.textContent = this.fisheyeStrength;
      this.redraw();
    });

    // モザイクサイズ調整
    const mosaicSlider = document.getElementById("mosaicSize");
    const mosaicValue = mosaicSlider.nextElementSibling;
    mosaicSlider.addEventListener("input", (e) => {
      this.mosaicSize = parseInt(e.target.value);
      mosaicValue.textContent = this.mosaicSize;
      if (this.isMosaic) {
        this.redraw();
      }
    });

    // ブラー強さ調整
    const blurSlider = document.getElementById("blurStrength");
    const blurValue = blurSlider.nextElementSibling;
    blurSlider.addEventListener("input", (e) => {
      this.blurStrength = parseInt(e.target.value);
      blurValue.textContent = this.blurStrength;
      if (this.isRadialBlur) {
        this.redraw();
      }
    });

    // その他の効果
    document
      .getElementById("grayscaleBtn")
      .addEventListener("click", () => this.applyGrayscale());
    document
      .getElementById("invertBtn")
      .addEventListener("click", () => this.applyInvert());
    document
      .getElementById("mosaicBtn")
      .addEventListener("click", () => this.toggleMosaic());
    document
      .getElementById("radialBlurBtn")
      .addEventListener("click", () => this.toggleRadialBlur());
  }

  loadImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.image = new Image();
        this.image.onload = () => {
          this.originalImage = this.image;
          this.resizeCanvas();
          this.redraw();
        };
        this.image.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resizeCanvas() {
    const maxWidth = window.innerWidth * 0.8;
    const maxHeight = window.innerHeight * 0.6;
    let width = this.image.width;
    let height = this.image.height;

    if (width > maxWidth) {
      height = (maxWidth * height) / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width = (maxHeight * width) / height;
      height = maxHeight;
    }

    this.canvas.width = width;
    this.canvas.height = height;
  }

  redraw() {
    if (!this.image) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // まず元画像を描画
    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);

    // 画像データを取得
    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const outputData = this.ctx.createImageData(
      this.canvas.width,
      this.canvas.height
    );

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const strength = this.fisheyeStrength; // -1から1の範囲に正規化

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // レンズ効果の計算（指数関数的な変化）
        const factor = distance / maxDistance;
        let distortion;
        if (this.fisheyeStrength >= 0) {
          // 凸レンズ効果（魚眼）
          distortion = Math.exp(-strength * factor * factor);
        } else {
          // 凹レンズ効果
          distortion =
            1 + (1 - Math.exp(-Math.abs(strength) * factor * factor));
        }

        const sourceX = centerX + dx * distortion;
        const sourceY = centerY + dy * distortion;

        // 元画像からピクセルを取得
        const sourceIndex =
          (Math.floor(sourceY) * this.canvas.width + Math.floor(sourceX)) * 4;
        const targetIndex = (y * this.canvas.width + x) * 4;

        if (
          sourceX >= 0 &&
          sourceX < this.canvas.width &&
          sourceY >= 0 &&
          sourceY < this.canvas.height
        ) {
          outputData.data[targetIndex] = imageData.data[sourceIndex];
          outputData.data[targetIndex + 1] = imageData.data[sourceIndex + 1];
          outputData.data[targetIndex + 2] = imageData.data[sourceIndex + 2];
          outputData.data[targetIndex + 3] = imageData.data[sourceIndex + 3];
        } else {
          // 範囲外の場合は透明に
          outputData.data[targetIndex + 3] = 0;
        }
      }
    }

    this.ctx.putImageData(outputData, 0, 0);

    // モザイク効果を適用
    if (this.isMosaic) {
      this.applyMosaic();
    }

    // 放射ブラー効果を適用
    if (this.isRadialBlur) {
      this.applyRadialBlur();
    }
  }

  toggleMosaic() {
    this.isMosaic = !this.isMosaic;
    this.redraw();
  }

  applyMosaic() {
    if (!this.image) return;

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;
    const size = this.mosaicSize;

    for (let y = 0; y < this.canvas.height; y += size) {
      for (let x = 0; x < this.canvas.width; x += size) {
        // モザイクブロック内の平均色を計算
        let r = 0,
          g = 0,
          b = 0,
          a = 0,
          count = 0;

        for (let dy = 0; dy < size && y + dy < this.canvas.height; dy++) {
          for (let dx = 0; dx < size && x + dx < this.canvas.width; dx++) {
            const idx = ((y + dy) * this.canvas.width + (x + dx)) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        // モザイクブロックを塗りつぶす
        for (let dy = 0; dy < size && y + dy < this.canvas.height; dy++) {
          for (let dx = 0; dx < size && x + dx < this.canvas.width; dx++) {
            const idx = ((y + dy) * this.canvas.width + (x + dx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  applyGrayscale() {
    if (!this.image) return;

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // R
      data[i + 1] = avg; // G
      data[i + 2] = avg; // B
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  applyInvert() {
    if (!this.image) return;

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255 - data[i]; // R
      data[i + 1] = 255 - data[i + 1]; // G
      data[i + 2] = 255 - data[i + 2]; // B
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  toggleRadialBlur() {
    this.isRadialBlur = !this.isRadialBlur;
    this.redraw();
  }

  applyRadialBlur() {
    if (!this.image) return;

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    const data = imageData.data;
    const outputData = this.ctx.createImageData(
      this.canvas.width,
      this.canvas.height
    );

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    const strength = this.blurStrength / 100;

    for (let y = 0; y < this.canvas.height; y++) {
      for (let x = 0; x < this.canvas.width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        // 距離に応じたブラー強さを計算
        const blurAmount = Math.floor(strength * (distance / maxDistance) * 20);

        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        let count = 0;

        // 放射状にサンプリング
        for (let i = -blurAmount; i <= blurAmount; i++) {
          const sampleDistance = distance + i;
          const sampleX = centerX + sampleDistance * Math.cos(angle);
          const sampleY = centerY + sampleDistance * Math.sin(angle);

          if (
            sampleX >= 0 &&
            sampleX < this.canvas.width &&
            sampleY >= 0 &&
            sampleY < this.canvas.height
          ) {
            const idx =
              (Math.floor(sampleY) * this.canvas.width + Math.floor(sampleX)) *
              4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }

        const targetIdx = (y * this.canvas.width + x) * 4;
        if (count > 0) {
          outputData.data[targetIdx] = r / count;
          outputData.data[targetIdx + 1] = g / count;
          outputData.data[targetIdx + 2] = b / count;
          outputData.data[targetIdx + 3] = a / count;
        } else {
          outputData.data[targetIdx] = data[targetIdx];
          outputData.data[targetIdx + 1] = data[targetIdx + 1];
          outputData.data[targetIdx + 2] = data[targetIdx + 2];
          outputData.data[targetIdx + 3] = data[targetIdx + 3];
        }
      }
    }

    this.ctx.putImageData(outputData, 0, 0);
  }
}

// アプリケーションの初期化
window.addEventListener("load", () => {
  new ImageEditor();
});
