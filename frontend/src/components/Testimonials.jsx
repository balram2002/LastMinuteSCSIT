"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimationControls, useMotionValue } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, MessageSquarePlus } from "lucide-react";
import { API_URL } from "../utils/urls";

const Testimonials = () => {
    const navigate = useNavigate();
    const [testimonials, setTestimonials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMarqueeActive, setIsMarqueeActive] = useState(false);

    const containerRef = useRef(null);
    const contentRef = useRef(null);

    const duplicatedTestimonials = useMemo(() => isMarqueeActive ? [...testimonials, ...testimonials] : testimonials, [testimonials, isMarqueeActive]);

    const CARD_WIDTH = 400;
    const GAP = 32;
    const TOTAL_CARD_WIDTH = CARD_WIDTH + GAP;
    const MARQUEE_DURATION = 60;

    const controls = useAnimationControls();
    const x = useMotionValue(0);
    const hoverRef = useRef(false);

    const totalWidth = TOTAL_CARD_WIDTH * testimonials.length;

    const startMarquee = () => {
        if (!isMarqueeActive) return;
        controls.start({
            x: -totalWidth,
            transition: {
                duration: MARQUEE_DURATION,
                ease: 'linear',
                repeat: Infinity,
                repeatType: 'loop',
            }
        });
    };

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_URL}/api/testimonials/getalltestimonials`);
                const data = await response.json();
                if (data.success) {
                    setTestimonials(data.testimonials);
                }
            } catch (error) {
                console.error("Failed to fetch testimonials:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTestimonials();
    }, []);
    
    useEffect(() => {
        if (isLoading || testimonials.length === 0) return;

        const checkWidth = () => {
            if (containerRef.current && contentRef.current) {
                const contentWidth = contentRef.current.scrollWidth;
                const containerWidth = containerRef.current.offsetWidth;
                setIsMarqueeActive(contentWidth > containerWidth);
            }
        };
        
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);

    }, [isLoading, testimonials]);


    useEffect(() => {
        if (isMarqueeActive) {
            startMarquee();
        } else {
            controls.stop();
            x.set(0);
        }
    }, [isMarqueeActive]);

    const handleMouseEnter = () => {
        if (!isMarqueeActive) return;
        hoverRef.current = true;
        controls.stop();
    };

    const handleMouseLeave = () => {
        if (!isMarqueeActive) return;
        hoverRef.current = false;
        startMarquee();
    };

    const handleNavigation = (direction) => {
        if (!isMarqueeActive) return;
        controls.stop();
        const currentX = x.get();
        let targetX = direction === 'next' ? currentX - TOTAL_CARD_WIDTH : currentX + TOTAL_CARD_WIDTH;
        targetX = Math.min(0, targetX);

        controls.start({
            x: targetX,
            transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] }
        }).then(() => {
            const finalX = x.get();
            const wrappedX = finalX % totalWidth;
            if (finalX !== wrappedX) {
                x.set(wrappedX);
            }
            if (!hoverRef.current) {
                startMarquee();
            }
        });
    };

    return (
        <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true, amount: 0.3 }} className="flex flex-col md:flex-row justify-between md:items-center gap-6 mb-20">
                    <div>
                        <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 text-transparent bg-clip-text">What Our Users Say</span>
                        </h2>
                        <p className="text-gray-400 text-xl max-w-2xl leading-relaxed">Real feedback from students who use LastMinuteSCSIT to excel.</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => navigate('/about?action=postreview')} className="group relative px-6 py-3.5 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:text-white transition-colors duration-300 active:bg-white/15">
                            <span className="flex items-center gap-2 font-semibold"><MessageSquarePlus className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />Post a Review</span>
                        </motion.button>
                        {isMarqueeActive && (
                            <>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleNavigation('prev')} className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors duration-300 active:bg-white/15">
                                    <ChevronLeft className="w-7 h-7" />
                                </motion.button>
                                <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleNavigation('next')} className="w-14 h-14 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors duration-300 active:bg-white/15">
                                    <ChevronRight className="w-7 h-7" />
                                </motion.button>
                            </>
                        )}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} viewport={{ once: true }} className="relative">
                    <div className={`${isMarqueeActive ? 'absolute' : 'hidden'} inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none`} />
                    <div className={`${isMarqueeActive ? 'absolute' : 'hidden'} inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none`} />

                    {isLoading ? (
                        <div className="text-center text-gray-400 py-20">Loading testimonials...</div>
                    ) : testimonials.length === 0 ? (
                        <div className="text-center bg-slate-800/50 rounded-2xl p-12 border border-slate-700">
                             <h3 className="text-2xl font-bold text-white mb-4">No Testimonials Yet</h3>
                             <p className="text-gray-400">Be the first to share your experience by posting a review.</p>
                        </div>
                    ) : (
                        <div ref={containerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`flex gap-8 ${isMarqueeActive ? 'overflow-hidden cursor-grab active:cursor-grabbing' : 'justify-center flex-wrap'}`}>
                            <motion.div ref={contentRef} className="flex shrink-0 gap-8" animate={controls} style={{ x }}>
                                {duplicatedTestimonials.map((testimonial, index) => (
                                    <div key={`${testimonial._id}-${index}`} className="w-[400px] shrink-0 flex flex-col justify-between p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transition-colors duration-300 hover:border-green-400/80">
                                        <div>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white text-lg shrink-0">
                                                    {testimonial.username.split(' ').map(n => n[0]).slice(0, 2).join('')}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white text-lg">{testimonial.username}</h4>
                                                    <p className="text-gray-400 text-sm">{testimonial.userEmail}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-300 leading-relaxed">"{testimonial.text}"</p>
                                        </div>
                                        <div className="flex gap-1 mt-6 text-yellow-400">
                                            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Testimonials;