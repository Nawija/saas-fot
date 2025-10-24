import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export default function SuccessAnimation() {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                }}
                className="text-green-500"
            >
                <CheckCircle2 size={80} strokeWidth={1.5} />
            </motion.div>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 text-lg font-medium text-gray-700"
            >
                Zarejestrowano pomyślnie!
            </motion.p>
        </motion.div>
    );
}
