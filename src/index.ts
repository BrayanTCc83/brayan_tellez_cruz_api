import { APP, PORT } from "./api/APP";
import cors from "cors";
import BuildBlog from "./api/blog";
import BuildProject from "./api/project";

APP.use(cors({
    credentials: true
}));

BuildBlog();
BuildProject();

APP.listen(PORT, () => {
    console.log(`[SERVER]: Init server ${PORT}`);
});