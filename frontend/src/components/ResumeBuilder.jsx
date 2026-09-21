import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Download, Sparkles, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import ResumePreview from './ResumePreview.jsx';
import { resumeBuilderApi } from '../services/api.js';

const DEFAULT_CATEGORIES = ["Languages", "Frontend", "Backend", "Databases", "Tools & Platforms", "Core CS", "Soft Skills"];

const emptyPersonal = { fullName: '', phone: '', email: '', linkedin: '', github: '', leetcode: '', portfolio: '' };
const emptyEdu = { institution: '', degree: '', field: '', startYear: '', endYear: '', cgpa: '' };
const emptySkill = { category: '', skills: '' };
const emptyProject = { name: '', technologies: '', description: '', github: '', url: '' };
const emptyExp = { organization: '', role: '', startDate: '', endDate: '', technologies: '', description: '' };
const emptyCert = { name: '', organization: '', date: '', url: '' };
const emptyAchieve = { description: '' };

const SectionHeader = ({ title }) => (
  <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 mt-8 first:mt-0 flex items-center gap-2">
    <LayoutTemplate className="w-5 h-5 text-orange-500"/> {title}
  </h3>
);

const Input = ({ label, required, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <input type="text" value={value} onChange={onChange} placeholder={placeholder}
           className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200" />
  </div>
);

const TextArea = ({ label, required, value, onChange, placeholder, rows=3 }) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-slate-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200" />
  </div>
);

