import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component to dynamically update page metadata
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.type - OG type (default: website)
 * @param {string} props.image - OG image
 */
const SEO = ({ 
  title, 
  description, 
  type = 'website', 
  image = 'https://kashume.com/images/Kashume Logo.png' 
}) => {
  const location = useLocation();
  const siteName = 'Kashume';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Luxury Perfume & Artistic Scents`;
  const canonicalUrl = `https://kashume.com${location.pathname}`;

  useEffect(() => {
    // Update Title
    document.title = fullTitle;

    // Update Meta Description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'Discover Kashume, where luxury meet artistry in every bottle. Explore our curated collection of exquisite perfumes.');
    }

    // Update OG Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image);

    // Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

  }, [fullTitle, description, canonicalUrl, image]);

  return null;
};

export default SEO;
