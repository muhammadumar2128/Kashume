import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, User, Trash2 } from 'lucide-react';

const FAKE_REVIEWS_POOL = [
  { user_name: 'Ahmad Raza', rating: 5, comment: 'The fragrance is amazing and lasts all day. Highly recommended, totally worth the price!' },
  { user_name: 'Fatima J.', rating: 5, comment: 'Beautiful packaging and the scent is so luxurious. Bought it as a gift and they loved it.' },
  { user_name: 'Usman Tariq', rating: 4, comment: 'Mashallah very premium quality. The projection is really strong, definitely my new favorite.' },
  { user_name: 'Zainab A.', rating: 5, comment: 'I am usually very picky with perfumes, but this one completely won me over. Elegant and long-lasting.' },
  { user_name: 'Ali Hassan', rating: 5, comment: 'Fast delivery and the essence is exactly as described. Will be ordering more soon InshaAllah.' },
  { user_name: 'Sara K.', rating: 4, comment: 'A very unique blend. It changes beautifully throughout the day.' },
  { user_name: 'Bilal M.', rating: 5, comment: '10/10. The sillage is incredible. I got so many compliments wearing this.' },
  { user_name: 'Nida W.', rating: 5, comment: 'Absolutely mesmerizing. The bottle looks stunning on my vanity too.' },
  { user_name: 'Omar Farooq', rating: 4, comment: 'Good quality ingredients. You can tell it is purely artisanal and crafted with care.' },
  { user_name: 'Aisha S.', rating: 5, comment: 'My signature scent now! The dry down is powdery and sweet, exactly what I wanted.' },
  { user_name: 'Hassan K.', rating: 5, comment: 'Exceeded my expectations. The notes are perfectly balanced.' },
  { user_name: 'Maha Y.', rating: 4, comment: 'Smells incredibly expensive. Love the aesthetic of the bottle too.' },
  { user_name: 'Daniyal T.', rating: 5, comment: 'Performance is beast mode. 2 sprays are enough for the whole day.' },
  { user_name: 'Imran F.', rating: 5, comment: 'I blind bought this based on the notes, and it did not disappoint.' },
  { user_name: 'Hira N.', rating: 4, comment: 'Very captivating scent profile. Highly addictive.' }
];

const ReviewSection = ({ productId, userId, userName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  // Generate a consistent, pseudo-random subset of fake reviews for this specific product ID
  const productFakeReviews = useMemo(() => {
    if (!productId) return [];
    
    // Simple string hash
    const idStr = String(productId);
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const absHash = Math.abs(hash);
    
    // Simple PRNG based on the hash
    let seed = absHash === 0 ? 1 : absHash;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Pick 2 to 4 reviews
    const count = Math.floor(random() * 3) + 2; 
    
    // Shuffle a copy of the pool
    const pool = [...FAKE_REVIEWS_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    const selected = [];
    for(let i = 0; i < count; i++) {
      const daysAgo = Math.floor(random() * 20) + (i * 7) + 1; // Fake dates based on seed
      selected.push({
        id: `fake-${productId}-${i}`,
        user_name: pool[i].user_name,
        rating: pool[i].rating,
        comment: pool[i].comment,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo).toISOString()
      });
    }
    
    // Sort fake reviews to simulate chronological order (newest first)
    return selected.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userId) return alert('Please sign in to leave a review.');
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: productId,
          user_id: userId,
          user_name: userName || 'Valued Client',
          rating: newReview.rating,
          comment: newReview.comment
        }]);

      if (error) throw error;
      
      setNewReview({ rating: 5, comment: '' });
      fetchReviews();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Remove this review?')) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) throw error;
      fetchReviews();
    } catch (error) {
      alert(error.message);
    }
  };

  const displayReviews = [...reviews, ...productFakeReviews];

  return (
    <div className="mt-24 pt-24 border-t border-charcoal/10">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold mb-4 block font-black">Social Proof</span>
          <h2 className="text-3xl md:text-4xl font-serif italic text-charcoal">Customer Impressions</h2>
        </header>

        {/* Review Form */}
        {userId && (
          <div className="bg-white p-8 md:p-12 mb-16 shadow-xl shadow-charcoal/5 border border-ivory rounded-3xl">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-charcoal mb-8 border-b border-ivory pb-4">Share Your Olfactory Journey</h3>
            <form onSubmit={handleSubmitReview} className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-widest text-charcoal/40 font-bold">Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: num })}
                      className={`transition-colors ${num <= newReview.rating ? 'text-gold' : 'text-charcoal/10'}`}
                    >
                      <Star size={20} fill={num <= newReview.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Describe the notes, longevity, and your personal experience..."
                className="w-full bg-[#FAF9F6] border-b-2 border-charcoal/10 p-4 text-sm focus:border-gold outline-none h-32 resize-none font-medium text-charcoal"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-charcoal text-ivory px-10 py-4 text-[10px] uppercase tracking-[0.3em] font-black hover:bg-gold hover:text-charcoal transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {submitting ? 'Archiving...' : <><Send size={14} /> Submit Impression</>}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-12">
          {loading ? (
            <div className="text-center py-12 text-charcoal/20">
              <div className="w-6 h-6 border border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <span className="text-[10px] uppercase tracking-widest">Consulting Archives...</span>
            </div>
          ) : displayReviews.length === 0 ? (
            <div className="text-center py-12 text-charcoal/40">
              <MessageSquare size={32} className="mx-auto mb-4 opacity-10" />
              <p className="text-xs italic font-medium mb-4">Be the first to leave an impression of this essence.</p>
              {!userId && (
                <a href="/login" className="text-[10px] uppercase tracking-[0.2em] text-gold font-black border-b border-gold/30 pb-1 hover:text-charcoal hover:border-charcoal transition-all">
                  Sign in to leave a review
                </a>
              )}
            </div>
          ) : (
            displayReviews.map((review) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={review.id}
                className="border-b border-ivory pb-12 last:border-0"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-charcoal">{review.user_name}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={i < review.rating ? 'text-gold' : 'text-charcoal/10'}
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[8px] uppercase tracking-widest text-charcoal/30">
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-charcoal/70 leading-relaxed font-medium italic pl-14">
                  "{review.comment}"
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
