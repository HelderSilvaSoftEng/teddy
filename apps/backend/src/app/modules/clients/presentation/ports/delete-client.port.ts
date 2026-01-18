export const DELETE_CLIENT_PORT = Symbol('DELETE_CLIENT_PORT');

export interface IDeleteClientPort {
  execute(id: string): Promise<void>;
}
