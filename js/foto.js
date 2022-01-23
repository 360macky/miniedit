/**
 * @fileOverview Manage filters, grayscale and other effects for photographs.
 * @summary Filters.js is a fork of Foto.js
 * @author Kousik Mandal <kousik348@gmail.com>
 * @author Marcelo Arias <hola@marceloarias.com>
 * @version 1.0.0
 */

class Filters {
  constructor() {
    const root = this;

    this.operationOrgCanvas = document.createElement('canvas');
    this.operationOrgContext = this.operationOrgCanvas.getContext('2d');

    this.operationEditedCanvas = document.createElement('canvas');
    this.operationEditedContext = this.operationEditedCanvas.getContext('2d');

    this.fileInput = document.getElementById('foto-file');
    this.fileInput.addEventListener('change', (event) => {
      root.loadImage();
    });

    this.image = null;
    this.imageData = null;
    this.imageWidth = 0;
    this.imageHeight = 0;
    this.convertedToGrayScale = false;

    this.redPixelMatrix = [];
    this.greenPixelMatrix = [];
    this.bluePixelMatrix = [];
    this.alphaPixelMatrix = [];

    this.pickedR = '';
    this.pickedG = '';
    this.pickedB = '';

    this.selectedFileName = '';
    this.selectStart = false;
    this.startX = '';
    this.startY = '';
    this.endX = '';
    this.endY = '';
    this.excludeArea = false;
  }

