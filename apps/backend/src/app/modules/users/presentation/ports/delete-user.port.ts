export const DELETE_USER_PORT = Symbol('DELETE_USER_PORT');

export interface IDeleteUserPort {
  execute(id: string): Promise<void>;
}
