"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import StudentNavbar from "@/components/StudentNavbar";
import LecturerNavbar from "@/components/LecturerNavbar";
import FileDropzone from "@/components/FileDropzone";

interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  photoUrl: string;
  role: string;
  status: string;
}

interface SecuritySession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [sessions, setSessions] = useState<SecuritySession[]>([
    { id: "1", device: "Chrome / Windows 11", location: "Colombo, Sri Lanka", ipAddress: "192.168.1.15", lastActive: "Just Now", isCurrent: true },
  ]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await api.get<UserProfile>("/api/v1/profile/me");
        setProfile(data);
        if (data) {
          const parts = data.fullName ? data.fullName.split(" ") : ["", ""];
          setFirstName(parts[0] || "");
          setLastName(parts.slice(1).join(" ") || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          if (data.photoUrl) {
            setAvatarPreview(data.photoUrl);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }
    loadProfile();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "unilearn";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "unilearn_preset";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.secure_url) {
          return data.secure_url;
        }
      }
    } catch (e) {
      console.warn("Cloudinary upload failed, falling back to data URL for local dev:", e);
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const secureUrl = await uploadToCloudinary(files[0]);
      const updatedProfile = await api.patch<UserProfile>("/api/v1/profile/me/photo", {
        photoUrl: secureUrl,
      });
      setProfile(updatedProfile);
      setAvatarPreview(updatedProfile.photoUrl || secureUrl);
      setShowAvatarModal(false);
      showToast("Profile picture updated successfully!");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTerminateSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast("Security session terminated.");
  };

  const isAdmin = user?.role === "staff_admin";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--on-background)] pb-12">
      {user?.role === "student" ? (
        <StudentNavbar />
      ) : user?.role === "lecturer" || user?.role === "hod_dean" ? (
        <LecturerNavbar />
      ) : null}

      <main className="max-w-[1000px] mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface-container-highest)] border border-[var(--tertiary)] text-[var(--on-surface)] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
            <i className="ti ti-check text-[var(--tertiary)] text-lg"></i>
            <span className="text-xs font-semibold">{toastMsg}</span>
          </div>
        )}

        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--on-surface)] mb-1">
            User Profile & Security Settings
          </h1>
          <p className="text-[var(--on-surface-variant)] text-xs sm:text-sm">
            Personal details, academic enrollment credentials, avatar uploader, and active security sessions.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="card p-6 text-center shadow-md bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] self-start space-y-4">
            <div className="relative w-24 h-24 mx-auto group">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-[var(--tertiary)]" />
              ) : (
                <div className="avatar w-24 h-24 text-3xl mx-auto font-extrabold shadow-sm flex items-center justify-center">
                  {firstName.charAt(0) || "U"}
                </div>
              )}
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--tertiary)] text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                title="Change Avatar"
              >
                <i className="ti ti-camera text-sm"></i>
              </button>
            </div>

            <div>
              <h2 className="font-display font-bold text-xl text-[var(--on-surface)]">{firstName} {lastName}</h2>
              <p className="text-xs text-[var(--on-surface-variant)] mt-0.5">Role: {profile?.role?.toUpperCase() || user?.role?.toUpperCase()}</p>
              <span className="badge badge-accent mt-2">UniLearn Member</span>
            </div>

            <div className="pt-4 border-t border-[var(--outline-variant)] space-y-2 text-left text-xs text-[var(--on-surface-variant)]">
              <p><b className="text-[var(--on-surface)]">Email:</b> {email}</p>
              <p><b className="text-[var(--on-surface)]">ID Code:</b> USER-{profile?.userId || user?.userId}</p>
              <p><b className="text-[var(--on-surface)]">Status:</b> {profile?.status?.toUpperCase() || "ACTIVE"}</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6 space-y-5 shadow-md bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
              <div className="flex items-center justify-between border-b border-[var(--outline-variant)] pb-3">
                <h3 className="font-display font-bold text-lg text-[var(--on-surface)]">
                  Personal Information
                </h3>
                {!isAdmin && (
                  <span className="text-[11px] text-[var(--on-surface-variant)] italic">
                    Read-only (Managed by Administrator)
                  </span>
                )}
              </div>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      disabled={!isAdmin}
                      readOnly={!isAdmin}
                      className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      disabled={!isAdmin}
                      readOnly={!isAdmin}
                      className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled={!isAdmin}
                      readOnly={!isAdmin}
                      className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--on-surface-variant)] mb-1">
                      Contact No.
                    </label>
                    <input
                      type="text"
                      value={phone}
                      disabled={!isAdmin}
                      readOnly={!isAdmin}
                      className="w-full text-xs p-2.5 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-low)] text-[var(--on-surface)] disabled:opacity-75 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex justify-end">
                    <button type="submit" className="btn-primary text-xs shadow-md">
                      <i className="ti ti-check mr-1"></i> Save Changes
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="card p-6 space-y-4 shadow-md bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)]">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--outline-variant)]">
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--on-surface)] flex items-center gap-2">
                    <i className="ti ti-device-laptop text-[var(--tertiary)]"></i> Active Security Sessions
                  </h3>
                  <p className="text-xs text-[var(--on-surface-variant)]">Manage active login sessions across mobile, desktop, and web devices.</p>
                </div>
                <span className="badge badge-accent text-[10px] font-bold">{sessions.length} Active Sessions</span>
              </div>

              <div className="space-y-3">
                {sessions.map((s) => (
                  <div key={s.id} className="p-3.5 border border-[var(--outline-variant)] rounded-xl bg-[var(--surface-container-low)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-xs text-[var(--on-surface)]">{s.device}</p>
                        {s.isCurrent && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Current Device</span>}
                      </div>
                      <p className="text-[11px] text-[var(--on-surface-variant)] mt-0.5">{s.location} · IP: {s.ipAddress} · Last Active: {s.lastActive}</p>
                    </div>

                    {!s.isCurrent && (
                      <button onClick={() => handleTerminateSession(s.id)} className="btn-secondary text-xs !py-1 text-red-500 self-start sm:self-auto">
                        <i className="ti ti-power"></i> Terminate
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card max-w-md w-full p-6 space-y-4 bg-[var(--surface-container-lowest)] border border-[var(--outline-variant)] shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--outline-variant)]">
              <h3 className="font-display font-bold text-base text-[var(--on-surface)]">Upload Profile Picture</h3>
              <button onClick={() => setShowAvatarModal(false)} className="text-[var(--on-surface-variant)]">
                <i className="ti ti-x text-lg"></i>
              </button>
            </div>

            <FileDropzone accept="image/*" maxSizeMB={5} multiple={false} onFilesSelected={handleAvatarSelected} />

            {isUploading && (
              <p className="text-xs text-[var(--tertiary)] font-semibold text-center animate-pulse">
                Uploading photo...
              </p>
            )}

            <div className="flex justify-end pt-2 border-t border-[var(--outline-variant)]">
              <button onClick={() => setShowAvatarModal(false)} disabled={isUploading} className="btn-secondary text-xs">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
