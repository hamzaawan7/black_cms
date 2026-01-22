import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1e1e1e] to-[#2d2d2d] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5" />
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white tracking-tight">
                            HYVE<span className="text-[#c9a962]">CMS</span>
                        </h1>
                    </div>
                    <div className="text-center max-w-md">
                        <h2 className="text-2xl font-light text-white mb-4">
                            Content Management System
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Manage your website content, services, testimonials, and more 
                            with our intuitive admin dashboard.
                        </p>
                    </div>
                    <div className="absolute bottom-8 text-gray-500 text-xs">
                        © {new Date().getFullYear()} Hyve Wellness. All rights reserved.
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-1 flex-col items-center justify-center bg-[#f5f4f0] px-6 py-12">
                <div className="lg:hidden mb-8">
                    <h1 className="text-3xl font-bold text-[#2d2d2d] tracking-tight">
                        HYVE<span className="text-[#c9a962]">CMS</span>
                    </h1>
                </div>

                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
