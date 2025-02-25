import { Request, Response } from "express";
import { APP } from "./APP";
import STATUS from "../status/statuscode";

export const PROJECT_PATH = '/projects';

const BuildProject = () => {
    APP.get(PROJECT_PATH, (req: Request, res: Response) => {
        res.status(STATUS.SUCCESS).send({
            
        });
    });
};

export default BuildProject;