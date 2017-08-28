let webpack = require('webpack'),
	path = require('path');

let entryDir = path.resolve(__dirname ,'source');
let outputDir = path.resolve(__dirname ,'public');
console.log(entryDir);
let config = {
	entry: entryDir + '/index.jsx',
	output:{
		path: outputDir,
		filename: 'bundel.js'
	},
	module : {
    loaders : [
      {
        test : /\.jsx?/,
        include : entryDir,
        loader : 'babel-loader'
      }
    ]
	
	}
};

module.exports = config;