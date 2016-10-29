import Promise from 'bluebird'
import path from 'path'
var fse = Promise.promisifyAll(require('fs-extra'))

import {
  config,
  coreUtils
} from '../../'

export function exist(pathFile) {
  try{
    fse.statSync(pathFile)
    return true
  }catch(e){
    return false
  }
}

export function changePath(pathEnv, change) {
  pathEnv = pathEnv.replace(config.root, '').replace(/^\//, '').split('/')
  pathEnv[0] = change

  return path.join(config.root, pathEnv.join('/'))
}

/**
 * This method checks that the path leads to a file and return the content as UTF-8 content
 * @param  {string} path The path
 * @return {string}      The content of the UTF-8 file
 */
export function getContent(pathFile) {
  var res = null
  if(typeof pathFile !== 'undefined' && pathFile !== null && pathFile !== '') {
    if (exist(pathFile)) {
      res = fse.readFileSync(pathFile, 'utf8')
    }
  }
  return res
}

/**
 * synchronous fse walker to get folders with recursive option
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFoldersSync(dirname, recursive = true) {
  let items = []
  fse.readdirSync(dirname).map(function(fileName) {
    let pathFile = path.join(dirname, fileName)
    let stat = fse.statSync(pathFile)
    if (stat.isDirectory()) {
      items.push(pathFile)
      if (recursive) {
        let filesInDir = coreUtils.file.getFoldersSync(pathFile, recursive)
        items = items.concat(filesInDir)
      }
    }
  })

  return items
}

/**
 * Promisified fse walker to get folders with recursive option
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFoldersAsync(dirname, recursive = true) {
  let items = []
  return fse.readdirAsync(dirname).map(function(fileName) {
    let pathFile = path.join(dirname, fileName)
    return fse.statAsync(pathFile).then(function(stat) {
      if (stat.isDirectory()) {
        items.push(pathFile)
        if (recursive) {
          return coreUtils.file.getFoldersAsync(pathFile, recursive).then(function(filesInDir) {
            items = items.concat(filesInDir)
          })
        }
      }
      return
    })
  }).then(function() {
    return items
  })
}

/**
 * synchronous fse walker with recursive and extension options
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFilesSync(dirname, recursive = true, filterExt = '') {
  let items = []
  fse.readdirSync(dirname).map(function(fileName) {
    let pathFile = path.join(dirname, fileName)
    let stat = fse.statSync(pathFile)
    if (stat.isFile()) {
      let extFile = path.extname(fileName)
      if (filterExt === '' || extFile === filterExt) {
        items.push(pathFile)
      }
    }
    if (stat.isDirectory() && recursive) {
      let filesInDir = coreUtils.file.getFilesSync(pathFile, recursive, filterExt)
      items = items.concat(filesInDir)
    }
  })

  return items
}

/**
 * Promisified fse walker with recursive and extension options
 * @param  {String}  dirname   dir path
 * @param  {Boolean} recursive do we recurse in the subfolders
 * @param  {String}  filterExt extension or ''
 * @return {array}             array of pathfiles
 */
export function getFilesAsync(dirname, recursive = true, filterExt = '') {
  let items = []
  return fse.readdirAsync(dirname).map(function(fileName) {
    let pathFile = path.join(dirname, fileName)
    return fse.statAsync(pathFile).then(function(stat) {
      if (stat.isFile()) {
        let extFile = path.extname(fileName)
        if (filterExt === '' || extFile === filterExt) {
          return items.push(pathFile)
        }
        return 
      }
      if (recursive) {
        return coreUtils.file.getFiles(pathFile, recursive, filterExt).then(function(filesInDir) {
          items = items.concat(filesInDir)
        })
      }
    })
  }).then(function() {
    return items
  })
}