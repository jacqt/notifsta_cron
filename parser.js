// How to use:
// Run using node parser.js {CSV_FILENMAE} {OUTPUT_JSON}


var fs = require('fs');
var csv  = require('csv');
var src_name = process.argv[2]
var dest_name = process.argv[3]
var moment = require('moment');

console.log('source file:', src_name);
console.log('destination file:', dest_name);


fs.readFile(src_name, 'utf8', function(err, data){
  if (err){
    console.log(err);
    return;
  }
  csv.parse(data, {}, function(err, output){
    if (err){
      console.log(err);
      return;
    }
    var notifs = getNotifs(output);
    writeNotifs(notifs, dest_name);
  });
});


function getNotifs(arr){
  var notifs = [];

  var  channel_id = arr[0][0]; //Channel id stored in top left corner
  arr = arr.slice(1, -1); //notifs stored in the 2nd row downards
  
  for (var j = 0; j < arr[0].length; j += 2){
    var location = arr[0][j+1];
    for (var i  = 1; i < arr.length; ++i){
      var t = arr[i][j];
      var msg = arr[i][j+1];
      console.log(channel_id, ' | ' , location,' | ', t ,' | ' , msg);
      notifs.push({
        start_time: moment(t).format('LLL'),
        channel_id: parseInt(channel_id),
        message: msg
      });
    }
  }
  return notifs;
}

function writeNotifs(notifs, dest_name){
  fs.writeFile(dest_name, JSON.stringify(notifs), function(err){
    if (err){
      console.log(err);
      return;
    }
    console.log('Successfully wrote file to ' + dest_name);
  
  });
}
