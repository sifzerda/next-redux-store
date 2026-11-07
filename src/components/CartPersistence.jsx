// /src/components/CartPersistence.jsx

"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { hydrateCart } from "@/store/cartSlice";

export default function CartPersistence({ children }) {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("redux-cart") || "[]"
      );

      if (Array.isArray(saved)) {
        dispatch(hydrateCart(saved));
      }
    } catch {
      localStorage.removeItem("redux-cart");
    }

    setReady(true);
  }, [dispatch]);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(
        "redux-cart",
        JSON.stringify(items)
      );
    }
  }, [items, ready]);

  if (!ready) return null;

  return children;
}

