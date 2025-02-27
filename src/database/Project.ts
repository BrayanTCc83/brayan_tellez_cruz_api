import { pool } from "./database";

interface IProject {
    id?: string
    created_at?: string
    updated_at?: string
    name?: string
    url?: string
    repository?: string
    preview?: string
    description?: string
};

export default class Project {
    id?: string;
    created_at?: string;
    updated_at?: string;
    name?: string;
    url?: string;
    repository?: string;
    preview?: string;
    description?: string;

    private constructor(data: IProject) {
        this.id = data.id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.name = data.name;
        this.url = data.url;
        this.repository = data.repository;
        this.preview = data.preview;
        this.description = data.description;
    }

    public static async createProject({ name, preview, description, repository, url } : IProject): Promise<Project> {
        const insertProject = "INSERT INTO brayantellez.project(name, url, repository, preview, description) VALUES($1, $2, $3, $4, $5) RETURNIGN *";
        const result = await pool.query(insertProject, [ name, url, repository, preview, description ]);
        if(result.rowCount === 0) {
            throw new Error('Error on create project');
        }
        return Promise.resolve(
            new Project(result.rows[0] as IProject)
        );
    }

    public async updateProject({ name, url, repository, preview, description }: Project): Promise<void> {
        let updateProject = "UPDATE brayantellez.project SET";
        let args: string[] = [];
        
        if(name) {
            args.push(name);
            this.name = name;
            updateProject += ` name = $${args.length}`;
        }
        if(url) {
            args.push(url);
            this.url = url;
            updateProject += ` url = $${args.length}`;
        }
        if(repository) {
            args.push(repository);
            this.repository = repository;
            updateProject += ` repository = $${args.length}`;
        }
        if(preview) {
            args.push(preview);
            this.preview = preview;
            updateProject += ` preview = $${args.length}`;
        }
        if(description) {
            args.push(description);
            this.description = description;
            updateProject += ` description = $${args.length}`;
        }

        updateProject += ` WHERE id = ${this.id}`;
        const result = await pool.query(updateProject, args);
        if(result.rowCount === 0) {
            throw new Error('Error on update project');
        }
        return Promise.resolve();
    }

    public async 
}