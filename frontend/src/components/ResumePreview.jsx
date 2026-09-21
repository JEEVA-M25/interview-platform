import React, { forwardRef } from 'react';

const ResumePreview = forwardRef(({ data }, ref) => {
  const { personal, summary, education, technicalSkills, projects, experience, certifications, achievements } = data;

  return (
    <>
      <style type="text/css" media="print">
        {`
          @page { size: A4; margin: 15mm; }
          .section-block { page-break-inside: avoid; }
        `}
      </style>
      <div className="bg-white text-black w-[210mm] min-h-[297mm] p-[12mm] shadow-lg mx-auto print:shadow-none print:p-0 print:w-full font-latex" ref={ref}>
      {/* 1. Header (Personal Info) */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-black mb-2 uppercase tracking-wide">
          {personal.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-black">
          {personal.phone && (
            <span className="flex items-center gap-1.5"><i className="fa-solid fa-phone" style={{ fontSize: 12 }}></i> {personal.phone}</span>
          )}
          {personal.email && (
            <span className="flex items-center gap-1.5"><i className="fa-solid fa-envelope" style={{ fontSize: 12 }}></i> {personal.email}</span>
          )}
          {personal.linkedin && (
            <span className="flex items-center gap-1.5"><i className="fa-brands fa-linkedin" style={{ fontSize: 12 }}></i> {personal.linkedin}</span>
          )}
          {personal.github && (
            <span className="flex items-center gap-1.5"><i className="fa-brands fa-github" style={{ fontSize: 12 }}></i> {personal.github}</span>
          )}
          {personal.leetcode && (
            <span className="flex items-center gap-1.5"><i className="fa-solid fa-code" style={{ fontSize: 12 }}></i> {personal.leetcode}</span>
          )}
          {personal.portfolio && (
            <span className="flex items-center gap-1.5"><i className="fa-solid fa-globe" style={{ fontSize: 12 }}></i> {personal.portfolio}</span>
          )}
        </div>
      </div>

      {/* 2. Professional Summary */}
      {summary && (
        <div className="mb-5 section-block">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 tracking-wider text-black">
            Professional Summary
          </h2>
          <p className="text-[13px] leading-relaxed text-black whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      )}

      {/* 3. Education */}
      {education && education.length > 0 && (
        <div className="mb-5 section-block">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 tracking-wider text-black">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-[13px]">
                  <span>{edu.institution || "Institution Name"}</span>
                  <span className="text-xs font-semibold text-black">
                    {edu.startYear || "Start"} - {edu.endYear || "End"}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[13px]">
                  <span className="italic text-black">
                    {edu.degree || "Degree"} {edu.field ? `in ${edu.field}` : ''}
                  </span>
                  {edu.cgpa && <span className="font-medium text-black">Score: {edu.cgpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Technical Skills */}
      {technicalSkills && technicalSkills.length > 0 && (
        <div className="mb-5 section-block">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 tracking-wider text-black">
            Technical Skills
          </h2>
          <div className="text-[13px]">
            {technicalSkills.map((skill, idx) => (
              skill.category && skill.skills ? (
                <div key={idx} className="mb-1">
                  <span className="font-bold text-black">{skill.category}: </span>
                  <span className="text-black">{skill.skills}</span>
                </div>
              ) : null
            ))}
          </div>
        </div>
      )}

      {/* 5. Projects */}
      {projects && projects.length > 0 && (
        <div className="mb-5 section-block">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 tracking-wider text-black">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="section-block">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-[13px]">
                    {proj.name || "Project Name"}
                    {proj.technologies && (
                      <span className="font-normal italic text-black ml-1">| {proj.technologies}</span>
                    )}
                  </span>
                  <div className="flex gap-2 text-xs font-medium text-blue-600">
                    {proj.github && <a href={proj.github} className="hover:underline">GitHub</a>}
                    {proj.url && <a href={proj.url} className="hover:underline">Live</a>}
                  </div>
                </div>
                {proj.description && (
                  <ul className="list-disc list-outside ml-4 text-[13px] text-black space-y-0.5 mt-1">
                    {proj.description.split('\n').filter(line => line.trim()).map((line, i) => (
                      <li key={i}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Experience */}
      {experience && experience.length > 0 && (
        <div className="mb-5 section-block">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 tracking-wider text-black">
            Experience
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="section-block">
                <div className="flex justify-between items-baseline font-bold text-[13px]">
                  <span>{exp.organization || "Organization"}</span>
                  <span className="text-xs font-semibold text-black">
                    {exp.startDate || "Start"} - {exp.endDate || "End"}
                  </span>
                </div>
                <div className="text-[13px] italic text-black mb-1">
                  {exp.role || "Role"} {exp.technologies ? ` | ${exp.technologies}` : ''}
                </div>
                {exp.description && (
                  <ul className="list-disc list-outside ml-4 text-[13px] text-black space-y-0.5">
                    {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                      <li key={i}>{line.replace(/^-\s*/, '')}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Certifications */}
      {certifications && certifications.length > 0 && (
        <div className="mb-5 section-block">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 tracking-wider text-black">
            Certifications
          </h2>
          <ul className="list-disc list-outside ml-4 text-[13px] text-black space-y-1">
            {certifications.map((cert, idx) => (
              <li key={idx}>
                <span className="font-bold">{cert.name || "Certification Name"}</span>
                {cert.organization && <span> - {cert.organization}</span>}
                {cert.date && <span className="text-black"> ({cert.date})</span>}
                {cert.url && (
                  <a href={cert.url} className="text-blue-600 ml-1 hover:underline text-xs">
                    [Link]
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="mb-5 section-block">
          <h2 className="text-sm font-bold border-b border-gray-400 pb-1 mb-2 tracking-wider text-black">
            Key Achievements
          </h2>
          <ul className="list-disc list-outside ml-4 text-[13px] text-black space-y-1">
            {achievements.map((ach, idx) => (
              <li key={idx}>{ach.description || "Achievement description"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
    </>
  );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
