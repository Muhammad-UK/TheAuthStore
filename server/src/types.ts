export type User = {
  id?: string;
  username: string;
  password: string;
};
export type Product = {
  id?: string;
  name: string;
};
export type Favorite = {
  id?: string;
  user_id: string;
  product_id: string;
};
export interface TError extends Error {
  status: number;
}
export type loginFn = (user?: User) => void;
export type registerFn = (user?: User) => void;
export type AuthFormProps = {
  login: loginFn;
  register: registerFn;
};
