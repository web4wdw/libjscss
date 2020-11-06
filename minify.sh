#!/bin/bash
# sudo apt install -y nodejs npm 
# npm install uglify-es -g
# npm install uglifycss -g

cd "$(dirname "$0")"

minjs() {
	echo minjs $1
	local file=$1
	local dir=$(dirname $file)
	local basename=$(basename  -s .js $file)
	pushd $dir 1>/dev/null
	uglifyjs --source-map url="$basename.min.js.map" -c -m -o "$basename.min.js" "$(basename $file)"
	popd 1>/dev/null
}

minjs mask/mask.js
minjs toptip/toptip.js
minjs simple/simple.js
