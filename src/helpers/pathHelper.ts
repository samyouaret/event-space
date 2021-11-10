import path from 'path';

export function env(key: string, value?: string): any {
    if (value) {
        process.env[key] = value;
        return value;
    }
    return process.env[key] as string || undefined;
}

export function root_path(filePath: string = ''): string {
    let rootPath: string = path.dirname(path.dirname(__dirname));
    return path.join(rootPath, filePath)
}

export function resource(file: string = ''): string {
    return path.join(path.dirname(__dirname), "resources/", file)
}

export function view_path(view: string = ''): string {
    return path.join(path.dirname(__dirname), "resources", "views", view)
}

export function route_path(route: string = ''): string {
    return path.join(path.dirname(__dirname), "routes", route)
}

export function static_path(file: string = ''): string {
    let rootPath: string = path.dirname(path.dirname(__dirname));
    return path.join(rootPath, "public", file)
}

export function service_path(file: string = ''): string {
    return path.join(path.dirname(__dirname), 'app', "services", file)
}

export function config_path(file: string = ''): string {
    return path.join(path.dirname(__dirname), "config", file)
}

export function database_path(file: string = ''): string {
    return path.join(path.dirname(__dirname), "database", file)
}