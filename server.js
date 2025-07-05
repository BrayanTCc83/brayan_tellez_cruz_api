const express = require('express');
const WebPush = require('web-push');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const translate = require('./translation.json');

const app = express();

const subscriptionsPath = path.join(__dirname, 'subscriptions.json');

app.use(cors({
  origin: process.env.SITE,
  methods: ['GET', 'POST']
}));

app.use(bodyParser.json({}));

app.use(express.static('public'));

WebPush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.PUBLIC_KEY,
  process.env.PRIVATE_KEY
);

async function readSubscriptions() {
  try {
    const data = await fsPromises.readFile(subscriptionsPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fsPromises.writeFile(subscriptionsPath, '[]', 'utf-8');
      console.log('[Server] subscriptions.json was created.');
      return [];
    }

    console.error('[Server] Error at read subscriptions.json:', err);
    throw err;
  }
}

async function saveSubscriptions(subs) {
  await fsPromises.writeFile(subscriptionsPath, JSON.stringify(subs, null, 2), 'utf-8');
}

app.post('/api/subscribe', async (req, res) => {
  console.log('[Server] POST /api/subscribe.');
  const subscription = req.body;
  const currentSubs = await readSubscriptions();
  const exists = currentSubs.find(sub => sub.endpoint === subscription.endpoint);

  if (!exists) {
    currentSubs.push(subscription);
    await saveSubscriptions(currentSubs);
    console.log(`[Server] New Subscription: ${subscription.endpoint}`);
  } else {
    console.log(`[Server] Subscription already exists: ${subscription.endpoint}`);
  }

  res.status(201).json({ message: 'Subscription Stored.' });
});

app.get('/api/subscriptions', async (req, res) => {
  console.log('[Server] GET /api/subscriptions.');
  const currentSubs = await readSubscriptions();
  res.json(currentSubs);
});

const BLOGPOST = 'blogpost';
const COURSE = 'course';
const LESSON = 'lesson';

app.post('/api/notify', async (req, res) => {
  console.log('[Server] POST /api/notify.');
  const { body, type, lang, name, ...data } = req.body;

  let url = `${process.env.SITE}`;
  let title = `${translate.notifications[lang][type]}: ${name}`;

  if (type === BLOGPOST) {
    url += `/${lang}/blogs/${data.id}`;
  } else if (type === COURSE) {
    url += `/${lang}/learn/${data.id}`;
  } else if (type === LESSON) {
    url += `/${lang}/learn/${data.id}/${data.lesson}`;
  }

  const payload = JSON.stringify({ title, body, url });
  let currentSubs = await readSubscriptions();
  const olds = currentSubs.length;
  const errors = [];

  try {
    await Promise.all(
      currentSubs.map(sub =>
        WebPush.sendNotification(sub, payload).catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log('[Server] Invalid Subscription, removing.');
            currentSubs = currentSubs.filter(s => s.endpoint !== sub.endpoint);
            console.log(`[Server] Subscription '${sub.endpoint}' removed.`);
            errors.push(err);
          } else {
            throw err;
          }
        })
      )
    );

    if (errors.length > 0) throw errors[0];

    res.status(200).json({ message: 'Sended Notifications.' });
  } catch (err) {
    await saveSubscriptions(currentSubs);
    console.error('[Server] Error when sending notifications.');
    res.status(500).json({ error: `${olds - currentSubs.length} didn't send, there were errors.` });
  }
});

app.get("/greet", (req, res) => {
    const { name } = req.query;
    res.send({ msg: `Welcome ${name}!` });
});

process.env.SITE?.includes('localhost') ? app.listen(3000, () => {
  console.log("[Server] Listen on port 3000");
}) : {}

module.exports = app;