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