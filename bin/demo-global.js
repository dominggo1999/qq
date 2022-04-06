#!/usr/bin/env node
/* eslint-disable no-case-declarations */

// 1 common React component with style
// 2 layout React component with style
// 3 pages  React component with style
// 4 hooks  React hook
// 5 store  zustand with immer store

const fs = require('fs');
const util = require('util');

const readdir = util.promisify(fs.readdir);

const writeFile = require('../lib');

const args = process.argv.slice(2);
const cwd = process.cwd();

const validateType = () => {
  if(!args) return false;
  const type = parseInt(args[0], 10);

  if(type > 0 && type <= 5) {
    return type;
  }

  return false;
};

const createFile = async () => {
  const foldersInDir = await readdir(cwd);
  const isSrcExists = foldersInDir.indexOf('src') > -1;

  // no src file
  if(!isSrcExists) return;

  const type = validateType();

  // not a valid operation
  if(!type) return;

  const fileNames = args.slice(1);
  // no file spesified to create
  if(fileNames.length === 0)return;

  // get keyword del to delete folder
  const delKey = fileNames.indexOf('del');
  const nsKey = fileNames.indexOf('ns');
  let isDelete = false;
  let ns = false; // no style (if want to create a single styled component file)
  if(delKey > -1) {
    isDelete = true;
    fileNames.splice(delKey, 1);
  }

  if(nsKey > -1) {
    ns = true;
    fileNames.splice(nsKey, 1);
  }

  switch (type) {
    case 1:
      writeFile({
        folder: 'common',
        style: true,
        fileNames,
        isDelete,
        template: 'React.txt',
        type: ns ? 'file' : 'folder',
      });
      break;

    case 2:
      writeFile({
        folder: 'layout',
        style: true,
        fileNames,
        isDelete,
        template: 'React.txt',
        type: 'folder',
      });
      break;

    case 3:
      writeFile({
        folder: 'pages',
        style: true,
        fileNames,
        isDelete,
        template: 'React.txt',
        type: 'folder',
      });
      break;

    case 4:
      writeFile({
        folder: 'hooks',
        fileNames,
        isDelete,
        template: 'Hook.txt',
        type: 'file',
        style: false,
      });
      break;

    case 5:
      writeFile({
        folder: 'store',
        fileNames,
        isDelete,
        template: 'Store.txt',
        type: 'file',
        style: false,
      });
      break;

    default:
      break;
  }
};

createFile();
