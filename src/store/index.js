// src/store/index.js

import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
    },
  });
