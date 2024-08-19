import express from 'express';
import * as client from 'prom-client';
const port = 3000;

const app = express();
const register = new client.Registry();

const appRequestCounter = new client.Counter({
  name: 'app_requests_count',
  help: 'total all http requests count',
  labelNames: ['app_name', "endpoint"],
});

const headCounter = new client.Counter({
  name: 'head_count',
  help: 'number of head',
  labelNames: ['app_name', "endpoint"],

  // add `as const` here to enforce label names
  // labelNames: ['method'] as const,
});

const tailCounter = new client.Counter({
  name: 'tail_count',
  help: 'number of tail',
  labelNames: ['app_name', "endpoint"],

  // add `as const` here to enforce label names
  // labelNames: ['method'] as const,
});

const flipCounter = new client.Counter({
  name: 'flip_count',
  help: 'number of flip',
  labelNames: ['app_name', "endpoint"],

  // add `as const` here to enforce label names
  // labelNames: ['method'] as const,
});
const defaultLabels = { serviceName: 'coin-flip-v1' };

register.registerMetric(headCounter)
register.registerMetric(tailCounter)
register.registerMetric(flipCounter)
register.registerMetric(appRequestCounter)

register.setDefaultLabels(defaultLabels);
client.collectDefaultMetrics({ register });



app.get('/', (req, res) => {
  appRequestCounter.labels('prom_nodets_app', req.path).inc();
  res.send('Hello World');
});

app.get('/metrics', async(req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
})

app.get('/flip', async(req, res) => {
  const coin = Math.random() > 0.5 ? 'head' : 'tail';
  if (coin === 'head') {
    headCounter.labels('prom_nodets_app', req.path).inc();
  } else {
    tailCounter.labels('prom_nodets_app', req.path).inc();
  }
  flipCounter.labels('prom_nodets_app', req.path).inc();
  res.json({ coin });
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});