const ResumeBuilder = ({ user }) => {
  // Try to load from localStorage
  const loadState = (key, defaultVal) => {
    try {
      const stored = localStorage.getItem(`resume_builder_${key}`);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const [personal, setPersonal] = useState(() => loadState('personal', emptyPersonal));
  const [summary, setSummary] = useState(() => loadState('summary', ''));
  const [education, setEducation] = useState(() => loadState('education', [{ ...emptyEdu }]));
  const [technicalSkills, setTechnicalSkills] = useState(() => loadState('skills', DEFAULT_CATEGORIES.map(c => ({ category: c, skills: '' }))));
  const [projects, setProjects] = useState(() => loadState('projects', [{ ...emptyProject }]));
  const [experience, setExperience] = useState(() => loadState('experience', []));
  const [certifications, setCertifications] = useState(() => loadState('certifications', []));
  const [achievements, setAchievements] = useState(() => loadState('achievements', []));

  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${personal.fullName || 'Resume'}_Resume`
  });

  // Save to localStorage when state changes
  useEffect(() => localStorage.setItem('resume_builder_personal', JSON.stringify(personal)), [personal]);
  useEffect(() => localStorage.setItem('resume_builder_summary', JSON.stringify(summary)), [summary]);
  useEffect(() => localStorage.setItem('resume_builder_education', JSON.stringify(education)), [education]);
  useEffect(() => localStorage.setItem('resume_builder_skills', JSON.stringify(technicalSkills)), [technicalSkills]);
  useEffect(() => localStorage.setItem('resume_builder_projects', JSON.stringify(projects)), [projects]);
  useEffect(() => localStorage.setItem('resume_builder_experience', JSON.stringify(experience)), [experience]);
  useEffect(() => localStorage.setItem('resume_builder_certifications', JSON.stringify(certifications)), [certifications]);
  useEffect(() => localStorage.setItem('resume_builder_achievements', JSON.stringify(achievements)), [achievements]);

  const validate = () => {
    if (!personal.fullName || !personal.phone || !personal.email) return "Full Name, Phone, and Email are mandatory.";
    if (!summary) return "Professional Summary is mandatory.";
    if (!education.length || !education[0].institution || !education[0].degree || !education[0].startYear || !education[0].endYear || !education[0].cgpa) {
      return "At least 1 complete Education entry is mandatory.";
    }
    const hasValidSkill = technicalSkills.some(s => s.category && s.skills);
    if (!hasValidSkill) return "At least 1 Technical Skills category must be filled.";
    if (!projects.length || !projects[0].name || !projects[0].technologies || !projects[0].description) {
      return "At least 1 complete Project (Name, Tech Stack, Description) is mandatory.";
    }
    return null;
  };

  const handleDownload = () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }
    handlePrint();
  };

  const generateSummary = async () => {
    setIsGeneratingSummary(true);
    setErrorMsg('');
    try {
      const payload = {
        fullName: personal.fullName,
        careerGoal: 'Software Engineer', // Default
        education: education.filter(e => e.institution),
        technicalSkills: technicalSkills.filter(s => s.skills),
        projects: projects.filter(p => p.name),
        experience: experience.filter(e => e.organization)
      };
      const res = await resumeBuilderApi.generateSummary(payload, user.token);
      setSummary(res.summary);
    } catch (err) {
      setErrorMsg("Failed to generate AI summary. Try again or add some basic details first.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const updateList = (setter, list, index, field, value) => {
    const updated = [...list];
    updated[index][field] = value;
    setter(updated);
  };
  const addToList = (setter, list, emptyObj) => setter([...list, { ...emptyObj }]);
  const removeFromList = (setter, list, index) => setter(list.filter((_, i) => i !== index));

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-slate-100">
      
      {/* Left: Form */}
      <div className="w-1/2 overflow-y-auto p-6 border-r border-slate-200 bg-white">
        
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resume Builder</h1>
            <p className="text-sm text-slate-500">Fill in your details below.</p>
          </div>
          <button onClick={handleDownload} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl font-bold shadow-sm transition-colors text-sm">
            <Download className="w-4 h-4"/> Download PDF
          </button>
        </div>

        <div className="space-y-8 pb-20">
          
          {/* 1. Personal */}
          <section>
            <SectionHeader title="1. Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" required value={personal.fullName} onChange={e => setPersonal({...personal, fullName: e.target.value})} />
              <Input label="Phone Number" required value={personal.phone} onChange={e => setPersonal({...personal, phone: e.target.value})} />
              <Input label="Email" required value={personal.email} onChange={e => setPersonal({...personal, email: e.target.value})} />
              <Input label="LinkedIn URL" value={personal.linkedin} onChange={e => setPersonal({...personal, linkedin: e.target.value})} />
              <Input label="GitHub URL" value={personal.github} onChange={e => setPersonal({...personal, github: e.target.value})} />
              <Input label="LeetCode URL" value={personal.leetcode} onChange={e => setPersonal({...personal, leetcode: e.target.value})} />
              <Input label="Portfolio URL" value={personal.portfolio} onChange={e => setPersonal({...personal, portfolio: e.target.value})} />
            </div>
          </section>

          {/* 2. Summary */}
          <section>
            <div className="flex justify-between items-center mt-8 mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <LayoutTemplate className="w-5 h-5 text-orange-500"/> 2. Professional Summary
              </h3>
              <button onClick={generateSummary} disabled={isGeneratingSummary} 
                      className="flex items-center gap-1.5 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                <Sparkles className="w-4 h-4"/>
                {isGeneratingSummary ? 'Generating...' : 'AI Summary'}
              </button>
            </div>
            <TextArea label="Summary" required value={summary} onChange={e=>setSummary(e.target.value)} rows={4}
                      placeholder="Full-stack developer with strong foundations in Data Structures and Algorithms..." />
          </section>

          {/* 3. Education */}
          <section>
            <SectionHeader title="3. Education (min 1 required)" />
            <div className="space-y-4">
              {education.map((edu, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Institution Name" required value={edu.institution} onChange={e=>updateList(setEducation, education, idx, 'institution', e.target.value)} />
                    <Input label="Degree / Qualification" required value={edu.degree} onChange={e=>updateList(setEducation, education, idx, 'degree', e.target.value)} />
                    <Input label="Field of Study (Optional)" value={edu.field} onChange={e=>updateList(setEducation, education, idx, 'field', e.target.value)} />
                    <Input label="Grade / CGPA" required value={edu.cgpa} onChange={e=>updateList(setEducation, education, idx, 'cgpa', e.target.value)} />
                    <Input label="Start Year" required value={edu.startYear} onChange={e=>updateList(setEducation, education, idx, 'startYear', e.target.value)} />
                    <Input label="End Year" required value={edu.endYear} onChange={e=>updateList(setEducation, education, idx, 'endYear', e.target.value)} />
                  </div>
                  {education.length > 1 && (
                    <button onClick={() => removeFromList(setEducation, education, idx)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => addToList(setEducation, education, emptyEdu)} className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
                <Plus className="w-4 h-4"/> Add Education
              </button>
            </div>
          </section>

          {/* 4. Technical Skills */}
          <section>
            <SectionHeader title="4. Technical Skills (min 1 required)" />
            <div className="space-y-4">
              {technicalSkills.map((skill, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-1/3">
                    <Input label="Category" value={skill.category} onChange={e=>updateList(setTechnicalSkills, technicalSkills, idx, 'category', e.target.value)} />
                  </div>
                  <div className="w-2/3 flex gap-2 items-start">
                    <div className="w-full">
                      <Input label="Skills" value={skill.skills} onChange={e=>updateList(setTechnicalSkills, technicalSkills, idx, 'skills', e.target.value)} placeholder="e.g. Java, Python, React" />
                    </div>
                    <button onClick={() => removeFromList(setTechnicalSkills, technicalSkills, idx)} className="mt-7 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ))}
              <button onClick={() => addToList(setTechnicalSkills, technicalSkills, emptySkill)} className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
                <Plus className="w-4 h-4"/> Add Category
              </button>
            </div>
          </section>

          {/* 5. Projects */}
          <section>
            <SectionHeader title="5. Projects (min 1 required)" />
            <div className="space-y-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Project Name" required value={proj.name} onChange={e=>updateList(setProjects, projects, idx, 'name', e.target.value)} />
                    <Input label="Technologies" required value={proj.technologies} onChange={e=>updateList(setProjects, projects, idx, 'technologies', e.target.value)} />
                    <Input label="GitHub URL" value={proj.github} onChange={e=>updateList(setProjects, projects, idx, 'github', e.target.value)} />
                    <Input label="Live URL" value={proj.url} onChange={e=>updateList(setProjects, projects, idx, 'url', e.target.value)} />
                  </div>
                  <TextArea label="Description (Bullet points)" required value={proj.description} onChange={e=>updateList(setProjects, projects, idx, 'description', e.target.value)} 
                            placeholder="- Built a scalable backend...&#10;- Improved performance by..." rows={4} />
                  {projects.length > 1 && (
                    <button onClick={() => removeFromList(setProjects, projects, idx)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => addToList(setProjects, projects, emptyProject)} className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
                <Plus className="w-4 h-4"/> Add Project
              </button>
            </div>
          </section>

          {/* 6. Experience */}
          <section>
            <SectionHeader title="6. Experience (Optional)" />
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Organization" value={exp.organization} onChange={e=>updateList(setExperience, experience, idx, 'organization', e.target.value)} />
                    <Input label="Role" value={exp.role} onChange={e=>updateList(setExperience, experience, idx, 'role', e.target.value)} />
                    <Input label="Start Date" value={exp.startDate} onChange={e=>updateList(setExperience, experience, idx, 'startDate', e.target.value)} />
                    <Input label="End Date" value={exp.endDate} onChange={e=>updateList(setExperience, experience, idx, 'endDate', e.target.value)} />
                    <div className="col-span-2">
                      <Input label="Technologies" value={exp.technologies} onChange={e=>updateList(setExperience, experience, idx, 'technologies', e.target.value)} />
                    </div>
                  </div>
                  <TextArea label="Description (Bullet points)" value={exp.description} onChange={e=>updateList(setExperience, experience, idx, 'description', e.target.value)} 
                            placeholder="- Developed features..." rows={3} />
                  <button onClick={() => removeFromList(setExperience, experience, idx)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
              <button onClick={() => addToList(setExperience, experience, emptyExp)} className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
                <Plus className="w-4 h-4"/> Add Experience
              </button>
            </div>
          </section>

          {/* 7. Certifications */}
          <section>
            <SectionHeader title="7. Certifications (Optional)" />
            <div className="space-y-4">
              {certifications.map((cert, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl relative">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Certification Name" value={cert.name} onChange={e=>updateList(setCertifications, certifications, idx, 'name', e.target.value)} />
                    <Input label="Issuing Organization" value={cert.organization} onChange={e=>updateList(setCertifications, certifications, idx, 'organization', e.target.value)} />
                    <Input label="Date" value={cert.date} onChange={e=>updateList(setCertifications, certifications, idx, 'date', e.target.value)} />
                    <Input label="Certificate URL" value={cert.url} onChange={e=>updateList(setCertifications, certifications, idx, 'url', e.target.value)} />
                  </div>
                  <button onClick={() => removeFromList(setCertifications, certifications, idx)} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
              <button onClick={() => addToList(setCertifications, certifications, emptyCert)} className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
                <Plus className="w-4 h-4"/> Add Certification
              </button>
            </div>
          </section>

          {/* 8. Achievements */}
          <section>
            <SectionHeader title="8. Key Achievements (Optional)" />
            <div className="space-y-4">
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <TextArea label="" value={ach.description} onChange={e=>updateList(setAchievements, achievements, idx, 'description', e.target.value)} placeholder="Achievement description..." rows={2} />
                  <button onClick={() => removeFromList(setAchievements, achievements, idx)} className="mt-1 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
              ))}
              <button onClick={() => addToList(setAchievements, achievements, emptyAchieve)} className="flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
                <Plus className="w-4 h-4"/> Add Achievement
              </button>
            </div>
          </section>
          
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="w-1/2 bg-slate-200 overflow-y-auto p-8 flex justify-center items-start">
        <ResumePreview 
          ref={componentRef}
          data={{ personal, summary, education, technicalSkills, projects, experience, certifications, achievements }} 
        />
      </div>

      {/* Toast Notification */}
      {errorMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
            !
          </div>
          <span className="text-sm font-medium tracking-wide">{errorMsg}</span>
        </div>
      )}

    </div>
  );
};

export default ResumeBuilder;
