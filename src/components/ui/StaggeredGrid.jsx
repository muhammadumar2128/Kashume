import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from '../shop/ProductCard';

const StaggeredProductGrid = ({ products }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-20 px-6 md:px-24 py-24 max-w-7xl mx-auto">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={idx} />
      ))}
    </div>
  );
};

export default StaggeredProductGrid;
