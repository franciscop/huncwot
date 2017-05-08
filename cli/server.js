// Copyright 2016 Zaiste & contributors. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const debug = require('debug')('server');

const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const { join, resolve, extname, parse } = require('path');
const chokidar = require('chokidar');

const Huncwot = require('../');
const { page } = require('../view');

const currentDirectory = process.cwd();

let concat = (a, b) => a.concat(b);

function scan(directory, recursive = true) {
  return fs
    .readdirAsync(directory)
    .map(el =>
      fs.statAsync(join(directory, el)).then(stat => {
        if (stat.isFile()) {
          return el;
        } else {
          return !recursive
            ? []
            : scan(join(directory, el))
                .reduce(concat, [])
                .map(_ => join(el, _));
        }
      })
    )
    .reduce(concat, []);
}

async function init(app) {
  const pages = await scan('./pages')
    .filter(f => extname(f) === '.marko')
    .map(f => {
      const { dir, name } = parse(f);

      const pathname = join(dir, name);
      let route;

      if (name === 'index') {
        route = `/${dir}`
      } else {
        route = `/${dir}/${name}`
      }

      return { route, pathname };
    })

  for (let { route, pathname } of pages) {
    let handler = () => ({});
    try { handler = require('./asdf') } catch (error) {}

    app.get(route, request => page(pathname, handler(request)))
  }
}

function serve({ port, dir }) {
  const watcher = chokidar.watch(dir, {
    ignored: /[\/\\]\./,
    persistent: true,
    cwd: '.'
  });

  watcher.on('change', () => {})

  let server = join(currentDirectory, 'server.js');

  try {
    require(server);
  } catch (_) {
    const app = new Huncwot();
    init(app);
    app.listen(port)
  }

  console.log(`---\nServer running at http://localhost:${port}`);
}

module.exports = {
  builder: _ => _
    .option('port', { alias: 'p', default: 5544 })
    .default('dir', '.'),
  handler: serve
};