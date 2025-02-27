import STATUS from "../status/statuscode";
// Spanish Data
import aboutmees from "../data/es/aboutme.json";
import mainprojectes from "../data/es/mainproject.json";

// English Data
import aboutmeen from "../data/en/aboutme.json";
import mainprojecten from "../data/en/mainproject.json";

import { APP } from "./APP";
import { Request, Response } from "express";
import { BLOG_URL, INDEX_URL, PROJECT_URL, USER_URL } from "../settings/routes";

export const ROOT_PATH = '/';

const BuildRoot = () => {
    APP.get(ROOT_PATH, (_: Request, res: Response) => {
        res.status(STATUS.SUCCESS).send({
            endpoints: {
                project: [...Object.values(PROJECT_URL)],
                blog: [...Object.values(BLOG_URL)],
                data: [...Object.values(INDEX_URL)],
                user: [...Object.values(USER_URL)]
            }
        });
    });

    APP.get(INDEX_URL.about, (req: Request, res: Response) => {
        const { lang } = {
            lang: 'es',
            ...req.query
        };

        res.status(STATUS.SUCCESS).json(
            lang === 'en' ? aboutmeen : aboutmees
        );
    });

    APP.get(INDEX_URL.mainproject, (req: Request, res: Response) => {
        const { lang } = {
            lang: 'es',
            ...req.query
        };

        res.status(STATUS.SUCCESS).json(
            lang === 'en' ? mainprojecten : mainprojectes
        );
    });

    APP.get(INDEX_URL.images, (req: Request, res: Response) => {
        const mainproject = 'lua';
    });
};

export default BuildRoot;