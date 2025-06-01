import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StorageProvider } from "./storage/StorageProvider";
import { router } from "./router";
import "./App.css";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StorageProvider>
          <RouterProvider router={router} />
        </StorageProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
