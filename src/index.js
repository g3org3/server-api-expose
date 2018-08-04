const express = require('express');
const bodyParser = require('body-parser');
const execa = require('execa');
const app = express();
const fs = require('fs');

const __ = require('./asyncHandler');
const execacmd = cmdstr => {
  const [cmd, ...args] = cmdstr.split(' ');
  return execa.stdout(cmd, args);
};

app.use(bodyParser.json());

app.get(
  '/api/nginx/conf',
  __(async () => await execacmd('cat /etc/nginx/sites-available/default')),
);

app.post(
  '/api/nginx/conf',
  __(async ({ params: body }) => {
    fs.writeFileSync(`/tmp/default`, body.data);
    return await execacmd('cp /tmp/default /etc/nginx/sites-available/default');
  }),
);

app.get('/api/nginx/reload', __(async () => await execacmd('nginx -s reload')));
app.get('/api/nginx/stop', __(async () => await execacmd('nginx -s stop')));
app.get('/api/nginx/start', __(async () => await execacmd('nginx')));

app.get(
  '/api/kubectl/get/:object',
  __(
    async ({ params: { object } }) =>
      await execacmd('kubectl', `get ${object} -o json`),
  ),
);

app.post(
  '/api/kubectl/convert',
  __(async req => {
    const {
      body: { name, data },
    } = req;
    fs.writeFileSync(`/tmp/docker-compose.${name}.yml`, data);
    await execacmd(`kompose convert -f /tmp/docker-compose.${name}.yml`);
    return await execacmd(
      `cat ./${name}-service.yaml ./${name}-deployment.yaml`,
    );
  }),
);

app.post(
  '/api/kubectl/create',
  __(async req => {
    const { body } = req;
    fs.writeFileSync(`/tmp/${body.name}.deployservice.yml`, body.data);
    return await execacmd(
      `kubectl create -f /tmp/${body.name}.deployservice.yml`,
    );
  }),
);

app.listen(9876, () => console.log('Example app listening on port 3000!'));
