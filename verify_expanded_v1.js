const fs = require('fs');
const path = require('path');

// Mock data to simulate resume text
const resumeText = `
John Doe
Software Engineer
(123) 456-7890 | john@example.com | linkedin.com/in/johndoe | github.com/johndoe

SUMMARY
Experienced developer with expertise in React and Node.js.

EXPERIENCE
Software Developer | Google | Jan 2020 - Present
• Built several microservices.
• Optimized data processing.

PROJECTS
Personal Portfolio
• Created a responsive website using Vite.
• Implemented dark mode.
Amdox App
• Developed a resume parsing system.

CERTIFICATIONS
AWS Certified Solutions Architect
Certificate of Excellence in Coding
Google Cloud Certification

EDUCATION
Stanford University
B.S. in Computer Science
`;

// Simple extraction logic similar to userController.js for verification
const extractSectionText = (text, headers) => {
    const lines = text.split('\n');
    let result = '';
    let capturing = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lowerLine = line.toLowerCase();

        const isHeader = headers.some(h => {
            if (lowerLine === h) return true;
            if (lowerLine === h + ':') return true;
            return false;
        });

        if (isHeader) {
            capturing = true;
            continue;
        }

        if (capturing) {
            // Check if we hit another header
            const anotherHeader = ['experience', 'projects', 'certifications', 'education', 'summary'].some(h => {
                return lowerLine === h || lowerLine === h + ':';
            });

            if (anotherHeader) {
                capturing = false;
                continue;
            }

            result += line + '\n';
        }
    }
    return result.trim();
};

const parseProjects = (projText) => {
    if (!projText) return [];
    const lines = projText.split('\n').map(l => l.trim()).filter(Boolean);
    const projects = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith('•') && !line.startsWith('-')) {
            const title = line;
            let description = '';
            let j = i + 1;
            while (j < lines.length && (lines[j].startsWith('•') || lines[j].startsWith('-'))) {
                description += ' ' + lines[j].replace(/^[•\-]\s*/, '');
                j++;
            }
            i = j - 1;
            projects.push({ title, description: description.trim() });
        }
    }
    return projects;
};

const parseCertifications = (certText) => {
    if (!certText) return [];
    const lines = certText.split('\n').map(l => l.trim()).filter(Boolean);
    return lines.map(line => ({ name: line, issuer: '', date: '' }));
};

const extractSocialLinks = (text) => {
    const links = { linkedin: '', github: '', portfolio: '' };
    if (text.includes('linkedin.com/in/')) {
        links.linkedin = 'https://' + text.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/)[0];
    }
    if (text.includes('github.com/')) {
        links.github = 'https://' + text.match(/github\.com\/[a-zA-Z0-9_-]+/)[0];
    }
    return links;
};

// Run verification
console.log('--- Verification Output ---');

const projText = extractSectionText(resumeText, ['projects']);
const projects = parseProjects(projText);
console.log('Projects found:', projects.length);
console.log('First project:', projects[0]);

const certText = extractSectionText(resumeText, ['certifications']);
const certifications = parseCertifications(certText);
console.log('\nCertifications found:', certifications.length);
console.log('First certification:', certifications[0]);

const socials = extractSocialLinks(resumeText);
console.log('\nSocial Links:', socials);

const isValid = projects.length === 2 && certifications.length === 3 && socials.linkedin && socials.github;
console.log('\nVerification Status:', isValid ? '✅ PASSED' : '❌ FAILED');

if (!isValid) process.exit(1);
