import React from 'react';
import { Section } from './index';
import { Star, ChevronRight, Plus, Minus, Phone, Mail, Clock, MapPin, MessageSquare, Users, ArrowRight, Quote, HelpCircle, Package } from 'lucide-react';

interface SectionPreviewProps {
    section: Section;
    scale?: number;
    className?: string;
}

// Helper to get image URL
const getImageUrl = (path: string | null | undefined, fallback: string = '/images/placeholder.jpg'): string => {
    if (!path) return fallback;
    if (path.startsWith('http')) return path;
    if (path.startsWith('/storage')) return path;
    if (path.startsWith('/images')) return path;
    return `/storage/${path}`;
};

// =============================================
// HERO PREVIEW
// =============================================
const HeroPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    
    return (
        <div 
            className="relative min-h-[400px] flex items-center overflow-hidden"
            style={{ backgroundColor: bgColor }}
        >
            {/* Background Image */}
            {content.background_image && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${getImageUrl(content.background_image)})` }}
                />
            )}
            
            <div className="relative z-10 max-w-4xl mx-auto px-8 py-16 text-center">
                {/* Pre-title */}
                {content.pre_title && (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-xs tracking-[0.2em] font-medium text-amber-700 mb-6">
                        {content.pre_title}
                    </span>
                )}
                
                {/* Title */}
                <h1 
                    className="text-4xl md:text-5xl font-serif font-light mb-6 leading-tight"
                    style={{ color: textColor }}
                >
                    {content.title || 'Hero Title'}
                </h1>
                
                {/* Subtitle */}
                {content.subtitle && (
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        {content.subtitle}
                    </p>
                )}
                
                {/* CTAs */}
                <div className="flex flex-wrap justify-center gap-4">
                    {content.cta_text && (
                        <button className="px-8 py-3 bg-[#c9a962] text-white text-sm tracking-wider rounded-full hover:bg-[#b89a55] transition-colors">
                            {content.cta_text}
                        </button>
                    )}
                    {content.secondary_cta_text && (
                        <button className="px-8 py-3 border border-gray-300 text-gray-700 text-sm tracking-wider rounded-full hover:bg-gray-100 transition-colors">
                            {content.secondary_cta_text}
                        </button>
                    )}
                </div>
                
                {/* Badge */}
                {content.badge_text && (
                    <div className="absolute top-8 right-8 bg-white shadow-lg rounded-lg px-4 py-2 text-sm font-medium text-gray-800">
                        {content.badge_text}
                    </div>
                )}
            </div>
            
            {/* Featured Products Preview */}
            {content.featured_products && content.featured_products.length > 0 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                    {content.featured_products.slice(0, 3).map((product: any, idx: number) => (
                        <div key={idx} className="w-20 h-20 bg-white rounded-lg shadow-md overflow-hidden">
                            <img 
                                src={getImageUrl(product.image)} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// =============================================
// SERVICES GRID PREVIEW
// =============================================
const ServicesGridPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    
    // Sample categories for preview
    const sampleCategories = [
        { name: 'Weight Loss', slug: 'weight-loss', image: '/images/1.png', color: '#c9a962' },
        { name: 'Longevity', slug: 'longevity', image: '/images/2.png', color: '#8b7355' },
        { name: 'Hormone Health', slug: 'hormone', image: '/images/3.png', color: '#6b8e7a' },
        { name: 'Skin Care', slug: 'skin', image: '/images/4.png', color: '#7a8b9c' },
    ];
    
    return (
        <div className="py-16" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 
                        className="text-3xl font-serif font-light"
                        style={{ color: textColor }}
                    >
                        {content.title || 'Our Services'}
                    </h2>
                    {content.cta_text && (
                        <button className="flex items-center gap-2 text-sm text-[#c9a962] hover:underline">
                            {content.cta_text}
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
                
                {/* Grid */}
                <div className="grid grid-cols-4 gap-4">
                    {sampleCategories.map((cat, idx) => (
                        <div 
                            key={idx}
                            className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
                        >
                            <div 
                                className="absolute inset-0"
                                style={{ backgroundColor: cat.color }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-white font-medium text-lg">{cat.name}</h3>
                                <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                                    <span>View Services</span>
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================
// TEAM SECTION PREVIEW
// =============================================
const TeamPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    
    return (
        <div className="py-16" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Images */}
                    <div className="relative h-[400px]">
                        <div className="absolute top-0 left-8 w-48 h-48 rounded-lg overflow-hidden shadow-xl bg-gray-200">
                            {content.images?.primary && (
                                <img 
                                    src={getImageUrl(content.images.primary)} 
                                    alt="Team" 
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-56 h-72 rounded-lg overflow-hidden shadow-2xl bg-gray-200">
                            {content.images?.secondary && (
                                <img 
                                    src={getImageUrl(content.images.secondary)} 
                                    alt="Team" 
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>
                    
                    {/* Content */}
                    <div>
                        {content.pre_title && (
                            <p className="text-xs tracking-[0.3em] font-medium text-gray-500 mb-4">
                                {content.pre_title}
                            </p>
                        )}
                        <h2 
                            className="text-4xl font-serif font-light mb-6"
                            style={{ color: textColor }}
                        >
                            {content.title || 'Our Team'}
                        </h2>
                        {content.description && (
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                {content.description}
                            </p>
                        )}
                        {content.cta_text && (
                            <button className="px-6 py-3 bg-gray-200 text-sm tracking-wider rounded-full text-gray-800 hover:bg-gray-300 transition-colors flex items-center gap-2">
                                {content.cta_text}
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================
// TESTIMONIALS PREVIEW
// =============================================
const TestimonialsPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#3d3d3d';
    
    // Sample testimonials
    const sampleTestimonials = [
        { name: 'Sarah M.', role: 'Weight Loss Client', quote: 'Amazing results! Lost 30 lbs in 3 months.', rating: 5 },
        { name: 'John D.', role: 'Longevity Program', quote: 'I feel 10 years younger. Highly recommend!', rating: 5 },
        { name: 'Emily R.', role: 'Hormone Therapy', quote: 'Life-changing experience with great support.', rating: 5 },
    ];
    
    return (
        <div 
            className="py-16"
            style={{ background: `linear-gradient(to bottom, ${bgColor}, #2d2d2d)` }}
        >
            <div className="max-w-5xl mx-auto px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    {content.pre_title && (
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-xs tracking-[0.2em] text-[#c9a962] mb-4">
                            <Quote className="w-3 h-3" />
                            {content.pre_title}
                        </span>
                    )}
                    <h2 className="text-3xl font-serif font-light text-white">
                        {content.title || 'What People Say'}
                    </h2>
                </div>
                
                {/* Testimonial Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {sampleTestimonials.map((testimonial, idx) => (
                        <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-6">
                            <div className="flex gap-1 mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-[#c9a962] text-[#c9a962]" />
                                ))}
                            </div>
                            <p className="text-white/90 mb-4 text-sm leading-relaxed">
                                "{testimonial.quote}"
                            </p>
                            <div>
                                <p className="text-white font-medium text-sm">{testimonial.name}</p>
                                <p className="text-white/60 text-xs">{testimonial.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================
// FAQ PREVIEW
// =============================================
const FAQPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    
    // Sample FAQs
    const sampleFaqs = [
        { question: 'How does telehealth work?', answer: 'Connect with licensed providers through secure video consultations.' },
        { question: 'What services do you offer?', answer: 'Weight loss, longevity, hormone optimization, and more.' },
        { question: 'How quickly can I start?', answer: 'Most patients schedule consultations within 24-48 hours.' },
    ];
    
    return (
        <div 
            className="py-16"
            style={{ background: `linear-gradient(to bottom, ${bgColor}, #ebe6db)` }}
        >
            <div className="max-w-5xl mx-auto px-8">
                <div className="grid md:grid-cols-5 gap-12">
                    {/* Left - Header */}
                    <div className="md:col-span-2">
                        {content.pre_title && (
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a962]/10 text-xs tracking-[0.2em] text-[#9a8b7a] mb-4">
                                <HelpCircle className="w-3 h-3" />
                                {content.pre_title}
                            </span>
                        )}
                        <h2 
                            className="text-3xl font-serif font-light mb-4"
                            style={{ color: textColor }}
                        >
                            {content.title || 'FAQ'}
                        </h2>
                        {content.description && (
                            <p className="text-gray-600 text-sm mb-8">
                                {content.description}
                            </p>
                        )}
                        
                        {/* CTA Card */}
                        {content.cta_title && (
                            <div className="bg-[#3d3d3d] rounded-xl p-6 text-white">
                                <MessageSquare className="w-8 h-8 text-[#c9a962] mb-4" />
                                <h3 className="font-medium mb-2">{content.cta_title}</h3>
                                {content.cta_description && (
                                    <p className="text-white/70 text-sm mb-4">{content.cta_description}</p>
                                )}
                                {content.cta_text && (
                                    <button className="px-4 py-2 bg-[#c9a962] text-white text-sm rounded-lg">
                                        {content.cta_text}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Right - FAQ List */}
                    <div className="md:col-span-3 space-y-4">
                        {sampleFaqs.map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="flex items-center justify-between p-4 cursor-pointer">
                                    <span className="font-medium text-gray-800">{faq.question}</span>
                                    <div className="w-8 h-8 rounded-full bg-[#c9a962] flex items-center justify-center">
                                        {idx === 0 ? (
                                            <Minus className="w-4 h-4 text-white" />
                                        ) : (
                                            <Plus className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                </div>
                                {idx === 0 && (
                                    <div className="px-4 pb-4 text-gray-600 text-sm">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================
// CONTACT PREVIEW
// =============================================
const ContactPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    
    return (
        <div className="py-16" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto px-8">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Left - Content */}
                    <div>
                        {content.pre_title && (
                            <p className="text-xs tracking-[0.3em] font-medium text-gray-500 mb-4">
                                {content.pre_title}
                            </p>
                        )}
                        <h2 
                            className="text-4xl font-serif font-light mb-6"
                            style={{ color: textColor }}
                        >
                            {content.title || 'Get in Touch'}
                        </h2>
                        {content.description && (
                            <p className="text-gray-600 mb-8">
                                {content.description}
                            </p>
                        )}
                        
                        {/* Contact Info Cards */}
                        <div className="space-y-4">
                            {content.phone && (
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                        <Phone className="w-5 h-5 text-[#c9a962]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{content.phone}</p>
                                        {content.phone_hours && (
                                            <p className="text-sm text-gray-500">{content.phone_hours}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {content.email && (
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                        <Mail className="w-5 h-5 text-[#c9a962]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{content.email}</p>
                                        {content.email_response && (
                                            <p className="text-sm text-gray-500">{content.email_response}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            {content.hours && (
                                <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-[#c9a962]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{content.hours}</p>
                                        {content.hours_description && (
                                            <p className="text-sm text-gray-500">{content.hours_description}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Right - Form Preview or Image */}
                    <div>
                        {content.show_form !== false ? (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h3 className="text-lg font-medium mb-4">Send us a message</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Name</label>
                                        <div className="h-10 bg-gray-100 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Email</label>
                                        <div className="h-10 bg-gray-100 rounded-lg" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Message</label>
                                        <div className="h-24 bg-gray-100 rounded-lg" />
                                    </div>
                                    <button className="w-full py-3 bg-[#c9a962] text-white rounded-lg text-sm font-medium">
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        ) : content.image ? (
                            <div className="rounded-xl overflow-hidden shadow-lg">
                                <img 
                                    src={getImageUrl(content.image)} 
                                    alt="Contact" 
                                    className="w-full h-auto"
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================
// CTA PREVIEW
// =============================================
const CTAPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#c9a962';
    
    return (
        <div 
            className="py-20"
            style={{ backgroundColor: bgColor }}
        >
            <div className="max-w-4xl mx-auto px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-light text-white mb-6">
                    {content.title || 'Ready to Get Started?'}
                </h2>
                {content.subtitle && (
                    <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                        {content.subtitle}
                    </p>
                )}
                {content.button_text && (
                    <button className="px-8 py-4 bg-white text-gray-800 text-sm tracking-wider rounded-full font-medium hover:bg-gray-100 transition-colors">
                        {content.button_text}
                    </button>
                )}
            </div>
        </div>
    );
};

// =============================================
// GENERIC / UNIVERSAL PREVIEW - Works for ALL section types
// =============================================
const GenericPreview: React.FC<{ section: Section }> = ({ section }) => {
    const content = section.content || {};
    const styles = section.styles || {};
    
    // Apply styles from CMS
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    const headingColor = styles.heading_color || textColor;
    
    // Get common content fields
    const preTitle = content.pre_title || content.preTitle;
    const title = content.title;
    const description = content.description || content.subtitle;
    const image = content.image || content.background_image;
    const items = content.items || content.values || content.steps || content.cards || content.points;
    const ctaText = content.cta_text || content.button_text || content.primaryCtaText;
    const ctaLink = content.cta_link || content.button_link || content.primaryCtaLink;
    
    // Format section type for display
    const sectionName = section.component_type
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
    
    return (
        <div 
            className="py-12 px-8 min-h-[200px]"
            style={{ backgroundColor: bgColor, color: textColor }}
        >
            <div className="max-w-4xl mx-auto">
                {/* Section Header */}
                <div className="mb-8">
                    {preTitle && (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c9a962]/10 text-xs tracking-[0.2em] text-[#9a8b7a] mb-4">
                            {preTitle}
                        </span>
                    )}
                    {title && (
                        <h2 
                            className="text-2xl md:text-3xl font-serif font-light mb-4"
                            style={{ color: headingColor }}
                        >
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-base opacity-70 max-w-2xl">
                            {description}
                        </p>
                    )}
                </div>
                
                {/* Image if present */}
                {image && (
                    <div className="mb-8 rounded-xl overflow-hidden">
                        <img 
                            src={getImageUrl(image)}
                            alt={title || 'Section image'}
                            className="w-full h-48 object-cover"
                        />
                    </div>
                )}
                
                {/* Items Grid (for values, stats, steps, etc.) */}
                {Array.isArray(items) && items.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                        {items.slice(0, 8).map((item: any, idx: number) => (
                            <div 
                                key={idx} 
                                className="bg-white/80 rounded-xl p-4 text-center shadow-sm"
                            >
                                {/* Item icon/step number */}
                                {(item.step || item.icon) && (
                                    <div className="w-10 h-10 rounded-full bg-[#c9a962]/10 flex items-center justify-center mx-auto mb-3">
                                        <span className="text-sm font-bold text-[#c9a962]">
                                            {item.step || '✓'}
                                        </span>
                                    </div>
                                )}
                                {/* Value (for stats) */}
                                {item.value && (
                                    <div className="text-2xl font-serif text-[#c9a962] mb-1">
                                        {item.value}
                                    </div>
                                )}
                                {/* Title */}
                                {(item.title || item.label || item.name) && (
                                    <h4 className="font-medium text-sm text-gray-800 mb-1">
                                        {item.title || item.label || item.name}
                                    </h4>
                                )}
                                {/* Description */}
                                {item.description && (
                                    <p className="text-xs text-gray-500">
                                        {typeof item.description === 'string' 
                                            ? item.description.slice(0, 50) 
                                            : Array.isArray(item.description) 
                                                ? item.description.join(' ').slice(0, 50)
                                                : ''}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                
                {/* CTA Button */}
                {ctaText && (
                    <div className="text-center">
                        <button className="px-6 py-3 bg-[#c9a962] text-white text-sm tracking-wider rounded-full font-medium">
                            {ctaText}
                        </button>
                    </div>
                )}
                
                {/* Section Type Badge */}
                <div className="mt-6 pt-4 border-t border-gray-200/50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#c9a962]/10 flex items-center justify-center">
                            <Package className="w-3 h-3 text-[#c9a962]" />
                        </div>
                        <span className="text-xs text-gray-500">{sectionName}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// =============================================
// ABOUT PAGE PREVIEWS
// =============================================
const AboutHeroPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    
    return (
        <div className="relative min-h-[350px] flex items-center" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto px-8 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        {content.pre_title && (
                            <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a962]/10 text-xs tracking-[0.2em] text-[#9a8b7a] mb-4">
                                {content.pre_title}
                            </span>
                        )}
                        <h1 className="text-4xl font-serif font-light mb-6" style={{ color: textColor }}>
                            {content.title || 'About Us'}
                        </h1>
                        {content.description && (
                            <p className="text-gray-600 leading-relaxed">
                                {content.description}
                            </p>
                        )}
                    </div>
                    {content.image && (
                        <div className="rounded-xl overflow-hidden shadow-lg">
                            <img src={getImageUrl(content.image)} alt="About" className="w-full h-auto" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MissionPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#ffffff';
    const textColor = styles.text_color || '#3d3d3d';
    
    return (
        <div className="py-16" style={{ backgroundColor: bgColor }}>
            <div className="max-w-4xl mx-auto px-8 text-center">
                {content.pre_title && (
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a962]/10 text-xs tracking-[0.2em] text-[#9a8b7a] mb-4">
                        {content.pre_title}
                    </span>
                )}
                <h2 className="text-3xl font-serif font-light mb-6" style={{ color: textColor }}>
                    {content.title || 'Our Mission'}
                </h2>
                {content.description && (
                    <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                        {content.description}
                    </p>
                )}
            </div>
        </div>
    );
};

const ValuesPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#f5f2eb';
    const textColor = styles.text_color || '#3d3d3d';
    
    const sampleValues = [
        { title: 'Excellence', description: 'Committed to the highest standards' },
        { title: 'Innovation', description: 'Embracing cutting-edge solutions' },
        { title: 'Compassion', description: 'Caring for every patient' },
    ];
    
    return (
        <div className="py-16" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto px-8">
                <div className="text-center mb-12">
                    {content.pre_title && (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a962]/10 text-xs tracking-[0.2em] text-[#9a8b7a] mb-4">
                            {content.pre_title}
                        </span>
                    )}
                    <h2 className="text-3xl font-serif font-light" style={{ color: textColor }}>
                        {content.title || 'Our Values'}
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {(content.values || sampleValues).slice(0, 3).map((value: any, idx: number) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm text-center">
                            <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 flex items-center justify-center mx-auto mb-4">
                                <Star className="w-6 h-6 text-[#c9a962]" />
                            </div>
                            <h3 className="font-medium text-gray-800 mb-2">{value.title}</h3>
                            <p className="text-sm text-gray-600">{value.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================
// STATS PREVIEW
// =============================================
const StatsPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#ffffff';
    const textColor = styles.text_color || '#3d3d3d';
    
    const sampleStats = [
        { icon: 'Users', value: '50+', label: 'Licensed Providers' },
        { icon: 'Heart', value: '15K+', label: 'Happy Patients' },
        { icon: 'Star', value: '4.9', label: 'Average Rating' },
        { icon: 'Shield', value: 'HIPAA', label: 'Compliant' },
    ];
    
    const stats = content.items || sampleStats;
    
    return (
        <div className="py-12" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {stats.slice(0, 4).map((stat: any, idx: number) => (
                        <div key={idx} className="text-center">
                            <div className="w-12 h-12 rounded-full bg-[#c9a962]/10 flex items-center justify-center mx-auto mb-3">
                                <Users className="w-5 h-5 text-[#c9a962]" />
                            </div>
                            <div className="text-3xl font-serif text-[#c9a962] mb-1">{stat.value}</div>
                            <div className="text-xs uppercase tracking-wider font-medium" style={{ color: textColor }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================
// PROCESS PREVIEW
// =============================================
const ProcessPreview: React.FC<{ content: Record<string, any>; styles: Record<string, any> }> = ({ content, styles }) => {
    const bgColor = styles.background_color || '#ffffff';
    const textColor = styles.text_color || '#3d3d3d';
    
    const sampleSteps = [
        { step: '01', title: 'Intake', description: ['A short intake process', 'to assess your needs'] },
        { step: '02', title: 'Review', description: ['Our medical team reviews', 'your intake form'] },
        { step: '03', title: 'Ship', description: ['We send your medication', 'to your doorstep'] },
    ];
    
    const steps = content.steps || sampleSteps;
    
    return (
        <div className="py-16" style={{ backgroundColor: bgColor }}>
            <div className="max-w-5xl mx-auto px-8">
                <div className="mb-10">
                    {content.pre_title && (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#c9a962]/10 text-xs tracking-[0.2em] text-[#9a8b7a] mb-4">
                            {content.pre_title}
                        </span>
                    )}
                    <h2 className="text-3xl font-serif font-light" style={{ color: textColor }}>
                        {content.title || 'What to Expect'}
                    </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {steps.slice(0, 3).map((step: any, idx: number) => (
                        <div key={idx} className="relative bg-gray-100 rounded-xl overflow-hidden h-48">
                            <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#c9a962] flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{step.step}</span>
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                <h3 className="text-white text-lg font-medium">{step.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================
// MAIN SECTION PREVIEW COMPONENT
// =============================================
export default function SectionPreview({ section, scale = 1, className = '' }: SectionPreviewProps) {
    const content = section.content || {};
    const styles = section.styles || {};
    
    // Map component types to preview components
    const previewComponents: Record<string, React.FC<{ content: Record<string, any>; styles: Record<string, any> }>> = {
        hero: HeroPreview,
        services_grid: ServicesGridPreview,
        team: TeamPreview,
        testimonials: TestimonialsPreview,
        faq: FAQPreview,
        contact: ContactPreview,
        cta: CTAPreview,
        // About page (both naming conventions)
        about_hero: AboutHeroPreview,
        hero_about: AboutHeroPreview,
        about_mission: MissionPreview,
        mission: MissionPreview,
        mission_section: MissionPreview,
        about_values: ValuesPreview,
        values: ValuesPreview,
        values_cards: ValuesPreview,
        about_team: TeamPreview,
        about_cta: CTAPreview,
        cta_about: CTAPreview,
        stats: StatsPreview,
        process: ProcessPreview,
        // Services page
        services_hero: HeroPreview,
        services_categories: ServicesGridPreview,
        services_cta: CTAPreview,
        // Contact page
        contact_hero: HeroPreview,
        contact_form: ContactPreview,
        contact_info_cards: ContactPreview,
        contact_cta: CTAPreview,
    };
    
    const PreviewComponent = previewComponents[section.component_type];
    
    return (
        <div 
            className={`overflow-hidden rounded-xl border border-gray-200 shadow-sm ${className}`}
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
            {PreviewComponent ? (
                <PreviewComponent content={content} styles={styles} />
            ) : (
                <GenericPreview section={section} />
            )}
        </div>
    );
}

// Export individual preview components for use in live editing
export {
    HeroPreview,
    ServicesGridPreview,
    TeamPreview,
    TestimonialsPreview,
    FAQPreview,
    ContactPreview,
    CTAPreview,
    AboutHeroPreview,
    MissionPreview,
    ValuesPreview,
    StatsPreview,
    ProcessPreview,
    GenericPreview,
};
