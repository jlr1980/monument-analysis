import { useState, useEffect } from "react";
import PasswordGate from "./components/PasswordGate.jsx";
import Header from "./components/Header.jsx";
import StartHere from "./routes/StartHere.jsx";
import Memo from "./routes/Memo.jsx";
import Model from "./routes/Model.jsx";
import Simulator from "./routes/Simulator.jsx";
import Sources from "./routes/Sources.jsx";
import ChangeLog from "./routes/ChangeLog.jsx";
import { readHash, resolveRoute, ROUTES } from "./lib/router.js";

function useHashRoute() {
  const [path, setPath] = useState(() => readHash(window.location.hash));
  useEffect(() => {
    const onChange = () => setPath(readHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return path;
}

const VIEW_FOR_ROUTE = {
  [ROUTES.startHere]: <StartHere />,
  [ROUTES.memo]: <Memo />,
  [ROUTES.model]: <Model />,
  [ROUTES.simulator]: <Simulator />,
  [ROUTES.sources]: <Sources />,
  [ROUTES.changelog]: <ChangeLog />,
};

function AppRoutes() {
  const path = useHashRoute();
  const route = resolveRoute(path);
  const view = VIEW_FOR_ROUTE[route];
  return (
    <>
      <Header currentPath={path} route={route} />
      {view}
    </>
  );
}

export default function App() {
  return (
    <PasswordGate>
      <AppRoutes />
    </PasswordGate>
  );
}
