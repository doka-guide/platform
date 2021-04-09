const fs = require("fs");
const path = require('path')

// All default folders for Platform
const defaultPlatform = [
  'data',
  'fonts',
  'images',
  'includes',
  'layouts',
  'manifest.json',
  'pages',
  'people',
  'scripts',
  'styles',
]

// Looking for content repository folders
const folderPath = 'src'
const allFolders = fs.readdirSync(folderPath)

const contentFolders = allFolders.filter(function(el) {
  return defaultPlatform.indexOf(el) < 0
})

// Creating JSON for each content folder
contentFolders.forEach(el => {
  const newFileName = el + '.json'
  const newFilePath = path.join('src', el, newFileName);

  fs.open(newFilePath, 'w', (err) => {
    if(err) throw err;
    console.log('File created');
  })

  const myJSON = '{"tags": "' + el + '"}'

  fs.appendFile(newFilePath, myJSON, (err) => {
    if(err) throw err;
    console.log('Data has been added!');
  })
})


