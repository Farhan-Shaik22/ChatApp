"use client"
import { motion } from "motion/react";

export default function Loader() {
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden flex items-center justify-center">
      <div className="relative z-10">
        <svg width="200" height="200" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="30"
            stroke="#8B5CF6"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
            animate={{
              strokeDasharray: ["1, 200", "89, 200", "89, 200"],
              strokeDashoffset: [0, -35, -124],
              stroke: ["#8B5CF6", "#7C3AED", "#6D28D9"],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </svg>
        <motion.div
          className="text-violet-400 text-2xl font-bold mt-4 text-center"
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          Loading...
        </motion.div>
      </div>
    </div>
  )
}

