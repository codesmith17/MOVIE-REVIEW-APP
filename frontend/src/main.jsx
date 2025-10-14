import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import "./index.css";
import { store } from "./components/features/user/store.js";
import "flowbite";
// import "preline/preline" from "preline";
// import { SocketProvider } from "./components/socketContext/SocketProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      {/* <SocketProvider> */}
      <App />
      {/* </SocketProvider> */}
    </Provider>
  </React.StrictMode>,
);
