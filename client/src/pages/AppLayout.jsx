/* eslint-disable no-unused-vars */
import Header from "../components/default/Header.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function AppLayout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0A1633] text-white overflow-x-hidden">
      <Header />
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -40, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="pt-16 h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
