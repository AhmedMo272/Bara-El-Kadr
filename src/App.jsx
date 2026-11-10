import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useLenis from "./hooks/useLenis";
import SplashScreen from "./components/layout/SplashScreen";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Team from "./pages/Team";
import Partners from "./pages/Partners";
import Opportunities from "./pages/Opportunities";
import Login from "./pages/Login";
import Quest from "./pages/Quest";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const location = useLocation();
  useLenis();

  return (
    <>
      <AnimatePresence>
        {!splashDone && <SplashScreen onFinish={() => setSplashDone(true)} />}
      </AnimatePresence>

      {splashDone && (
        <>
          <Navbar />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/quest" element={<Quest />} />
                <Route path="/results/:attemptId" element={<Results />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/about" element={<About />} />
                <Route path="/team" element={<Team />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/opportunities" element={<Opportunities />} />
              </Routes>
            </motion.main>
          </AnimatePresence>
        </>
      )}
    </>
  );
}
