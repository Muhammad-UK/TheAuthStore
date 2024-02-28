import { useEffect, useState } from "react";
import "./App.css";
import { Favorite, Product, User } from "../../server/src/types";

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("/api/users");
      const json = await response.json();
      setUsers(json as User[]);
    };
    fetchUsers();
    users.forEach(async (user) => {
      const response = await fetch(`/api/users/${user.id}/favorites`);
      const json = await response.json();
      setFavorites(json as Favorite[]);
    });
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const json = await response.json();
      setProducts(json as Product[]);
    };
    fetchProducts();
  }, []);
  console.log(users);
  console.log(favorites);

  return (
    <div className="px-16 py-8 text-2xl justify-center flex flex-wrap gap-4 w-full lg:px-32 lg:py-16 lg:text-4xl ">
      <div className="flex-1 space-y-2">
        <h1 className="border-violet-700 border-solid border-4 p-4">Users</h1>
        <ul className="border-violet-700 border-solid border-2 p-2 bg-darker-blue">
          {users.map((user) => {
            return (
              <>
                <li className="p-2 border-b-2 border-gray-200" key={user.id}>
                  {user.username}
                  <span>'s Favorites:</span>
                </li>
                <ul className="pl-4">
                  {favorites.map((favorite) => {
                    if (favorite.user_id === user.id) {
                      return (
                        <li className="text-cyan-700" key={favorite.id}>
                          {
                            products.find(
                              (product) => product.id === favorite.product_id
                            )?.name
                          }
                        </li>
                      );
                    }
                  })}
                </ul>
              </>
            );
          })}
        </ul>
        <form className="bg-slate-900 px-6 py-2 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-xl mb-2">
              Username:
              <input
                className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3"
                type="text"
                name="username"
              />
            </label>
            <div className="mb-6">
              <label className="block text-xl mb-2">
                Password:
                <input
                  className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3"
                  type="text"
                  name="password"
                />
              </label>
            </div>
            <div className="flex items-center justify-center">
              <button
                className="hover:bg-slate-600 text-2xl font-bold px-4 rounded"
                type="submit"
              >
                Add User
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="flex-1 space-y-2">
        <form className="bg-slate-900 px-6 py-2 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block text-xl mb-2">
              Product Name:
              <input
                className="bg-transparent shadow appearance-none border rounded w-full py-2 px-3"
                type="text"
                name="product name"
              />
            </label>
            <div className="flex items-center justify-center">
              <button
                className="hover:bg-slate-600 text-2xl font-bold px-4 rounded"
                type="submit"
              >
                Add Product
              </button>
            </div>
          </div>
        </form>
        <h1 className="border-pink-600 border-solid border-4 p-4">Products</h1>
        <ul className="border-pink-600 border-solid border-2 p-2">
          {products.map((product) => {
            return (
              <li className="p-2 border-b-2 border-gray-200" key={product.id}>
                {product.name}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
