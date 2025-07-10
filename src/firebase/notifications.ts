import crypto from "crypto";
import app from "./config";
import z from "zod";
import { getFirestore, collection, setDoc, doc, getDocs, deleteDoc } from "firebase/firestore";
import type { Firestore, CollectionReference, DocumentData } from "firebase/firestore";

export const SubscriptorSchema = z.object({
    endpoint: z.string({
        invalid_type_error: 'The subscriptor endpoint must be an string.',
        required_error: 'The subscriptor endpoint is required.',
    }).url({
        message: 'The subscriptor should have a valid enpoint.'
    }),
    expirationTime: z.number({
        invalid_type_error: 'The subscriptor expiration time must be a number.'
    }).optional(),
    keys: z.object({
        p256dh: z.string({
            invalid_type_error: 'The p256h must be an string.',
            required_error: 'The p256h is required.'
        }),
        auth: z.string({
            invalid_type_error: 'The auth must be an string.',
            required_error: 'The auth is required.'
        })
    })
})

export type ISubscriptor = z.infer<typeof SubscriptorSchema>;

export interface ISubscriptorStored extends ISubscriptor {
    id: string
}

export const BLOGPOST = 'blogpost';
export const COURSE = 'course';
export const LESSON = 'lesson';
export const NEWS = 'news';

export const SPANISH = 'es';
export const ENGLISH = 'en';
export const CHINESE = 'zh';

const baseSchema = {
  body: z.string({
    invalid_type_error: 'The body must be a string.',
    required_error: 'The body for notification is required.',
  }).trim().min(10, {
    message: 'The minium for body content is 10 chars when trim.',
  }).max(100, {
    message: 'The body content cannot excced 100 characters.',
  }),
  name: z.string({
    invalid_type_error: 'The body must be a string.',
    required_error: 'The body for notification is required.',
  }).trim().min(5, {
    message: 'The minium for name for post is 5 chars when trim.',
  }).max(30, {
    message: 'The name for post cannot excced 30 characters.',
  }),
  lang: z.enum([ SPANISH, ENGLISH, CHINESE ], {
    invalid_type_error: 'The lang must be a valid string.',
    required_error: 'The lang is required to send notification.'
  })
};

export const NotificationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal(LESSON),
    id: z.string({
        invalid_type_error: 'The id must be a string.',
        required_error: 'The id for blog, course, lesson is required.',
    }).trim(),
    lesson: z.string({
      invalid_type_error: 'The lesson id must be a string.',
      required_error: 'The lesson id is required when type is lesson.',
    }).trim(),
    ...baseSchema,
  }),
  z.object({
    type: z.literal(COURSE),
    id: z.string({
        invalid_type_error: 'The id must be a string.',
        required_error: 'The id for blog, course, lesson is required.',
    }).trim(),
    ...baseSchema,
  }),
  z.object({
    type: z.literal(BLOGPOST),
    id: z.string({
        invalid_type_error: 'The id must be a string.',
        required_error: 'The id for blog, course, lesson is required.',
    }).trim(),
    ...baseSchema,
  }),
  z.object({
    type: z.literal(NEWS),
    ...baseSchema,
  }),
]);

export default class NotificationsDatabase {
    static NOTIFICATIONS_COLLECTION = 'notifications';

    db: Firestore;
    notifications: CollectionReference<DocumentData, DocumentData>;

    constructor () {
        this.db = getFirestore(app);
        this.notifications = collection(this.db, NotificationsDatabase.NOTIFICATIONS_COLLECTION);
    }

    async RegisterSubscriptor(subscriptor: ISubscriptor) {
        const id = crypto.randomUUID();
        return setDoc(doc(this.notifications, id), subscriptor);
    }

    async GetSubscriptors(): Promise<ISubscriptorStored[]> {
        return getDocs(this.notifications)
            .then( snap => snap.docs.map(doc => ({ id: doc.id, ...(doc.data() as ISubscriptor) })) )
            .catch( err => {
                console.error(`[Server] Error when get subscriptors: ${err}`);
                return [];
            });
    }

    async RemoveUnactiveSubscriptors(toRemove: ISubscriptorStored[]): Promise<Promise<void>[]> {
        return toRemove.map( async ({ id, endpoint }) => {
            const ref = doc(this.db, NotificationsDatabase.NOTIFICATIONS_COLLECTION, id);
            return deleteDoc(ref)
                .then( () => {
                    console.log(`[Server] Subscription '${endpoint}' removed.`);
                });
        });
    }
}