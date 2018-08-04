const express = require('express');
const execa = require('execa');
const app = express();

app.get('/api/nginx/conf', (req, res) => res.send('Hello World!'));
app.get('/api/nginx/reload', (req, res) =>
  execa('nginx', '-s reload'.split(' '))
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message)),
);
app.get('/api/nginx/stop', (req, res) => {
  execa('nginx', '-s stop'.split(' '))
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message));
});
app.get('/api/nginx/start', (req, res) =>
  execa('nginx')
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message)),
);
app.listen(9876, () => console.log('Example app listening on port 3000!'));
