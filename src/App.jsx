import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AnimationProvider } from "./contexts/AnimationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { StorageProvider } from "./storage/StorageProvider";
import { router } from "./router";
import "./App.css";

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnimationProvider>
          <StorageProvider>
            <RouterProvider router={router} />
          </StorageProvider>
        </AnimationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
