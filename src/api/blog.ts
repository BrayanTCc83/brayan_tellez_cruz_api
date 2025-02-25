import { Request, Response } from "express";
import { APP } from "./APP";
import STATUS from "../status/statuscode";

export const BLOG_PATH = '/blogs';

const BuildBlog = () => {
    APP.get(BLOG_PATH, (req: Request, res: Response) => {
        res.status(STATUS.SUCCESS).send({
            
        });
    });
};

export default BuildBlog;