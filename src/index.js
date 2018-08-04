const express = require('express');
const bodyParser = require('body-parser');
const execa = require('execa');
const app = express();
const fs = require('fs');

app.use(bodyParser.json());

app.get('/api/nginx/conf', (req, res) =>
  execa('cat', '/etc/nginx/sites-available/default'.split(' '))
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message)),
);
app.post('/api/nginx/conf', ({ params: body }, res) => {
  fs.writeFileSync(`/tmp/default`, body.data);
  execa('cp', '/tmp/default /etc/nginx/sites-available/default'.split(' '))
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message));
});

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
app.get('/api/kubectl/get/:object', ({ params: { object } }, res) => {
  execa('kubectl', `get ${object}`.split(' '))
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message));
});
app.post('/api/kubectl/convert', (req, res) => {
  const { body } = req;
  fs.writeFileSync(`/tmp/docker-compose.${body.name}.yml`, body.data);
  execa('kompose', `convert -f /tmp/docker-compose.${body.name}.yml`.split(' '))
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message));
});
app.post('/api/kubectl/create', (req, res) => {
  const { body } = req;
  fs.writeFileSync(`/tmp/${body.name}.deployservice.yml`, body.data);
  execa('kubectl', `create -f /tmp/${body.name}.deployservice.yml`.split(' '))
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message));
});
app.listen(9876, () => console.log('Example app listening on port 3000!'));
