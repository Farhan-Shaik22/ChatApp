"use client";
import {useState} from "react";
import Link from "next/link";
import { motion } from "motion/react";
const AnimatedButton = ({text,link='#'}) => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <Link href={link} className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden">
        <motion.button
          className="px-8 py-3 bg-violet-600 text-white font-bold text-lg rounded-full shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          {text}
          <motion.div
            className="absolute inset-0 rounded-full bg-violet-400 opacity-30"
            initial={{ scale: 0 }}
            animate={{ scale: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
    </Link>
  );
};

export default AnimatedButton;