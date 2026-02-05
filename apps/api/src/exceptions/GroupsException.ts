export class GroupsError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = 'GroupsError';
        this.status = status;
    }
}