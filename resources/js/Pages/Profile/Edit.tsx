import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';
import { 
    User, 
    Mail, 
    Lock, 
    Shield, 
    Camera, 
    Save, 
    AlertTriangle,
    CheckCircle,
    Eye,
    EyeOff,
    KeyRound,
    UserCircle,
    Settings
} from 'lucide-react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const user = usePage().props.auth.user;
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
    
    // Profile form
    const { 
        data: profileData, 
        setData: setProfileData, 
        patch: patchProfile, 
        errors: profileErrors, 
        processing: profileProcessing, 
        recentlySuccessful: profileSuccess 
    } = useForm({
        name: user.name,
        email: user.email,
    });

    // Password form
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const {
        data: passwordData,
        setData: setPasswordData,
        errors: passwordErrors,
        put: putPassword,
        reset: resetPassword,
        processing: passwordProcessing,
        recentlySuccessful: passwordSuccess,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitProfile: FormEventHandler = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'));
    };

    const submitPassword: FormEventHandler = (e) => {
        e.preventDefault();
        putPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
            onError: (errors) => {
                if (errors.password) {
                    resetPassword('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }
                if (errors.current_password) {
                    resetPassword('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AdminLayout>
            <Head title="Profile Settings" />

            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Manage your account information and security settings
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Profile Header with Avatar */}
                    <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-6 py-8">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#c9a962] to-[#d4b87a] flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {getInitials(user.name)}
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#c9a962] transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            {/* User Info */}
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <p className="text-gray-300 flex items-center gap-2 mt-1">
                                    <Mail className="w-4 h-4" />
                                    {user.email}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-[#c9a962]/20 text-[#c9a962] border border-[#c9a962]/30">
                                        <Shield className="w-3 h-3" />
                                        {user.role === 'super_admin' ? 'Super Admin' : user.role === 'tenant_admin' ? 'Admin' : 'User'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'profile'
                                        ? 'border-[#c9a962] text-[#c9a962]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <UserCircle className="w-4 h-4" />
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'security'
                                        ? 'border-[#c9a962] text-[#c9a962]'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <KeyRound className="w-4 h-4" />
                                Security
                            </button>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={submitProfile} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name Field */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="name"
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData('name', e.target.value)}
                                                className={`block w-full pl-10 pr-4 py-3 border ${
                                                    profileErrors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#c9a962] focus:border-[#c9a962]'
                                                } rounded-lg shadow-sm text-gray-900 placeholder-gray-400 transition-colors`}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        {profileErrors.name && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                {profileErrors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email Field */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData('email', e.target.value)}
                                                className={`block w-full pl-10 pr-4 py-3 border ${
                                                    profileErrors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#c9a962] focus:border-[#c9a962]'
                                                } rounded-lg shadow-sm text-gray-900 placeholder-gray-400 transition-colors`}
                                                placeholder="Enter your email"
                                                required
                                            />
                                        </div>
                                        {profileErrors.email && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                {profileErrors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Email Verification Notice */}
                                {mustVerifyEmail && user.email_verified_at === null && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-sm text-amber-800">
                                                    Your email address is not verified.
                                                </p>
                                                <Link
                                                    href={route('verification.send')}
                                                    method="post"
                                                    as="button"
                                                    className="mt-1 text-sm text-amber-700 underline hover:text-amber-900 font-medium"
                                                >
                                                    Click here to resend verification email
                                                </Link>
                                                {status === 'verification-link-sent' && (
                                                    <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                                                        <CheckCircle className="w-4 h-4" />
                                                        A new verification link has been sent to your email.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        {profileSuccess && (
                                            <p className="text-sm text-green-600 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Profile updated successfully!
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={profileProcessing}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a962] to-[#d4b87a] text-white font-medium rounded-lg shadow-sm hover:from-[#b8994d] hover:to-[#c9a962] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c9a962] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Save className="w-4 h-4" />
                                        {profileProcessing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <form onSubmit={submitPassword} className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-blue-800 font-medium">Password Requirements</p>
                                            <ul className="mt-1 text-sm text-blue-700 list-disc list-inside">
                                                <li>Minimum 8 characters long</li>
                                                <li>Include uppercase and lowercase letters</li>
                                                <li>Include at least one number</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {/* Current Password */}
                                    <div>
                                        <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Lock className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="current_password"
                                                ref={currentPasswordInput}
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                value={passwordData.current_password}
                                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                                className={`block w-full pl-10 pr-12 py-3 border ${
                                                    passwordErrors.current_password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#c9a962] focus:border-[#c9a962]'
                                                } rounded-lg shadow-sm text-gray-900 placeholder-gray-400 transition-colors`}
                                                placeholder="Enter your current password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordErrors.current_password && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                {passwordErrors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <KeyRound className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password"
                                                ref={passwordInput}
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordData.password}
                                                onChange={(e) => setPasswordData('password', e.target.value)}
                                                className={`block w-full pl-10 pr-12 py-3 border ${
                                                    passwordErrors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#c9a962] focus:border-[#c9a962]'
                                                } rounded-lg shadow-sm text-gray-900 placeholder-gray-400 transition-colors`}
                                                placeholder="Enter your new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordErrors.password && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                {passwordErrors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <KeyRound className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordData.password_confirmation}
                                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                                className="block w-full pl-10 pr-12 py-3 border border-gray-300 focus:ring-[#c9a962] focus:border-[#c9a962] rounded-lg shadow-sm text-gray-900 placeholder-gray-400 transition-colors"
                                                placeholder="Confirm your new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                        {passwordErrors.password_confirmation && (
                                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                                <AlertTriangle className="w-4 h-4" />
                                                {passwordErrors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div>
                                        {passwordSuccess && (
                                            <p className="text-sm text-green-600 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                Password updated successfully!
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={passwordProcessing}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9a962] to-[#d4b87a] text-white font-medium rounded-lg shadow-sm hover:from-[#b8994d] hover:to-[#c9a962] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c9a962] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Lock className="w-4 h-4" />
                                        {passwordProcessing ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Account Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500" />
                        Account Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Account Type</p>
                            <p className="text-lg font-medium text-gray-900 mt-1">
                                {user.role === 'super_admin' ? 'Super Administrator' : user.role === 'tenant_admin' ? 'Administrator' : 'User'}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Email Status</p>
                            <p className="text-lg font-medium text-gray-900 mt-1 flex items-center gap-2">
                                {user.email_verified_at ? (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        Verified
                                    </>
                                ) : (
                                    <>
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        Unverified
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-500">Member Since</p>
                            <p className="text-lg font-medium text-gray-900 mt-1">
                                {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
