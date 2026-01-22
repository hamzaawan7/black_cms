import { Head, Link } from '@inertiajs/react';
import { ShieldX, ArrowLeft } from 'lucide-react';

interface ForbiddenProps {
    message?: string;
}

export default function Forbidden({ message = 'You do not have permission to access this resource.' }: ForbiddenProps) {
    return (
        <>
            <Head title="Access Denied" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
                <div className="text-center">
                    <div className="mx-auto h-20 w-20 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
                        <ShieldX className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">{message}</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </>
    );
}
