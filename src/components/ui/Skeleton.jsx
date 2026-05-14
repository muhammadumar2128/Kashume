import { motion } from 'framer-motion';

const Skeleton = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={`bg-charcoal/10 ${className}`}
    />
  );
};

export default Skeleton;
