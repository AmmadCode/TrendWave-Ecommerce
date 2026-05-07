import { RouterProvider } from "react-router-dom";
import { useBootstrapAuth } from "./features/auth/useBootstrapAuth";
import { router } from "./router";

function App() {
  useBootstrapAuth();
  return <RouterProvider router={router} />;
}

export default App;
