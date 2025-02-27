import { APP, PORT } from "./api/APP";
import cors from "cors";
import express from "express";
import BuildBlog from "./api/blog";
import BuildProject from "./api/project";
import BuildRoot from "./api/root";

APP.use(cors({
    credentials: true
}));
APP.use('/static', express.static('public'));

BuildRoot();
BuildBlog();
BuildProject();

APP.listen(PORT, () => {
    console.log(`[SERVER]: Init server ${PORT}`);
});