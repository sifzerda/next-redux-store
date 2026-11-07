// /src/app/cart/page.jsx

"use client";

import { useDispatch, useSelector } from "react-redux";
import CartView from "@/components/CartView";
import {
  removeItem,
  setQuantity,
} from "@/store/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);

  return (
    <CartView
      items={items}
      removeItem={(id) => dispatch(removeItem(id))}
      setQuantity={(id, quantity) =>
        dispatch(setQuantity({ id, quantity }))
      }
    />
  );
}