  /**
   * Load image
   */
  loadImage() {
    const input = document.getElementById('foto-file');
    this.selectedFileName = input.files.item(0).name;
    const reader = new FileReader();
    const root = this;

    reader.onload = function (e) {
      root.image = new Image();
      root.image.onload = () => {
        root.imageWidth = root.image.width;
        root.imageHeight = root.image.height;

        root.operationOrgCanvas.width = root.imageWidth;
        root.operationOrgCanvas.height = root.imageHeight;

        root.operationEditedCanvas.width = root.imageWidth;
        root.operationEditedCanvas.height = root.imageHeight;
        root.imageData = [];
        root.redPixelMatrix = [];
        root.greenPixelMatrix = [];
        root.bluePixelMatrix = [];
        root.alphaPixelMatrix = [];
        root.operationOrgContext.clearRect(
          0,
          0,
          root.operationOrgCanvas.width,
          root.operationOrgCanvas.height
        );
        root.operationEditedContext.clearRect(
          0,
          0,
          root.operationEditedCanvas.width,
          root.operationEditedCanvas.height
        );

        root.operationOrgContext.drawImage(root.image, 0, 0);

        root.previewImage(root.operationOrgCanvas);

        root.imageData = root.operationOrgContext.getImageData(
          0,
          0,
          root.operationOrgCanvas.width,
          root.operationOrgCanvas.height
        );

        let r = [],
          g = [],
          b = [],
          a = [];
        for (let i = 0; i < root.imageData.data.length; i = i + 4) {
          if ((i / 4) % root.imageWidth == 0) {
            if (i != 0) {
              root.redPixelMatrix.push(r);
              root.greenPixelMatrix.push(g);
              root.bluePixelMatrix.push(b);
              root.alphaPixelMatrix.push(a);
            }
            r = [];
            g = [];
            b = [];
            a = [];
          }
          r.push(root.imageData.data[i]);
          g.push(root.imageData.data[i + 1]);
          b.push(root.imageData.data[i + 2]);
          a.push(root.imageData.data[i + 3]);
        }

        document
          .getElementById('file-upload-container')
          .classList.add('hidden');
        document
          .getElementById('download-container')
          .classList.remove('hidden');
        document
          .getElementById('image-effects-container')
          .classList.remove('hidden');
        document
          .getElementById('image-options-container')
          .classList.remove('hidden');
        document.getElementById('img-container').classList.remove('hidden');
        document.getElementById('reupload-button').classList.remove('hidden');
      };
      root.image.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }

  /**
   * Apply grayscale filter
   */
  grayscale() {
    let modifiedImageData = this.imageData;
    for (let i = 0; i < modifiedImageData.data.length; i = i + 4) {
      let red = modifiedImageData.data[i];
      let green = modifiedImageData.data[i + 1];
      let blue = modifiedImageData.data[i + 2];

      modifiedImageData.data[i] = (red + green + blue) / 3;
      modifiedImageData.data[i + 1] = (red + green + blue) / 3;
      modifiedImageData.data[i + 2] = (red + green + blue) / 3;
    }
    this.operationEditedContext.putImageData(modifiedImageData, 0, 0);
    this.previewImage();
    this.convertedToGrayScale = !this.convertedToGrayScale;
  }

  /**
   * Apply bright filter
   */
  increaseBrightness() {
    let modifiedImageData = this.imageData;
    for (let i = 0; i < modifiedImageData.data.length; i = i + 4) {
      let red = modifiedImageData.data[i];
      let green = modifiedImageData.data[i + 1];
      let blue = modifiedImageData.data[i + 2];
      let alpha = modifiedImageData.data[i + 3];

      modifiedImageData.data[i] = red + 10;
      modifiedImageData.data[i + 1] = green + 10;
      modifiedImageData.data[i + 2] = blue + 10;
      modifiedImageData.data[i + 3] = alpha;
    }
    this.operationEditedContext.putImageData(modifiedImageData, 0, 0);
    this.previewImage();
  }

  /**
   * Apply dark filter
   */
  decreaseBrightness() {
    let modifiedImageData = this.imageData;
    for (let i = 0; i < modifiedImageData.data.length; i = i + 4) {
      modifiedImageData.data[i] -= 10;
      modifiedImageData.data[i + 1] -= 10;
      modifiedImageData.data[i + 2] -= 10;
      modifiedImageData.data[i + 3] -= 10;
    }
    this.operationEditedContext.putImageData(modifiedImageData, 0, 0);
    this.previewImage();
  }

  /**
   * Apply filter
   * @param {*} filter 3x3 Matrix
   */
  applyFilter(filter) {
    // let count = 0;
    for (let i = 0; i < this.imageData.data.length; i = i + 4) {
      let finalR, finalG, finalB;
      let row = parseInt(i / 4 / this.imageWidth);
      let col = (i / 4) % this.imageWidth;
      if (
        row == 0 ||
        col == 0 ||
        row == this.imageHeight - 1 ||
        col == this.imageWidth - 1
      )
        continue;

      finalR = 0;
      finalG = 0;
      finalB = 0;
      let finalA = 0;

      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (this.redPixelMatrix[row + (x - 1)] == undefined) {
            continue;
          }
          if (this.redPixelMatrix[row + (x - 1)][col + (y - 1)] == undefined) {
            continue;
          }
          finalR +=
            filter[x][y] * this.redPixelMatrix[row + (x - 1)][col + (y - 1)];
          finalG +=
            filter[x][y] * this.greenPixelMatrix[row + (x - 1)][col + (y - 1)];
          finalB +=
            filter[x][y] * this.bluePixelMatrix[row + (x - 1)][col + (y - 1)];
          finalA +=
            filter[x][y] * this.alphaPixelMatrix[row + (x - 1)][col + (y - 1)];
        }
      }

      if (this.convertedToGrayScale) {
        this.imageData.data[i] = (finalR + finalG + finalB) / 3;
        this.imageData.data[i + 1] = (finalR + finalG + finalB) / 3;
        this.imageData.data[i + 2] = (finalR + finalG + finalB) / 3;
        this.imageData.data[i + 3] = finalA;
      } else {
        this.imageData.data[i] = finalR;
        this.imageData.data[i + 1] = finalG;
        this.imageData.data[i + 2] = finalB;
        this.imageData.data[i + 3] = finalA;
      }
    }
    this.operationEditedContext.putImageData(this.imageData, 0, 0);
    this.previewImage();
  }

  /**
   * Make Blur
   */
  applyBlur() {
    this.applyFilter([
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
      [1 / 9, 1 / 9, 1 / 9],
    ]);
  }

  /**
   * Make Emboss
   */
  applyEmboss() {
    this.applyFilter([
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2],
    ]);
  }

  /**
   * Apply summer filter
   */
  applySummer() {
    this.applyColorFilter('#ffff8d');
  }

  /**
   * Apply winter filter
   */
  applyWinter() {
    this.applyColorFilter('#00e5ff');
  }

  /**
   * Apply color filter
   * @param {*} color
   */
  applyColorFilter(color) {
    let r = parseInt(color.substr(1, 2), 16) * 0.5;
    let g = parseInt(color.substr(3, 2), 16) * 0.5;
    let b = parseInt(color.substr(5, 2), 16) * 0.5;

    let modifiedImageData = this.imageData;
    for (let i = 0; i < modifiedImageData.data.length; i = i + 4) {
      if (modifiedImageData.data[i] <= r) modifiedImageData.data[i] = r;
      if (modifiedImageData.data[i + 1] <= g) modifiedImageData.data[i + 1] = g;
      if (modifiedImageData.data[i + 2] <= b) modifiedImageData.data[i + 2] = b;
    }
    this.operationEditedContext.putImageData(modifiedImageData, 0, 0);
    this.operationOrgContext.putImageData(modifiedImageData, 0, 0);
    this.previewImage();
  }

  /**
   * Make Sharp
   */
  applySharp() {
    this.applyFilter([
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ]);
  }

  /**
   * Colorize
   * @param {*} color
   */
  colorize(color) {
    let r = parseInt(color.substr(1, 2), 16) * 0.5;
    let g = parseInt(color.substr(3, 2), 16) * 0.5;
    let b = parseInt(color.substr(5, 2), 16) * 0.5;

    if (this.oldSelectedColorForColorize != undefined) {
      r = -parseInt(this.oldSelectedColorForColorize.substr(1, 2), 16) + r;
      g = -parseInt(this.oldSelectedColorForColorize.substr(3, 2), 16) + g;
      b = -parseInt(this.oldSelectedColorForColorize.substr(3, 2), 16) + b;
    }

    this.oldSelectedColorForColorize = color;

    let modifiedImageData = this.imageData;
    for (let i = 0; i < modifiedImageData.data.length; i = i + 4) {
      modifiedImageData.data[i] += r;
      modifiedImageData.data[i + 1] += g;
      modifiedImageData.data[i + 2] += b;
    }
    this.operationEditedContext.putImageData(modifiedImageData, 0, 0);
    this.operationOrgContext.putImageData(modifiedImageData, 0, 0);
    this.generatePixelMatrix();
    this.previewImage();
  }

  /**
   * Export image
   */
  export() {
    const link = document.createElement('a');
    link.download = 'MiniEdit' + this.selectedFileName + '.png';
    link.href = this.operationEditedCanvas.toDataURL();
    link.click();
  }

  /**
   * Preview image
   * @param {*} canvas
   */
  previewImage(canvas) {
    const image = document.getElementById('foto-image');
    image.src = canvas
      ? canvas.toDataURL()
      : this.operationEditedCanvas.toDataURL();
  }
}
