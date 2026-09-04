'use client';

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { insforge } from "@/lib/insforge-client";
import Image from "next/image";

// Components for the Profile Page
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-surface border border-border rounded-[16px] p-6 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] ${className}`}>
    {children}
  </div>
);

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-[16px] font-semibold text-text-primary leading-[24px] mb-4">
    {children}
  </h2>
);

const SubHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[14px] font-semibold text-text-primary leading-[20px] mb-4 uppercase tracking-tight">
    {children}
  </h3>
);

const Input = ({ label, placeholder, value, onChange, type = "text", name }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">
      {label}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      className="bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all"
    />
  </div>
);

const Select = ({ label, options, value, onChange, name }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary appearance-none focus:ring-1 focus:ring-accent focus:border-accent outline-none transition-all"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  </div>
);

type ToastState = { type: "success" | "error"; message: string } | null;

const Toast = ({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) => {
  if (!toast) return null;
  if (typeof document === "undefined") return null;

  const isSuccess = toast.type === "success";

  return createPortal(
    <div className="fixed top-20 right-6 z-[9999] animate-in fade-in slide-in-from-top-2">
      <div
        className={`flex items-start gap-3 min-w-[320px] max-w-[420px] rounded-[16px] border p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.1)] ${
          isSuccess
            ? "bg-success-lightest border-success-light"
            : "bg-error/10 border-error/20"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isSuccess ? "bg-success-light text-success-darker" : "bg-error/20 text-error"
          }`}
        >
          {isSuccess ? (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.66667 10L9.16667 12.5L13.75 7.5M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39763 5.39763 1.66667 10 1.66667C14.6024 1.66667 18.3333 5.39763 18.3333 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6.66663V9.99996M10 13.3333H10.0083M18.3333 9.99996C18.3333 14.6023 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6023 1.66667 9.99996C1.66667 5.39759 5.39763 1.66663 10 1.66663C14.6024 1.66663 18.3333 5.39759 18.3333 9.99996Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div className="flex-1 pt-0.5">
          <p className={`text-[14px] font-semibold ${isSuccess ? "text-success-darker" : "text-error"}`}>
            {isSuccess ? "Profile saved" : "Something went wrong"}
          </p>
          <p className="text-[13px] text-text-secondary mt-0.5">{toast.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-secondary transition-colors shrink-0"
          aria-label="Dismiss notification"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default function ProfileClient({ initialUser }: { initialUser: any }) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(initialUser || null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  const [profile, setProfile] = useState<any>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    portfolio_url: "",
    work_authorization: "Citizen",
    current_title: "",
    experience_level: "Junior",
    years_experience: "",
    skills: [],
    industries: [],
    work_experience: [],
    education: {
      degree: "High School",
      field: "",
      institution: "",
      graduation_year: ""
    },
    job_titles_seeking: [],
    remote_preference: "Any",
    salary_expectation: "",
    preferred_locations: [],
    resume_pdf_url: ""
  });

  useEffect(() => {
    const fetchProfile = async (currentUser: any) => {
      const { data, error } = await insforge
        .database
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (data) {
        setProfile((prev: any) => ({
          ...prev,
          ...data,
          skills: data.skills || [],
          industries: data.industries || [],
          work_experience: data.work_experience || [],
          job_titles_seeking: data.job_titles_seeking || [],
          preferred_locations: data.preferred_locations || [],
          education: data.education || prev.education,
        }));
      } else if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      } else {
        // Initialize with user email if no profile exists
        setProfile((prev: any) => ({ ...prev, email: currentUser.email }));
      }
      setLoading(false);
    };

    if (initialUser) {
      // Server already confirmed the session, avoid a redundant client-side check.
      fetchProfile(initialUser);
      return;
    }

    const fetchUserAndProfile = async () => {
      const { data: { user } } = await insforge.auth.getCurrentUser();
      if (!user) {
        window.location.href = '/login';
        return;
      }
      setUser(user);
      await fetchProfile(user);
    };

    fetchUserAndProfile();
  }, [initialUser]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      let resume_pdf_url = profile.resume_pdf_url;

      if (resumeFile) {
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        const { error: uploadError } = await insforge.storage
          .from('resumes')
          .upload(filePath, resumeFile, {
            upsert: true
          });

        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = insforge.storage
          .from('resumes')
          .getPublicUrl(filePath);
        
        resume_pdf_url = publicUrl;
      }

      const { error } = await insforge
        .database
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          resume_pdf_url,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      showToast("success", "Your changes have been saved successfully.");
      if (resumeFile) {
        setProfile((prev: any) => ({ ...prev, resume_pdf_url }));
        setResumeFile(null);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      showToast("error", error.message || "We couldn't save your profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        showToast("error", "Please upload a PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "File size exceeds 5MB limit.");
        return;
      }
      setResumeFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEducationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({
      ...prev,
      education: { ...prev.education, [name]: value }
    }));
  };

  const handleWorkExperienceChange = (index: number, field: string, value: any) => {
    const newExperience = [...profile.work_experience];
    newExperience[index] = { ...newExperience[index], [field]: value };
    setProfile((prev: any) => ({ ...prev, work_experience: newExperience }));
  };

  const addWorkExperience = () => {
    setProfile((prev: any) => ({
      ...prev,
      work_experience: [
        ...prev.work_experience,
        {
          company: "",
          title: "",
          start_date: "",
          end_date: "",
          currently_working: false,
          responsibilities: ""
        }
      ]
    }));
  };

  const removeWorkExperience = (index: number) => {
    const newExperience = profile.work_experience.filter((_: any, i: number) => i !== index);
    setProfile((prev: any) => ({ ...prev, work_experience: newExperience }));
  };

  const addSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile((prev: any) => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile((prev: any) => ({ ...prev, skills: prev.skills.filter((s: string) => s !== skill) }));
  };

  const addIndustry = () => {
    if (newIndustry && !profile.industries.includes(newIndustry)) {
      setProfile((prev: any) => ({ ...prev, industries: [...prev.industries, newIndustry] }));
      setNewIndustry("");
    }
  };

  const addJobTitle = () => {
    if (newJobTitle && !profile.job_titles_seeking.includes(newJobTitle)) {
      setProfile((prev: any) => ({ ...prev, job_titles_seeking: [...prev.job_titles_seeking, newJobTitle] }));
      setNewJobTitle("");
    }
  };

  const removeJobTitle = (title: string) => {
    setProfile((prev: any) => ({ ...prev, job_titles_seeking: prev.job_titles_seeking.filter((t: string) => t !== title) }));
  };

  const addLocation = () => {
    if (newLocation && !profile.preferred_locations.includes(newLocation)) {
      setProfile((prev: any) => ({ ...prev, preferred_locations: [...prev.preferred_locations, newLocation] }));
      setNewLocation("");
    }
  };

  const removeLocation = (loc: string) => {
    setProfile((prev: any) => ({ ...prev, preferred_locations: prev.preferred_locations.filter((l: string) => l !== loc) }));
  };

  // Weighting logic for completion. Each entry drives both the missing-fields
  // banner and the completion percentage, so the two always stay in sync
  // (0 missing fields always means 100% complete).
  const completionChecklist = [
    { label: 'FULL NAME', weight: 5, done: !!profile.full_name },
    { label: 'PHONE', weight: 5, done: !!profile.phone },
    { label: 'LOCATION', weight: 5, done: !!profile.location },
    { label: 'LINKEDIN', weight: 5, done: !!profile.linkedin_url },
    { label: 'JOB TITLE', weight: 10, done: !!profile.current_title },
    { label: 'EXPERIENCE', weight: 10, done: !!profile.years_experience },
    { label: 'SKILLS', weight: 10, done: (profile.skills || []).length > 0 },
    { label: 'WORK EXPERIENCE', weight: 30, done: (profile.work_experience || []).length > 0 },
    { label: 'EDUCATION', weight: 10, done: !!profile.education?.degree && !!profile.education?.field && !!profile.education?.institution },
    { label: 'JOB PREFERENCES', weight: 10, done: (profile.job_titles_seeking || []).length > 0 },
  ];

  const calculateCompletion = () => {
    const completion = completionChecklist.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return Math.min(Math.round(completion), 100);
  };

  const completionValue = calculateCompletion();

  // Builds the list of missing/incomplete fields shown in the attention banner.
  const getMissingFields = () => completionChecklist.filter(item => !item.done).map(item => item.label);

  const missingFields = getMissingFields();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-text-secondary font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <Navbar initialUser={user} />
      
      <main className="flex-grow pt-24 pb-12 px-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
        
        {/* Profile Completion Alert */}
        {completionValue < 100 && (
          <Card className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-error">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 6.66663V9.99996M10 13.3333H10.0083M18.3333 9.99996C18.3333 14.6023 14.6024 18.3333 10 18.3333C5.39763 18.3333 1.66667 14.6023 1.66667 9.99996C1.66667 5.39759 5.39763 1.66663 10 1.66663C14.6024 1.66663 18.3333 5.39759 18.3333 9.99996Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2 className="text-[18px] font-bold text-text-primary">Profile needs attention</h2>
              </div>
              <p className="text-[14px] text-text-secondary">
                Complete the missing fields to improve your chance of getting tailored matches and generating quality resumes.
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {missingFields.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-error/10 text-error text-[10px] font-bold rounded uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border-light" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={251.2} 
                  strokeDashoffset={251.2 * (1 - completionValue / 100)} 
                  className="text-error"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[20px] font-bold text-text-primary">{completionValue}%</span>
            </div>
          </Card>
        )}

        {/* Resume Upload Card */}
        <Card className="flex flex-col gap-6">
          <SectionHeading>Resume</SectionHeading>
          <p className="text-[14px] text-text-secondary -mt-4">
            Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
          </p>
          
          <div className="border-2 border-dashed border-border-muted rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-surface-secondary/50 relative">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 bg-accent-muted rounded-full flex items-center justify-center text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16V8M12 8L9 11M12 8L15 11M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5293 2.80338 14.3706 4.11077 15.7222" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-text-primary">
                {resumeFile ? resumeFile.name : (profile.resume_pdf_url ? "Resume uploaded" : "Click to upload or drag and drop")}
              </p>
              <p className="text-[12px] text-text-muted mt-1">
                {resumeFile ? `${(resumeFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF formatting only. Maximum file size 5MB."}
              </p>
            </div>
            <button className="px-4 py-2 border border-border bg-surface rounded-md text-[14px] font-medium text-text-primary hover:bg-surface-secondary transition-colors shadow-sm pointer-events-none">
              {profile.resume_pdf_url || resumeFile ? "Change Resume" : "Select Resume"}
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-[14px] text-text-secondary">Need a fresh document based on the fields below?</p>
            <button className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md text-[14px] font-medium hover:opacity-90 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.33333 2H4.66667C3.93029 2 3.33333 2.59695 3.33333 3.33333V12.6667C3.33333 13.403 3.93029 14 4.66667 14H11.3333C12.0697 14 12.6667 13.403 12.6667 12.6667V5.33333M9.33333 2L12.6667 5.33333M9.33333 2V5.33333H12.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Generate Resume from Profile
            </button>
          </div>
        </Card>

        {/* Profile Information Form */}
        <Card className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <SectionHeading>Profile Information</SectionHeading>
            <p className="text-[14px] text-text-secondary -mt-4">
              This context is used to accurately represent you in agent interactions.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <SubHeading>Personal Info</SubHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Full Name" name="full_name" placeholder="Faizan Ali" value={profile.full_name} onChange={handleChange} />
              <Input label="Email" name="email" placeholder="faizan@jsmastery.pro" value={profile.email} onChange={handleChange} />
              <Input label="Phone Number" name="phone" placeholder="+1 (555) 000-0000" value={profile.phone} onChange={handleChange} />
              <Input label="Location" name="location" placeholder="City, Country" value={profile.location} onChange={handleChange} />
              <Input label="LinkedIn URL" name="linkedin_url" placeholder="https://linkedin.com/in/faizan" value={profile.linkedin_url} onChange={handleChange} />
              <Input label="Portfolio / Github" name="portfolio_url" placeholder="https://github.com/jsmastery" value={profile.portfolio_url} onChange={handleChange} />
              <Select label="Work Authorization" name="work_authorization" value={profile.work_authorization} onChange={handleChange} options={[
                { label: "Citizen", value: "Citizen" },
                { label: "Green Card", value: "Green Card" },
                { label: "Visa", value: "Visa" }
              ]} />
            </div>
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-6">
            <SubHeading>Professional Info</SubHeading>
            <div className="flex flex-col gap-6">
              <Input label="Current/Recent Job Title" name="current_title" placeholder="Frontend Engineer" value={profile.current_title} onChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Experience Level" name="experience_level" value={profile.experience_level} onChange={handleChange} options={[
                  { label: "Junior", value: "Junior" },
                  { label: "Mid-level", value: "Mid-level" },
                  { label: "Senior", value: "Senior" },
                  { label: "Lead", value: "Lead" }
                ]} />
                <Input label="Years of Experience" name="years_experience" placeholder="4" value={profile.years_experience} onChange={handleChange} />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Skills</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-grow bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary outline-none focus:ring-1 focus:ring-accent"
                    onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button onClick={addSkill} className="px-4 py-2 border border-border rounded-md text-[14px] font-medium hover:bg-surface-secondary">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.skills.map((skill: string) => (
                    <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-secondary border border-border rounded-md text-[13px] text-text-primary">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="text-text-muted hover:text-error">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Industries Worked In (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="E.g. FinTech, Healthcare"
                    className="flex-grow bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary outline-none focus:ring-1 focus:ring-accent"
                    onKeyDown={(e) => e.key === 'Enter' && addIndustry()}
                  />
                  <button onClick={addIndustry} className="px-4 py-2 border border-border rounded-md text-[14px] font-medium hover:bg-surface-secondary">Add</button>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <SubHeading>Work Experience</SubHeading>
              <button 
                onClick={addWorkExperience}
                className="text-[12px] font-semibold text-accent flex items-center gap-1"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 2.33334V11.6667M2.33333 7H11.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add role
              </button>
            </div>
            
            {profile.work_experience.map((exp: any, index: number) => (
              <div key={index} className="flex flex-col gap-6 p-4 bg-surface-secondary/30 rounded-xl border border-border-light relative">
                <button 
                  onClick={() => removeWorkExperience(index)}
                  className="absolute top-4 right-4 text-text-muted hover:text-error"
                >
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Company Name" 
                    placeholder="Vercel" 
                    value={exp.company} 
                    onChange={(e: any) => handleWorkExperienceChange(index, 'company', e.target.value)} 
                  />
                  <Input 
                    label="Job Title" 
                    placeholder="Frontend Engineer" 
                    value={exp.title} 
                    onChange={(e: any) => handleWorkExperienceChange(index, 'title', e.target.value)} 
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Start Date</label>
                    <div className="relative">
                      <input 
                        type="month" 
                        value={exp.start_date} 
                        onChange={(e) => handleWorkExperienceChange(index, 'start_date', e.target.value)}
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[14px] outline-none focus:ring-1 focus:ring-accent" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">End Date</label>
                      <label className="flex items-center gap-2 text-[12px] font-medium text-text-primary cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={exp.currently_working} 
                          onChange={(e) => handleWorkExperienceChange(index, 'currently_working', e.target.checked)}
                          className="accent-accent" 
                        />
                        Currently working here
                      </label>
                    </div>
                    <input 
                      type="month" 
                      value={exp.end_date} 
                      onChange={(e) => handleWorkExperienceChange(index, 'end_date', e.target.value)}
                      placeholder="-------- ----" 
                      disabled={exp.currently_working} 
                      className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[14px] outline-none disabled:bg-surface-secondary focus:ring-1 focus:ring-accent" 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Key Responsibilities</label>
                  <textarea 
                    value={exp.responsibilities}
                    onChange={(e) => handleWorkExperienceChange(index, 'responsibilities', e.target.value)}
                    placeholder="Built Next.js features and optimized web vitals. Led a team of 3 developers."
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary min-h-[100px] outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            ))}
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <SubHeading>Education</SubHeading>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select label="Highest Degree" name="degree" value={profile.education.degree} onChange={handleEducationChange} options={[
                { label: "High School", value: "High School" },
                { label: "Bachelor's", value: "Bachelor's" },
                { label: "Master's", value: "Master's" },
                { label: "PhD", value: "PhD" }
              ]} />
              <Input label="Field of Study" name="field" placeholder="Computer Science" value={profile.education.field} onChange={handleEducationChange} />
              <Input label="Institution Name" name="institution" placeholder="E.g. State University" value={profile.education.institution} onChange={handleEducationChange} />
              <Input label="Graduation Year" name="graduation_year" placeholder="YYYY" value={profile.education.graduation_year} onChange={handleEducationChange} />
            </div>
          </div>

          <hr className="border-border" />

          <div className="flex flex-col gap-6">
            <SubHeading>Job Preferences</SubHeading>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Job Titles Seeking</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="E.g. Frontend Engineer, React Developer"
                    className="flex-grow bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary outline-none focus:ring-1 focus:ring-accent"
                    onKeyDown={(e) => e.key === 'Enter' && addJobTitle()}
                  />
                  <button onClick={addJobTitle} className="px-4 py-2 border border-border rounded-md text-[14px] font-medium hover:bg-surface-secondary">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.job_titles_seeking.map((title: string) => (
                    <span key={title} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-secondary border border-border rounded-md text-[13px] text-text-primary">
                      {title}
                      <button onClick={() => removeJobTitle(title)} className="text-text-muted hover:text-error">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select label="Remote Preference" name="remote_preference" value={profile.remote_preference} onChange={handleChange} options={[
                  { label: "Remote", value: "Remote" },
                  { label: "Hybrid", value: "Hybrid" },
                  { label: "On-site", value: "On-site" },
                  { label: "Any", value: "Any" }
                ]} />
                <Input label="Salary Expectation (Optional)" name="salary_expectation" placeholder="E.g. $120k+" value={profile.salary_expectation} onChange={handleChange} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Preferred Locations (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="E.g. New York, London"
                    className="flex-grow bg-surface border border-border rounded-lg px-3 py-2 text-[14px] text-text-primary outline-none focus:ring-1 focus:ring-accent"
                    onKeyDown={(e) => e.key === 'Enter' && addLocation()}
                  />
                  <button onClick={addLocation} className="px-4 py-2 border border-border rounded-md text-[14px] font-medium hover:bg-surface-secondary">Add</button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.preferred_locations.map((loc: string) => (
                    <span key={loc} className="inline-flex items-center gap-1 px-3 py-1 bg-surface-secondary border border-border rounded-md text-[13px] text-text-primary">
                      {loc}
                      <button onClick={() => removeLocation(loc)} className="text-text-muted hover:text-error">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-accent text-white py-3 rounded-lg font-semibold text-[16px] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : "Save Profile"}
            </button>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
