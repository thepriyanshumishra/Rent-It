'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ChevronLeft,
  FileText,
  Lock,
  RefreshCw,
  XCircle,
  ChevronRight,
  User,
  CreditCard,
  Phone,
  KeyRound,
  FileCheck2,
} from 'lucide-react';

export default function KycVerificationPage() {
  const router = useRouter();

  // Logged In User State & Auth Gate
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [redirectUrl, setRedirectUrl] = useState<string>('/my-rentals');
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);

  // Multi-step wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedMethod, setSelectedMethod] = useState<'digilocker' | 'manual'>('digilocker');

  // Manual Form State
  const [fullName, setFullName] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState<boolean>(false);

  // DigiLocker Modal & Workflow State
  const [isDigiLockerModalOpen, setIsDigiLockerModalOpen] = useState<boolean>(false);
  const [digiLockerStage, setDigiLockerStage] = useState<'MOBILE_INPUT' | 'OTP_INPUT' | 'DOCUMENT_PREVIEW'>('MOBILE_INPUT');
  const [digiLockerMobile, setDigiLockerMobile] = useState('');
  const [digiLockerOtp, setDigiLockerOtp] = useState('');
  const [isDigiLockerLoading, setIsDigiLockerLoading] = useState(false);
  const [digiLockerFetchedData, setDigiLockerFetchedData] = useState<{
    name: string;
    aadhaarMasked: string;
    dob: string;
    photo: string;
  } | null>(null);

  // Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'AUTO_APPROVED' | 'PENDING_ADMIN' | 'RETRY_NEEDED';
    matchScore: number;
    message: string;
  } | null>(null);

  // Auth Gate & Initializer
  useEffect(() => {
    const token = localStorage.getItem('rentit_token');
    const urlParams = new URLSearchParams(window.location.search);
    const targetRedirect = urlParams.get('redirect') || '/my-rentals';
    setRedirectUrl(targetRedirect);

    if (!token) {
      // Unauthenticated user -> Redirect to login with redirect parameter
      router.push(`/login?redirect=${encodeURIComponent(`/kyc?redirect=${targetRedirect}`)}`);
      return;
    }

    const storedUser = localStorage.getItem('rentit_user');
    let parsedUser = { name: 'Priyanshu Sharma', email: 'customer@rentit.com' };
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch {
        // fallback
      }
    }
    setCurrentUser(parsedUser);
    setFullName(parsedUser.name || 'Priyanshu Sharma');
    setAadhaarNumber('9876 5432 1098');
    setIsAuthChecked(true);
  }, [router]);

  // DigiLocker Handlers
  const handleOpenDigiLockerModal = () => {
    setIsDigiLockerModalOpen(true);
    setDigiLockerStage('MOBILE_INPUT');
    setDigiLockerMobile('9876543210');
    setDigiLockerOtp('');
  };

  const handleSendDigiLockerOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!digiLockerMobile) return;
    setIsDigiLockerLoading(true);
    setTimeout(() => {
      setIsDigiLockerLoading(false);
      setDigiLockerStage('OTP_INPUT');
      setDigiLockerOtp('123456');
    }, 1000);
  };

  const handleVerifyDigiLockerOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDigiLockerLoading(true);
    setTimeout(() => {
      setIsDigiLockerLoading(false);
      setDigiLockerFetchedData({
        name: currentUser?.name || 'Priyanshu Sharma',
        aadhaarMasked: 'XXXX XXXX 1098',
        dob: '15/08/1998',
        photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      });
      setDigiLockerStage('DOCUMENT_PREVIEW');
    }, 1200);
  };

  const handleAuthorizeDigiLockerData = () => {
    setIsDigiLockerModalOpen(false);
    setFullName(digiLockerFetchedData?.name || currentUser?.name || 'Priyanshu Sharma');
    setAadhaarNumber(digiLockerFetchedData?.aadhaarMasked || 'XXXX XXXX 1098');
    setAadhaarPreview(digiLockerFetchedData?.photo || null);
    setCurrentStep(4);
  };

  // Manual Flow Handlers
  const handleSelectMethod = (method: 'digilocker' | 'manual') => {
    setSelectedMethod(method);
    if (method === 'manual') {
      setCurrentStep(2);
    }
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !aadhaarNumber) return;
    setCurrentStep(3);
  };

  const handleAadhaarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAadhaarPreview(URL.createObjectURL(file));
    }
  };

  const handleStep3Next = () => {
    if (!aadhaarPreview) return;
    setCurrentStep(4);
  };

  const handleCaptureSelfie = () => {
    setSelfieCaptured(true);
  };

  const handleRunFacialMatching = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const score = 84;
      if (score >= 75) {
        localStorage.setItem('rentit_kyc_status', 'APPROVED');
        if (currentUser) {
          currentUser.kycStatus = 'APPROVED';
          localStorage.setItem('rentit_user', JSON.stringify(currentUser));
        }
        window.dispatchEvent(new Event('storage'));

        setVerificationResult({
          status: 'AUTO_APPROVED',
          matchScore: score,
          message: 'Identity verified successfully.',
        });
      } else if (score >= 50) {
        localStorage.setItem('rentit_kyc_status', 'PENDING');
        setVerificationResult({
          status: 'PENDING_ADMIN',
          matchScore: score,
          message: 'Identity document submitted for manual review.',
        });
      } else {
        setVerificationResult({
          status: 'RETRY_NEEDED',
          matchScore: score,
          message: 'Facial similarity threshold not met. Please retry or submit for admin review.',
        });
      }
      setCurrentStep(5);
    }, 2000);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Checking Authentication Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-10">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        
        {/* Navigation & Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={redirectUrl}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <ChevronLeft className="h-4 w-4" />
            Return to Previous Page
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            Verified Account: {currentUser?.name}
          </div>
        </div>

        {/* Enterprise Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Header Bar */}
          <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Identity & Compliance
              </span>
              <h1 className="text-xl font-bold mt-0.5">Account KYC Verification</h1>
            </div>
            
            {currentStep < 5 && (
              <div className="text-xs font-semibold text-slate-400">
                Step {currentStep} of 4
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8">

            {/* STEP 1: SELECT VERIFICATION METHOD */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Select Verification Method</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Welcome <strong className="text-slate-800">{currentUser?.name}</strong>. Choose how you would like to verify your identity.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Option 1: DigiLocker */}
                  <div
                    onClick={() => setSelectedMethod('digilocker')}
                    className={`p-5 rounded-xl border cursor-pointer transition-all ${
                      selectedMethod === 'digilocker'
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                          DL
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Verify via DigiLocker</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Automated government document retrieval via Aadhaar OTP
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>

                    {selectedMethod === 'digilocker' && (
                      <div className="mt-4 pt-4 border-t border-purple-100 flex justify-end">
                        <button
                          type="button"
                          onClick={handleOpenDigiLockerModal}
                          className="px-5 py-2.5 rounded-lg bg-blue-700 text-xs font-bold text-white hover:bg-blue-800 transition flex items-center gap-2 shadow-sm"
                        >
                          Launch DigiLocker Portal <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Option 2: Verify Manually */}
                  <div
                    onClick={() => handleSelectMethod('manual')}
                    className={`p-5 rounded-xl border cursor-pointer transition-all ${
                      selectedMethod === 'manual'
                        ? 'border-purple-600 bg-purple-50/50 ring-1 ring-purple-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Verify Manually</h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Enter Aadhaar details and upload document photo
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: MANUAL - ENTER NAME & AADHAAR NUMBER */}
            {currentStep === 2 && (
              <form onSubmit={handleStep2Next} className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Step 2 of 4
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Aadhaar Identity Details</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter your official full name and 12-digit Aadhaar number as issued by UIDAI.
                  </p>
                </div>

                <div className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Full Name (As on Aadhaar Card)</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Priyanshu Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Aadhaar Card Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={14}
                        placeholder="XXXX XXXX XXXX"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white outline-none focus:border-purple-600 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center gap-1.5 shadow-sm"
                  >
                    Continue to Document Upload <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: MANUAL - UPLOAD AADHAAR CARD PHOTO */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Step 3 of 4
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Upload Aadhaar Card Photo</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload a clear photo or scanned copy of your original Aadhaar Card.
                  </p>
                </div>

                <div className="space-y-4">
                  {aadhaarPreview ? (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Uploaded Aadhaar Document</span>
                        <button
                          type="button"
                          onClick={() => setAadhaarPreview(null)}
                          className="text-xs font-semibold text-purple-600 hover:underline"
                        >
                          Change File
                        </button>
                      </div>
                      <div className="aspect-16/9 rounded-lg overflow-hidden border border-slate-300 bg-white">
                        <img src={aadhaarPreview} alt="Aadhaar preview" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  ) : (
                    <label className="block p-8 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center hover:border-purple-500 hover:bg-purple-50/20 transition cursor-pointer">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-bold text-slate-800 block">Click to upload Aadhaar Card Photo</span>
                      <span className="text-[11px] text-slate-400 block mt-1">Supports JPG, PNG or PDF (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleAadhaarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStep3Next}
                    disabled={!aadhaarPreview}
                    className="px-6 py-2.5 rounded-lg bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Facial Matching <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FACIAL MATCHING SELFIE */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    Step 4 of 4
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-0.5">Facial Matching Check</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Capture a live selfie to verify against your verified Aadhaar Card photo.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Verified Account Identity:</span>
                    <span className="font-bold text-slate-900">{fullName} ({aadhaarNumber})</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                    ✓ Document Linked
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                  {selfieCaptured ? (
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-white border border-slate-200">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                        alt="Selfie"
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-900 block">Live Selfie Captured</span>
                        <span className="text-[11px] text-slate-500 block">Ready for facial similarity matching</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCaptureSelfie}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        Retake
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Camera className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                      <p className="text-xs font-semibold text-slate-700">Ensure your face is clearly visible in good lighting.</p>
                      <button
                        type="button"
                        onClick={handleCaptureSelfie}
                        className="mt-4 px-5 py-2.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 transition shadow-sm inline-flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4 text-purple-600" />
                        Capture Camera Selfie
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(selectedMethod === 'digilocker' ? 1 : 3)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRunFacialMatching}
                    disabled={!selfieCaptured || isProcessing}
                    className="px-6 py-2.5 rounded-lg bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Analyzing Facial Similarity...
                      </>
                    ) : (
                      <>
                        Submit Verification <CheckCircle2 className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: STATUS RESULT PAGE */}
            {currentStep === 5 && verificationResult && (
              <div className="space-y-6 text-center py-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600 mb-2">
                  {verificationResult.status === 'AUTO_APPROVED' ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-amber-600" />
                  )}
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {verificationResult.status === 'AUTO_APPROVED'
                      ? 'Verification Successful'
                      : 'Verification Submitted for Manual Review'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    {verificationResult.status === 'AUTO_APPROVED'
                      ? 'Your Aadhaar identity and live selfie have been verified. Redirecting back to your destination...'
                      : 'Your document and selfie have been submitted to our operations team for a quick manual review (usually within 5 minutes).'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Facial Match Confidence:</span>
                    <span className="font-bold text-slate-900">{verificationResult.matchScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-bold text-slate-900">
                      {verificationResult.status === 'AUTO_APPROVED' ? 'Approved' : 'Pending Operations Review'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => router.push(redirectUrl)}
                    className="px-6 py-2.5 rounded-lg bg-purple-600 text-xs font-bold text-white hover:bg-purple-700 transition flex items-center gap-1.5"
                  >
                    Continue to {redirectUrl.includes('checkout') ? 'Checkout' : 'Portal'} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DIGILOCKER OAUTH MODAL WITH DYNAMIC LOGGED IN USER NAME */}
      {isDigiLockerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden space-y-0">
            
            {/* Header */}
            <div className="bg-blue-800 text-white p-5 flex items-center justify-between border-b border-blue-900">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-white text-blue-900 font-black text-xs flex items-center justify-center">
                  DL
                </div>
                <div>
                  <h3 className="text-sm font-bold">DigiLocker Partner Portal</h3>
                  <p className="text-[10px] text-blue-200 font-medium">Government of India • Ministry of Electronics & IT</p>
                </div>
              </div>
              <button
                onClick={() => setIsDigiLockerModalOpen(false)}
                className="text-blue-200 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              
              {/* Stage 1 */}
              {digiLockerStage === 'MOBILE_INPUT' && (
                <form onSubmit={handleSendDigiLockerOtp} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Sign In to DigiLocker Account</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Account: <strong className="text-slate-800">{currentUser?.name}</strong> ({currentUser?.email})
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">Aadhaar Linked Mobile Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={digiLockerMobile}
                        onChange={(e) => setDigiLockerMobile(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 outline-none focus:border-blue-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isDigiLockerLoading}
                    className="w-full py-3 rounded-lg bg-blue-700 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
                  >
                    {isDigiLockerLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Generating OTP...
                      </>
                    ) : (
                      'Get 6-Digit DigiLocker OTP'
                    )}
                  </button>
                </form>
              )}

              {/* Stage 2 */}
              {digiLockerStage === 'OTP_INPUT' && (
                <form onSubmit={handleVerifyDigiLockerOtp} className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Enter Security OTP</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the 6-digit OTP sent to +91 {digiLockerMobile}.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700">6-Digit Security OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={digiLockerOtp}
                        onChange={(e) => setDigiLockerOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm font-mono tracking-widest text-slate-900 outline-none focus:border-blue-700"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isDigiLockerLoading}
                    className="w-full py-3 rounded-lg bg-blue-700 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
                  >
                    {isDigiLockerLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Authenticating OTP...
                      </>
                    ) : (
                      'Verify & Fetch Document'
                    )}
                  </button>
                </form>
              )}

              {/* Stage 3 */}
              {digiLockerStage === 'DOCUMENT_PREVIEW' && digiLockerFetchedData && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Government Issued Aadhaar Found</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified document for <strong className="text-slate-900">{digiLockerFetchedData.name}</strong> will be linked.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                    <img
                      src={digiLockerFetchedData.photo}
                      alt="Aadhaar photo"
                      className="h-16 w-16 rounded-lg object-cover border border-slate-300 shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-900 block">{digiLockerFetchedData.name}</span>
                      <span className="font-mono text-slate-600 block">{digiLockerFetchedData.aadhaarMasked}</span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                        ✓ UIDAI Issued Digital Document
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed font-medium">
                    I authorize RentIt Platform to access my Aadhaar document metadata for identity compliance.
                  </div>

                  <button
                    type="button"
                    onClick={handleAuthorizeDigiLockerData}
                    className="w-full py-3 rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                  >
                    <FileCheck2 className="h-4 w-4" />
                    Authorize & Proceed to Selfie Check
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
