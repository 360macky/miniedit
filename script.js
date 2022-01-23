let photograph;

const selectImage = () => {
  document.getElementById('foto-file').click();
  document.getElementById('download-button-text').innerText = 'Download edit';
  document.getElementById('reupload-button').classList.remove('hidden');
};

const reuploadImage = () => {
  document.getElementById('foto-file').click();
};

const makeGreyScale = () => {
  photograph.grayscale();
};

const makeBlur = () => {
  photograph.applyBlur();
};

const download = () => {
  document.getElementById('download-button-text').innerText = 'Downloaded!';
  photograph.export();
};

const decreaseBrightness = () => {
  photograph.decreaseBrightness();
};

const increaseBrightness = () => {
  photograph.increaseBrightness();
};

const makeSharp = () => {
  photograph.applySharp();
};

const makeEmboss = () => {
  photograph.applyEmboss();
};

const makeSummer = () => {
  photograph.applySummer();
};

const makeWinter = () => {
  photograph.applyWinter();
};

window.onload = () => {
  photograph = new Filters();
};
