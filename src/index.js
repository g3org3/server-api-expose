const express = require('express');
const bodyParser = require('body-parser');
const execa = require('execa');
const app = express();
const fs = require('fs');
const execacmd = cmdstr => {
  const [cmd, ...args] = cmdstr.split(' ');
  return execa(cmd, args);
};
app.use(bodyParser.json());

app.get('/api/nginx/conf', (req, res) =>
  execacmd('cat /etc/nginx/sites-available/default')
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message)),
);
app.post('/api/nginx/conf', ({ params: body }, res) => {
  fs.writeFileSync(`/tmp/default`, body.data);
  execacmd('cp /tmp/default /etc/nginx/sites-available/default')
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message));
});

app.get('/api/nginx/reload', (req, res) =>
  execacmd('nginx -s reload')
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message)),
);
app.get('/api/nginx/stop', (req, res) => {
  execacmd('nginx -s stop')
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message));
});
app.get('/api/nginx/start', (req, res) =>
  execacmd('nginx')
    .then(({ stdout }) => res.json({ stdout }))
    .catch(err => res.json(err.message)),
);
app.get('/api/kubectl/get/:object', ({ params: { object } }, res) => {
  execacmd('kubectl', `get ${object} -o json`)
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message));
});
app.post('/api/kubectl/convert', (req, res) => {
  const { body } = req;
  fs.writeFileSync(`/tmp/docker-compose.${body.name}.yml`, body.data);
  execacmd('kompose', `convert -f /tmp/docker-compose.${body.name}.yml`)
    .then(() =>
      execa(
        'cat',
        `./${body.name}-service.yaml ./${body.name}-deployment.yaml`.split(' '),
      ),
    )
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message));
});
app.post('/api/kubectl/create', (req, res) => {
  const { body } = req;
  fs.writeFileSync(`/tmp/${body.name}.deployservice.yml`, body.data);
  execacmd(`kubectl create -f /tmp/${body.name}.deployservice.yml`)
    .then(({ stdout }) => res.send(stdout))
    .catch(err => res.json(err.message));
});

app.listen(9876, () => console.log('Example app listening on port 3000!'));
