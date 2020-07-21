const path = require('path');
const fs = require('fs');
const directoryPath = path.join(__dirname, 'assets/gallery-images');

var data = {
  'properties':[]
}

fs.readdir(directoryPath, function(err, files){

  if(err){
    return console.log('Unable to scan directory: ' + err);
  }
  files.forEach(function(file, index){
    data.properties.push({"index":index, "path":'/assets/gallery-images/' + file});
    let writeData = JSON.stringify(data);

fs.writeFile('./webpack/components/data/data.js', 'const data = ' + writeData + ';', function(err){
  if(err) return console.log(err);
  console.log(writeData + " >> data.js");
})
  }
  )
}

)


