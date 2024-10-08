import { time } from 'console';
import express from 'express';
import * as client from 'prom-client';
import dotenv from 'dotenv';

dotenv.config();
const port = process.env.PORT || 3322

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


//-------------- Counter --------------//
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

//-----------------------------------//

//-------------- Gauge --------------//

const requestInprogress = new client.Gauge({
  name: 'app_requests_inprogress',
  help: 'number of request in progress',
  labelNames: ['app_name', "endpoint"],

})

const requestLastServed = new client.Gauge({
  name: 'app_last_served',
  help: 'time the app was last served',
  // labelNames: ['app_name', "endpoint"],

})

register.registerMetric(requestInprogress)
register.registerMetric(requestLastServed)

app.get('/gauge', async(req, res) => {
  requestInprogress.labels('prom_nodets_app', req.path).inc()
  await sleep(2500)
  requestLastServed.set(Date.now())
  requestInprogress.labels('prom_nodets_app', req.path).dec()
  res.send('progress done')
})

//-----------------------------------//

//-------------- Summary --------------//
const appResponseTime = new client.Summary({
  name: 'app_response_latency_seconds',
  help: 'response latency seconds time of the app',
})

register.registerMetric(appResponseTime)

app.get('/summary', async(req, res) => {
  const startTime = Date.now() - 7 * 24 * 60 * 60 * 1000
  const randTime = getRandomSleepTime()

  await sleep(randTime)
  const endTime = Date.now() - 7 * 24 * 60 * 60 * 1000
  const timetaked =  endTime - startTime


  res.json({
    name: 'summary done',
    randTime
  })
  
  appResponseTime.observe(timetaked / 1000)
})
//-----------------------------------//


function getRandomSleepTime() {
  // Generate a random number between 1 and 5000 ms
  const randomNumber = Math.floor(Math.random() * 5000) + 1;
  return randomNumber;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});