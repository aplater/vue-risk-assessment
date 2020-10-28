const fs = require('fs');

const hmrRuntime = './node_modules/parcel-bundler/src/builtins/hmr-runtime.js';
let content = fs.readFileSync(hmrRuntime);


const search = "var ws = new WebSocket(protocol + '://' + hostname + ':' + process.env.HMR_PORT + '/')";
content = content.toString().replace(
    search,
    "var ws = new WebSocket(protocol + '://' + hostname.replace(/^(\d+)/, process.env.HMR_PORT) + ':443/' )"
);

fs.writeFileSync(hmrRuntime, content);