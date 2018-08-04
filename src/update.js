const express = require('express');
const execa = require('execa');
const app = express();
const path = require('path');
const execacmd = (cmdstr, config) => {
  const [cmd, ...args] = cmdstr.split(' ');
  return execa.stdout(cmd, args, config);
};

app.get('/update', (req, res) => {
  const dir = path.resolve(__dirname, '../');
  execacmd('git pull', { cwd: dir })
    .then(output => res.send(output).end())
    .catch(err => res.send(err));
});

app.listen(5432, () => console.log('Example app listening on port 3000!'));
