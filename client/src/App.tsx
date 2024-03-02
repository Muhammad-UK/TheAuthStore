import { useEffect, useState } from "react";
import {
  Favorite,
  Product,
  User,
  loginFn,
  registerFn,
} from "../../server/src/types";
import "./App.css";
import { AuthForm } from "./AuthForm";

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [auth, setAuth] = useState<User>();

  const attemptLoginWithToken = async () => {
    const token = window.localStorage.getItem("token");
    if (token) {
      const response = await fetch("/api/auth/me", {
        headers: {
          authorization: token,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setAuth(json as User);
      } else {
        window.localStorage.removeItem("token");
      }
    }
  };
  useEffect(() => {
    attemptLoginWithToken();
  }, []);

  // FETCH useEffects
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const json = await response.json();
      setProducts(json as Product[]);
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    const fetchFavorites = async () => {
      const response = await fetch(`/api/users/${auth?.id}/favorites`, {
        headers: {
          authorization: window.localStorage.getItem("token")!,
        },
      });
      const json = await response.json();
      if (response.ok) {
        setFavorites(json as Favorite[]);
      }
    };
    if (auth && auth.id) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [auth]);

  const login: loginFn = async (userCredentials?: User) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    });
    const json = await response.json();
    if (response.ok) {
      window.localStorage.setItem("token", json.token);
      attemptLoginWithToken();
    } else {
      console.log(json);
    }
  };
  const register: registerFn = async (userCredentials?: User) => {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userCredentials),
    });
    const json = await response.json();
    if (response.ok) {
      window.localStorage.setItem("token", json.token);
      attemptLoginWithToken();
    } else {
      console.log(json);
    }
  };
  const logout = async () => {
    window.localStorage.removeItem("token");
    setAuth(undefined);
  };
  const addFavorite = async ({ id }: Product) => {
    const response = await fetch(`/api/users/${auth?.id}/favorites`, {
      method: "POST",
      body: JSON.stringify({ product_id: id }),
      headers: {
        "Content-Type": "application/json",
        authorization: window.localStorage.getItem("token")!,
      },
    });
    const json = await response.json();
    if (response.ok) {
      setFavorites([...favorites, json]);
    } else {
      console.log(json);
    }
  };
  const removeFavorite = async ({ id }: Favorite) => {
    await fetch(`/api/users/${auth?.id}/favorites/${id}`, {
      method: "DELETE",
      headers: {
        authorization: window.localStorage.getItem("token")!,
      },
    });
    setFavorites(favorites.filter((favorite) => favorite.id !== id));
  };
  return (
    <div className="px-16 py-8 text-2xl justify-center flex flex-wrap gap-4 w-full lg:px-32 lg:py-16 lg:text-4xl">
      {!auth?.id ? (
        <AuthForm login={login} register={register} />
      ) : (
        <div className="bg-slate-900 px-6 py-2 rounded-lg shadow-lg">
          <button
            className="hover:bg-slate-800 h-16 rounded p-2 py-60"
            onClick={logout}
          >
            Welcome, {auth?.username}
            <br />
            Logout
          </button>
        </div>
      )}
      <div className="flex-1 space-y-2 max-w-xl">
        <h1 className="border-violet-700 border-solid border-4 p-4">
          Products
        </h1>
        <ul className="border-violet-700 border-solid border-2 p-2 bg-darker-blue">
          {products.map((product) => {
            const isFavorite = favorites.find(
              (favorite) => favorite.product_id === product.id
            );
            return (
              <li
                key={product.id}
                className={
                  isFavorite
                    ? "border-cyan-500 border-2 m-1 p-1 max-w-64"
                    : "border-rose-500 border-2 m-1 p-1 max-w-64"
                }
              >
                {product.name}
                {auth?.id && isFavorite && (
                  <button
                    className="hover:bg-slate-700 px-1 rounded"
                    onClick={() => removeFavorite(isFavorite)}
                  >
                    -
                  </button>
                )}
                {auth?.id && !isFavorite && (
                  <button
                    className="hover:bg-slate-700 px-1 rounded"
                    onClick={() => addFavorite(product)}
                  >
                    +
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
