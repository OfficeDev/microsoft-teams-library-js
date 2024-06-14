export type ApiModule = {
    [key: string]: (...args: any[]) => Promise<any>;
};
