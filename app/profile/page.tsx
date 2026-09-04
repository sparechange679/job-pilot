'use client';

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@insforge/sdk";
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

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>({
    full_name: "Faizan Ali",
    email: "faizan@jsmastery.pro",
    phone: "+1 (555) 000-0000",
    location: "",
    linkedin_url: "https://linkedin.com/in/faizan",
    portfolio_url: "https://github.com/jsmastery",
    work_authorization: "Citizen",
    current_title: "Frontend Engineer",
    experience_level: "Junior",
    years_experience: "4",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    industries: [],
    work_experience: [
      {
        company: "Vercel",
        title: "Frontend Engineer",
        start_date: "2022-01",
        end_date: "",
        currently_working: true,
        responsibilities: "Built Next.js features and optimized web vitals. Led a team of 3 developers."
      }
    ],
    education: {
      degree: "High School",
      field: "Computer Science",
      institution: "",
      graduation_year: ""
    },
    job_titles_seeking: ["Frontend Engineer, React Developer"],
    remote_preference: "Any",
    salary_expectation: "",
    preferred_locations: []
  });

  const [newSkill, setNewSkill] = useState("");
  const [newIndustry, setNewIndustry] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");

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

  // Weighting logic for completion:
  // Personal 20%, Prof 30%, Work 30%, Edu 10%, Pref 10%
  const calculateCompletion = () => {
    let completion = 0;
    
    // Personal (20%) - 5 fields
    const personalFields = ['full_name', 'email', 'phone', 'location', 'linkedin_url'];
    personalFields.forEach(f => { if (profile[f]) completion += 4; });

    // Prof (30%) - 4 fields/items
    if (profile.current_title) completion += 7.5;
    if (profile.experience_level) completion += 7.5;
    if (profile.years_experience) completion += 7.5;
    if (profile.skills.length > 0) completion += 7.5;

    // Work (30%)
    if (profile.work_experience.length > 0) completion += 30;

    // Edu (10%)
    if (profile.education.degree) completion += 10;

    // Pref (10%)
    if (profile.job_titles_seeking.length > 0) completion += 10;

    return Math.min(Math.round(completion), 100);
  };

  const completionValue = calculateCompletion();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-12 px-6 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
        
        {/* Profile Completion Alert */}
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
            <div className="flex gap-2 mt-2">
              {['PHONE', 'LOCATION', 'EDUCATION'].map(tag => (
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

        {/* Resume Upload Card */}
        <Card className="flex flex-col gap-6">
          <SectionHeading>Resume</SectionHeading>
          <p className="text-[14px] text-text-secondary -mt-4">
            Upload an existing resume to auto-fill the profile, or generate a new tailored one from your details below.
          </p>
          
          <div className="border-2 border-dashed border-border-muted rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-surface-secondary/50">
            <div className="w-12 h-12 bg-accent-muted rounded-full flex items-center justify-center text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16V8M12 8L9 11M12 8L15 11M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5293 2.80338 14.3706 4.11077 15.7222" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-text-primary">Click to upload or drag and drop</p>
              <p className="text-[12px] text-text-muted mt-1">PDF formatting only. Maximum file size 5MB.</p>
            </div>
            <button className="px-4 py-2 border border-border bg-surface rounded-md text-[14px] font-medium text-text-primary hover:bg-surface-secondary transition-colors shadow-sm">
              Select Resume
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
              <button className="text-[12px] font-semibold text-accent flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 2.33334V11.6667M2.33333 7H11.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Add role
              </button>
            </div>
            
            {profile.work_experience.map((exp: any, index: number) => (
              <div key={index} className="flex flex-col gap-6 p-4 bg-surface-secondary/30 rounded-xl border border-border-light">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Company Name" placeholder="Vercel" value={exp.company} onChange={() => {}} />
                  <Input label="Job Title" placeholder="Frontend Engineer" value={exp.title} onChange={() => {}} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Start Date</label>
                    <div className="relative">
                      <input type="month" value={exp.start_date} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[14px] outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">End Date</label>
                      <label className="flex items-center gap-2 text-[12px] font-medium text-text-primary">
                        <input type="checkbox" checked={exp.currently_working} className="accent-accent" readOnly />
                        Currently working here
                      </label>
                    </div>
                    <input type="month" value={exp.end_date} placeholder="-------- ----" disabled={exp.currently_working} className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-[14px] outline-none disabled:bg-surface-secondary" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-text-secondary uppercase tracking-tight">Key Responsibilities</label>
                  <textarea 
                    value={exp.responsibilities}
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
            <button className="w-full bg-accent text-white py-3 rounded-lg font-semibold text-[16px] hover:opacity-90 transition-opacity">
              Save Profile
            </button>
          </div>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}
