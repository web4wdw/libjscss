#!/bin/bash
# sudo apt install -y nodejs npm 
# npm install uglify-js -g
# npm install uglifycss -g

cd "$(dirname "$0")"

minjs() {
	local file=$1
	local dir=$(dirname $file)
	local basename=$(basename  -s .js $file)
	uglifyjs --source-map url=$basename.min.js.map -c -m -o "$dir/$basename.min.js" "$file"
}

minjs mask/mask.js
minjs toptip/toptip.js
minjs simple/simple.js
