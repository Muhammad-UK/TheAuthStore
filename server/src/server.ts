import express from "express";
import {
  authenticate,
  client,
  createFavorite,
  createProduct,
  createTables,
  createUser,
  deleteFavorite,
  fetchFavorites,
  fetchProducts,
  fetchUsers,
  findUserWithToken,
} from "./db";
import { Favorite, Product, TError, User } from "./types";
import path from "path";

const app = express();
app.use(express.json());

// Production Route:
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"))
);

// Helper Function:
const isLoggedIn = async (req: any, res: any, next: any) => {
  try {
    req.user = await findUserWithToken(req.headers.authorization!);
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// GET Routes:
app.get("/api/users", async (req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch (error) {
    next(error);
  }
});
app.get("/api/products", async (req, res, next) => {
  try {
    res.send(await fetchProducts());
  } catch (error) {
    console.error(error);
    next(error);
  }
});
app.get(
  "/api/users/:user_id/favorites",
  isLoggedIn,
  async (req: any, res, next) => {
    try {
      if (req.params.user_id !== req.user.id) {
        const error: TError = {
          message: "Not Authorized",
          status: 401,
        } as TError;
        throw error;
      }
      res.send(await fetchFavorites(req.params.user_id));
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
app.get("/api/auth/me", isLoggedIn, async (req: any, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

//POST Routes:
app.post("/api/users", async (req, res, next) => {
  try {
    const newUser: User = {
      username: req.body.username,
      password: req.body.password,
    };
    await createUser(newUser);
    res.status(201).send(await authenticate(newUser));
  } catch (error) {
    console.error(error);
    next(error);
  }
});
app.post("/api/products", async (req, res, next) => {
  try {
    const newProduct: Product = {
      name: req.body.name,
    };
    res.status(201).send(await createProduct(newProduct));
  } catch (error) {
    console.error(error);
    next(error);
  }
});
app.post(
  "/api/users/:user_id/favorites",
  isLoggedIn,
  async (req: any, res, next) => {
    try {
      if (req.params.user_id !== req.user.id) {
        const error: TError = {
          message: "Not Authorized",
          status: 401,
        } as TError;
        throw error;
      }
      const newFavorite: Favorite = {
        user_id: req.params.user_id,
        product_id: req.body.product_id,
      };
      res.status(201).send(await createFavorite(newFavorite));
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);
app.post("/api/auth/login", async (req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// DELETE Route:
app.delete(
  "/api/users/:user_id/favorites/:favorite_id",
  isLoggedIn,
  async (req: any, res, next) => {
    try {
      if (req.params.user_id !== req.user.id) {
        const error: TError = {
          message: "Not Authorized",
          status: 401,
        } as TError;
        throw error;
      }
      await deleteFavorite(req.params.favorite_id, req.params.user_id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }
);

// Server Initialization:
const init = async () => {
  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected successfully");

  await createTables();
  console.log("Created tables");

  const [Liam, Nora, Evan, Maya]: User[] = await Promise.all([
    createUser({ username: "Liam", password: "Liam123" }),
    createUser({ username: "Nora", password: "Nora5678" }),
    createUser({ username: "Evan", password: "Evan999" }),
    createUser({ username: "Maya", password: "Maya2024" }),
  ]);
  const [Milk, Eggs, Rice, Pasta, Beef, Beans, Chips, Bread]: Product[] =
    await Promise.all([
      createProduct({ name: "Milk" }),
      createProduct({ name: "Eggs" }),
      createProduct({ name: "Rice" }),
      createProduct({ name: "Pasta" }),
      createProduct({ name: "Beef" }),
      createProduct({ name: "Beans" }),
      createProduct({ name: "Chips" }),
      createProduct({ name: "Bread" }),
    ]);

  console.log("Created users and products");
  console.log(await fetchUsers());
  console.log(await fetchProducts());

  await Promise.all([
    createFavorite({ product_id: Milk.id!, user_id: Liam.id! }),
    createFavorite({ product_id: Bread.id!, user_id: Maya.id! }),
    createFavorite({ product_id: Beef.id!, user_id: Evan.id! }),
    createFavorite({ product_id: Rice.id!, user_id: Nora.id! }),
    createFavorite({ product_id: Beans.id!, user_id: Nora.id! }),
  ]);
  console.log("Created some favorites");
  console.log("Liam's favorites: ");
  console.log(await fetchFavorites(Liam.id!));
  console.log("Nora's favorites: ");
  console.log(await fetchFavorites(Nora.id!));

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Listening on port ${port}`));
};

// Error Handling:
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.message);
  res
    .status(err.status || 500)
    .send({ message: err.message } || "Server Error");
});

init();
