import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("admin-root");
if (!rootElement) {
  throw new Error("Yönetim uygulaması için #admin-root öğesi bulunamadı.");
}

createRoot(rootElement).render(<App />);
