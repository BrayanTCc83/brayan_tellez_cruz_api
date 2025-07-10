import express from 'express';
import WebPush from 'web-push';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';

import translate from '../translation.json';
import NotificationsDatabase, { ISubscriptorStored, SubscriptorSchema } from './firebase/notifications';

const expressApp = express();
let notifications = process.env.SITE?.includes('localhost') ? null : new NotificationsDatabase();

let subscriptionsPath = '';
if(process.env.SITE?.includes('localhost')) {
  subscriptionsPath = path.join(__dirname, 'subscriptions.json');
}else {
  subscriptionsPath = path.join('/tmp', 'subscriptions.json');
}

expressApp.use(cors({
  origin: process.env.SITE,
  methods: ['GET', 'POST']
}));

expressApp.use(bodyParser.json({}));

expressApp.use('/', express.static(path.join(__dirname, '..', 'public')));

WebPush.setVapidDetails(
  `mailto:${process.env.EMAIL}`,
  process.env.PUBLIC_KEY??'',
  process.env.PRIVATE_KEY??''
);

expressApp.post('/api/subscribe', async (req, res) => {
  console.log('[Server] POST /api/subscribe.');

  const subscription = SubscriptorSchema.safeParse(req.body);
  if(!subscription.success) {
    console.warn('[Server] The subscription has no correct data.');
    res.status(500).json({ message: subscription.error.errors.join(';') });
    return;
  }
  
  notifications?.RegisterSubscriptor(subscription.data);
  try {
    console.log('[Server] POST /api/subscribe.');
    res.status(201).json({ message: 'Subscription Stored.' });
  } catch(err) {
    console.warn('[Server] An error ocurred when try to save on database.');
    res.status(500).json({ message: `Subscription couldn't be Stored.` });
  }
});

expressApp.get('/api/subscriptions', async (req, res) => {
  console.log('[Server] GET /api/subscriptions.');

  const currentSubs = await notifications?.GetSubscriptors() ?? [];
  res.json(currentSubs);
});

const BLOGPOST = 'blogpost';
const COURSE = 'course';
const LESSON = 'lesson';

expressApp.post('/api/notify', async (req, res) => {
  console.log('[Server] POST /api/notify.');
  const { body, type, lang, name, ...data } = req.body;

  let url = `${process.env.SITE}`;
  let title = `${(translate.notifications as any)[lang][type]}: ${name}`;

  if (type === BLOGPOST) {
    url += `/${lang}/blogs/${data.id}`;
  } else if (type === COURSE) {
    url += `/${lang}/learn/${data.id}`;
  } else if (type === LESSON) {
    url += `/${lang}/learn/${data.id}/${data.lesson}`;
  }

  const payload = JSON.stringify({ title, body, url });
  const currentSubs = await notifications?.GetSubscriptors() ?? [];
  const toRemove: ISubscriptorStored[] = [];
  const errors: unknown[] = [];

  try {
    await Promise.all(
      currentSubs.map(sub =>
        WebPush.sendNotification(sub, payload).catch(err => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            console.log('[Server] Invalid Subscription, removing.');
            const remove = currentSubs.find(s => s.endpoint === sub.endpoint);
            if(remove) {
              toRemove.push(remove);
            }
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
    await notifications?.RemoveUnactiveSubscriptors(toRemove);
    console.error('[Server] Error when sending notifications.');
    res.status(500).json({ error: `${currentSubs.length - toRemove.length} didn't send, there were errors.` });
  }
});

process.env.SITE?.includes('localhost') ? expressApp.listen(3000, () => {
  console.log("[Server] Listen on port 3000");
  try {
    notifications = new NotificationsDatabase();
    console.log('[Server] Notifications Database init success.')
  } catch(err) {
    console.error(`[Server] Databases init was not successfull: ${err}`);
    notifications = null;
  }
}) : {}

export default expressApp;