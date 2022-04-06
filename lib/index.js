const cwd = process.cwd();
const fs = require('fs');
const util = require('util');
const path = require('path');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const readTemplate = async (templateName) => {
  const templateLocation = path.resolve(__dirname, '..', 'lib', 'template', templateName);
  const textContent = readFile(templateLocation, 'utf8');
  return textContent;
};

const useTemplate = async (options, fileContent, newFiles) => {
  const {
    type,
    style,
    folder,
  } = options;

  const styleTemplate = await readTemplate('ReactStyle.txt');

  const files = newFiles.map((i, id) => {
    return fileContent.replaceAll('Name', i);
  });

  if(type === 'folder') {
    // Create folder here
    newFiles.forEach((fileName, id) => {
      const targetPath = path.resolve(cwd, 'src', folder, fileName);

      if (!fs.existsSync(targetPath)) {
        fs.mkdir(targetPath, () => {
          console.log(`Folder ${folder}/${fileName} is succesfully created`);

          // After folder created, create files
          const newFilePath = path.resolve(targetPath, newFiles[id]);

          fs.writeFileSync(`${newFilePath}.jsx`, files[id]);
          console.log(`File ${folder}/${fileName}/${newFiles[id]}.jsx is succesfully created`);

          style && fs.writeFileSync(`${newFilePath}.style.jsx`, styleTemplate);
          console.log(`File ${folder}/${fileName}/${newFiles[id]}.style.jsx is succesfully created\n`);
        });
      }
    });
  }else{
    newFiles.forEach((fileName, id) => {
      const targetPath = path.resolve(cwd, 'src', folder, fileName);

      if(folder === 'common') {
        fs.writeFileSync(`${targetPath}.style.jsx`, styleTemplate);
        console.log(`File ${folder}/${fileName}/${newFiles[id]}.style.jsx is succesfully created`);
      }else{
        fs.writeFileSync(`${targetPath}.jsx`, files[id]);
        console.log(`File ${folder}/${fileName}/${newFiles[id]}.jsx is succesfully created`);
      }
    });
  }
};

const deleteFiles = async (files, folder) => {
  files.forEach(async (fileName) => {
    const targetPath = path.resolve(cwd, 'src', folder, fileName);

    fs.rm(targetPath, { recursive: true }, (err) => {
      console.log(`${fileName} succesfully deleted`);
    });
  });
};

const filter = async (fileNames, folder) => {
  const foldersInDir = await readdir(`${cwd}/src/${folder}`);

  const foldersNoExt = foldersInDir.map((i) => i.replace(/\.[^/.]+$/, ''));
  const existedFiles = [];

  const newFiles = fileNames.filter((i) => {
    const targetIndex = foldersNoExt.indexOf(i);
    const notExists = targetIndex === -1;

    if(!notExists) {
      existedFiles.push(foldersInDir[targetIndex]);
    }
    return notExists;
  });

  return { existedFiles, newFiles };
};

const writeFile = async (options) => {
  const {
    type = 'folder',
    folder,
    template,
    isDelete,
    fileNames,
  } = options;

  const targetPath = `${cwd}/src/${folder}`;
  if (!fs.existsSync(targetPath)) {
    fs.mkdir(targetPath, () => {
      console.log(`Created folder ${folder} because it doesn't exists`);
    });
  }

  // filter already exist files/folders
  const { existedFiles, newFiles } = await filter(fileNames, folder, type);

  if(isDelete) {
    deleteFiles(existedFiles, folder);
  }else{
    const fileContent = await readTemplate(template);

    useTemplate(options, fileContent, newFiles);
  }
};

module.exports = writeFile;
