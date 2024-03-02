import pg from "pg";
import { v4 as uuidv4 } from "uuid";
import { Favorite, Product, TError, User } from "./types";
import bcrypt from "bcrypt";
import { JwtPayload, sign, verify } from "jsonwebtoken";

const JWT = process.env.JWT || "secret";

export const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_auth_store_db"
);

export const createTables = async () => {
  const SQL = /*sql*/ `
        DROP TABLE IF EXISTS favorites;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS users;

        CREATE TABLE users(
            id UUID PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) UNIQUE NOT NULL
        );

        CREATE TABLE products(
            id UUID PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        );
        
        CREATE TABLE favorites(
            id UUID PRIMARY KEY,
            product_id UUID REFERENCES products(id) NOT NULL,
            user_id UUID REFERENCES users(id) NOT NULL,
            CONSTRAINT unique_user_product UNIQUE(product_id, user_id)
        );
    `;
  await client.query(SQL);
};

export const createUser = async ({
  username,
  password,
}: User): Promise<User> => {
  const SQL = /*sql*/ `
    INSERT INTO users(id, username, password)
    VALUES($1, $2, $3)
    RETURNING *;
  `;
  const response = await client.query(SQL, [
    uuidv4(),
    username,
    await bcrypt.hash(password, 5),
  ]);
  return response.rows[0] as User;
};

export const createProduct = async ({ name }: Product): Promise<Product> => {
  const SQL = /*sql*/ `
    INSERT INTO products(id, name)
    VALUES($1, $2)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuidv4(), name]);
  return response.rows[0] as Product;
};

export const createFavorite = async ({
  product_id,
  user_id,
}: Favorite): Promise<Favorite> => {
  const SQL = /*sql*/ `
    INSERT INTO favorites(id, product_id, user_id)
    VALUES($1, $2, $3)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuidv4(), product_id, user_id]);
  return response.rows[0] as Favorite;
};

export const fetchUsers = async (): Promise<User[]> => {
  const SQL = /*sql*/ `
    SELECT id, username FROM users;
  `;
  const response = await client.query(SQL);
  return response.rows as User[];
};

export const fetchProducts = async (): Promise<Product[]> => {
  const SQL = /*sql*/ `
    SELECT * FROM products;
  `;
  const response = await client.query(SQL);
  return response.rows as Product[];
};

export const fetchFavorites = async (user_id: string): Promise<Favorite[]> => {
  const SQL = /*sql*/ `
    SELECT * 
    FROM favorites
    WHERE $1 = user_id;
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows as Favorite[];
};

export const deleteFavorite = async (favorite_id: string, user_id: string) => {
  // Just having some fun with syntax
  await client.query(
    /*sql*/ `
  DELETE FROM favorites
  WHERE id = $1 AND user_id = $2;
`,
    [favorite_id, user_id]
  );
};

export const authenticate = async ({ username, password }: User) => {
  const SQL = /*sql*/ `
        SELECT id, password FROM users WHERE username = $1;
    `;
  const response = await client.query(SQL, [username]);
  if (
    !response.rows.length ||
    (await bcrypt.compare(password, response.rows[0].password)) === false
  ) {
    const error: TError = {
      message: "Not Authorized",
      status: 401,
    } as TError;
    throw error;
  }
  const token = sign({ id: response.rows[0].id }, JWT);
  return { token };
};

export const findUserWithToken = async (token: string) => {
  let id = "";
  try {
    const payload: JwtPayload | string = verify(token, JWT);
    id = typeof payload === "string" ? "" : payload.id;
  } catch (error) {
    const err: TError = {
      message: "Not Authorized",
      status: 401,
    } as TError;
    throw err;
  }
  const SQL = /*sql*/ `
        SELECT id, username FROM users WHERE id = $1;
  `;
  const response = await client.query(SQL, [id]);
  if (!response.rows.length) {
    const error: TError = {
      message: "Not Authorized",
      status: 401,
    } as TError;
    throw error;
  }
  return response.rows[0];
};
