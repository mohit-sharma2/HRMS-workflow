import { HRMSUser } from '../types';

export const MOCK_USERS: HRMSUser[] = [
  {
    email: 'employee@hrms.com',
    name: 'Sarah Johnson',
    role: 'Employee',
    department: 'Engineering',
    designation: 'Software Engineer',
    employeeId: 'EMP001',
    joinDate: '2023-01-15',
  },
  {
    email: 'manager@hrms.com',
    name: 'Michael Scott',
    role: 'Manager',
    department: 'Engineering',
    designation: 'Engineering Manager',
    employeeId: 'EMP002',
    joinDate: '2021-06-01',
  },
  {
    email: 'hr@hrms.com',
    name: 'Priya Sharma',
    role: 'HR',
    department: 'Human Resources',
    designation: 'HR Specialist',
    employeeId: 'EMP003',
    joinDate: '2020-03-10',
  },
  {
    email: 'admin@hrms.com',
    name: 'Admin User',
    role: 'Admin',
    department: 'IT',
    designation: 'System Administrator',
    employeeId: 'EMP004',
    joinDate: '2019-08-20',
  },
];

export const ATTENDANCE_DATA = [
  { date: '2025-06-16', clockIn: '09:02', clockOut: '18:05', status: 'Present', hours: '9h 3m' },
  { date: '2025-06-17', clockIn: '09:15', clockOut: '18:00', status: 'Present', hours: '8h 45m' },
  { date: '2025-06-18', clockIn: '10:05', clockOut: '18:00', status: 'Late', hours: '7h 55m' },
  { date: '2025-06-19', clockIn: '', clockOut: '', status: 'Absent', hours: '0h' },
  { date: '2025-06-20', clockIn: '09:00', clockOut: '13:00', status: 'Half Day', hours: '4h' },
  { date: '2025-06-21', clockIn: '08:55', clockOut: '18:10', status: 'Present', hours: '9h 15m' },
  { date: '2025-06-22', clockIn: '09:00', clockOut: '18:00', status: 'Present', hours: '9h' },
];

export const LEAVE_BALANCE = [
  { type: 'Casual Leave', total: 12, used: 4, remaining: 8, color: 'teal' },
  { type: 'Sick Leave', total: 10, used: 2, remaining: 8, color: 'blue' },
  { type: 'Earned Leave', total: 15, used: 5, remaining: 10, color: 'orange' },
  { type: 'Comp Off', total: 3, used: 1, remaining: 2, color: 'purple' },
];

export const LEAVE_REQUESTS = [
  { id: 1, employee: 'Sarah Johnson', type: 'Casual Leave', from: '2025-06-25', to: '2025-06-26', days: 2, reason: 'Personal work', status: 'Pending' },
  { id: 2, employee: 'Ravi Kumar', type: 'Sick Leave', from: '2025-06-20', to: '2025-06-20', days: 1, reason: 'Not feeling well', status: 'Approved' },
  { id: 3, employee: 'Anjali Singh', type: 'Earned Leave', from: '2025-07-01', to: '2025-07-05', days: 5, reason: 'Family vacation', status: 'Pending' },
  { id: 4, employee: 'Tom Hardy', type: 'Casual Leave', from: '2025-06-18', to: '2025-06-18', days: 1, reason: 'Personal', status: 'Rejected' },
];

export const PAYSLIPS = [
  { month: 'May 2025', basic: 50000, hra: 20000, da: 5000, pf: 6000, esi: 1750, tds: 8000, net: 59250, status: 'Paid' },
  { month: 'Apr 2025', basic: 50000, hra: 20000, da: 5000, pf: 6000, esi: 1750, tds: 8000, net: 59250, status: 'Paid' },
  { month: 'Mar 2025', basic: 50000, hra: 20000, da: 5000, pf: 6000, esi: 1750, tds: 8000, net: 59250, status: 'Paid' },
  { month: 'Feb 2025', basic: 48000, hra: 19200, da: 4800, pf: 5760, esi: 1680, tds: 7500, net: 57060, status: 'Paid' },
];

export const GOALS = [
  { id: 1, title: 'Complete React certification', category: 'Individual', type: 'Quarterly', progress: 65, status: 'In Progress', dueDate: '2025-06-30', weight: 30 },
  { id: 2, title: 'Improve API response time by 20%', category: 'Team', type: 'Quarterly', progress: 80, status: 'On Track', dueDate: '2025-06-30', weight: 25 },
  { id: 3, title: 'Mentor 2 junior developers', category: 'Individual', type: 'Annual', progress: 50, status: 'In Progress', dueDate: '2025-12-31', weight: 20 },
  { id: 4, title: 'Launch new mobile app', category: 'Departmental', type: 'Annual', progress: 30, status: 'At Risk', dueDate: '2025-09-30', weight: 25 },
];

export const TRAININGS = [
  { id: 1, title: 'React Advanced Patterns', category: 'Technical', duration: '8h', progress: 75, status: 'In Progress', mandatory: true, dueDate: '2025-06-30', certificate: true },
  { id: 2, title: 'Data Privacy & GDPR', category: 'Compliance', duration: '3h', progress: 100, status: 'Completed', mandatory: true, dueDate: '2025-05-31', certificate: true },
  { id: 3, title: 'Leadership Essentials', category: 'Soft Skills', duration: '6h', progress: 0, status: 'Not Started', mandatory: false, dueDate: '2025-07-31', certificate: false },
  { id: 4, title: 'Company Orientation', category: 'Orientation', duration: '4h', progress: 100, status: 'Completed', mandatory: true, dueDate: '2025-02-01', certificate: true },
];

export const ANNOUNCEMENTS = [
  { id: 1, title: 'Office will be closed on July 4th', category: 'HR Update', priority: 'High', date: '2025-06-20', views: 120, likes: 45, content: 'Please note that office will remain closed on July 4th on account of Independence Day. Work from home is allowed.' },
  { id: 2, title: 'New Health Insurance Policy Effective July 1', category: 'Policy', priority: 'High', date: '2025-06-18', views: 98, likes: 30, content: 'We are upgrading our health insurance coverage. New policy documents have been shared via email.' },
  { id: 3, title: 'Q2 Town Hall Meeting - June 30', category: 'Event', priority: 'Medium', date: '2025-06-15', views: 150, likes: 60, content: 'Join us for our Q2 Town Hall on June 30 at 3 PM. Leadership will share company updates and Q&A session.' },
  { id: 4, title: 'Congratulations to June Joiners!', category: 'Celebration', priority: 'Low', date: '2025-06-10', views: 200, likes: 95, content: 'Please join us in welcoming our new team members who joined this month!' },
];

export const TEAM_MEMBERS = [
  { id: 1, name: 'Sarah Johnson', role: 'Employee', designation: 'Software Engineer', department: 'Engineering', status: 'Active', email: 'sarah@hrms.com', joinDate: '2023-01-15' },
  { id: 2, name: 'Ravi Kumar', role: 'Employee', designation: 'Frontend Developer', department: 'Engineering', status: 'Active', email: 'ravi@hrms.com', joinDate: '2023-03-01' },
  { id: 3, name: 'Anjali Singh', role: 'Employee', designation: 'Backend Developer', department: 'Engineering', status: 'Active', email: 'anjali@hrms.com', joinDate: '2022-11-10' },
  { id: 4, name: 'Tom Hardy', role: 'Employee', designation: 'QA Engineer', department: 'Engineering', status: 'On Leave', email: 'tom@hrms.com', joinDate: '2022-08-20' },
  { id: 5, name: 'Neha Patel', role: 'Employee', designation: 'DevOps Engineer', department: 'Engineering', status: 'Active', email: 'neha@hrms.com', joinDate: '2024-01-05' },
];

export const JOB_POSTINGS = [
  { id: 1, title: 'Senior React Developer', department: 'Engineering', location: 'Bangalore', type: 'Full Time', experience: '4-6 years', salary: '18-25 LPA', applicants: 45, shortlisted: 12, interviewing: 5, status: 'Active' },
  { id: 2, title: 'Product Manager', department: 'Product', location: 'Remote', type: 'Full Time', experience: '5-8 years', salary: '20-30 LPA', applicants: 30, shortlisted: 8, interviewing: 3, status: 'Active' },
  { id: 3, title: 'UX Designer', department: 'Design', location: 'Mumbai', type: 'Full Time', experience: '2-4 years', salary: '10-15 LPA', applicants: 60, shortlisted: 15, interviewing: 6, status: 'Active' },
];

export const CANDIDATES = [
  { id: 1, name: 'Arjun Mehta', role: 'Senior React Developer', status: 'Shortlisted', rating: 4, skills: ['React', 'TypeScript', 'Node.js'], experience: '5 years', expectedSalary: '22 LPA', noticePeriod: '30 days' },
  { id: 2, name: 'Deepika Nair', role: 'Senior React Developer', status: 'Interview Scheduled', rating: 5, skills: ['React', 'Redux', 'GraphQL'], experience: '6 years', expectedSalary: '24 LPA', noticePeriod: '60 days' },
  { id: 3, name: 'Vikram Shah', role: 'Product Manager', status: 'New', rating: 3, skills: ['Product Strategy', 'Agile', 'Jira'], experience: '7 years', expectedSalary: '28 LPA', noticePeriod: '90 days' },
];

export const RECOGNITIONS = [
  { id: 1, from: 'Michael Scott', to: 'Sarah Johnson', category: 'Excellence', message: 'Outstanding work on the new feature release! Delivered ahead of schedule with zero bugs.', date: '2025-06-20', likes: 12, isPublic: true },
  { id: 2, from: 'Sarah Johnson', to: 'Ravi Kumar', category: 'Team Player', message: 'Always goes above and beyond to help teammates. True team spirit!', date: '2025-06-18', likes: 8, isPublic: true },
  { id: 3, from: 'Priya Sharma', to: 'Anjali Singh', category: 'Innovation', message: 'Brilliant solution to the performance bottleneck. Reduced load time by 40%!', date: '2025-06-15', likes: 20, isPublic: true },
];

// ── Onboarding ──────────────────────────────────────────────

export const ONBOARDING_EMPLOYEE = {
  name: 'Alex Ramirez',
  designation: 'Full Stack Developer',
  department: 'Engineering',
  manager: 'Michael Scott',
  buddy: 'Ravi Kumar',
  joiningDate: '2025-07-01',
  email: 'alex.ramirez@hrms.com',
  employeeId: 'EMP006',
};

export const ONBOARDING_TASKS = [
  // Pre-joining
  { id: 1, phase: 'Pre-Joining', title: 'Sign offer letter', description: 'Review and digitally sign the offer letter', priority: 'High', dueDate: '2025-06-25', assignee: 'Alex Ramirez', status: 'Completed', completedDate: '2025-06-22' },
  { id: 2, phase: 'Pre-Joining', title: 'Submit identity documents', description: 'Upload Aadhaar, PAN, passport copies', priority: 'High', dueDate: '2025-06-26', assignee: 'Alex Ramirez', status: 'Completed', completedDate: '2025-06-24' },
  { id: 3, phase: 'Pre-Joining', title: 'Fill tax declaration form', description: 'Complete Form 12BB for tax deductions', priority: 'Medium', dueDate: '2025-06-27', assignee: 'Alex Ramirez', status: 'In Progress', completedDate: null },
  { id: 4, phase: 'Pre-Joining', title: 'Submit bank account details', description: 'Provide bank details for salary account', priority: 'High', dueDate: '2025-06-28', assignee: 'Alex Ramirez', status: 'Not Started', completedDate: null },
  // Day 1
  { id: 5, phase: 'Day 1', title: 'Collect laptop & accessories', description: 'Visit IT desk for hardware setup', priority: 'High', dueDate: '2025-07-01', assignee: 'IT Team', status: 'Not Started', completedDate: null },
  { id: 6, phase: 'Day 1', title: 'Set up email & Slack', description: 'Configure company email and join Slack channels', priority: 'High', dueDate: '2025-07-01', assignee: 'Alex Ramirez', status: 'Not Started', completedDate: null },
  { id: 7, phase: 'Day 1', title: 'Meet your manager', description: 'Intro meeting with Michael Scott', priority: 'High', dueDate: '2025-07-01', assignee: 'Michael Scott', status: 'Not Started', completedDate: null },
  { id: 8, phase: 'Day 1', title: 'Meet your buddy', description: 'Coffee chat with Ravi Kumar', priority: 'Medium', dueDate: '2025-07-01', assignee: 'Ravi Kumar', status: 'Not Started', completedDate: null },
  // Week 1
  { id: 9, phase: 'Week 1', title: 'Complete company orientation', description: 'Attend company culture and values session', priority: 'High', dueDate: '2025-07-03', assignee: 'HR Team', status: 'Not Started', completedDate: null },
  { id: 10, phase: 'Week 1', title: 'Complete security training', description: 'GDPR and data security modules', priority: 'High', dueDate: '2025-07-05', assignee: 'Alex Ramirez', status: 'Not Started', completedDate: null },
  { id: 11, phase: 'Week 1', title: 'Review codebase & architecture', description: 'Go through project repos and documentation', priority: 'Medium', dueDate: '2025-07-05', assignee: 'Alex Ramirez', status: 'Not Started', completedDate: null },
  // Week 2
  { id: 12, phase: 'Week 2', title: 'First code contribution', description: 'Pick up a starter issue and submit a PR', priority: 'Medium', dueDate: '2025-07-11', assignee: 'Alex Ramirez', status: 'Not Started', completedDate: null },
  { id: 13, phase: 'Week 2', title: 'Attend team standup for a week', description: 'Join daily standups to understand workflow', priority: 'Low', dueDate: '2025-07-11', assignee: 'Alex Ramirez', status: 'Not Started', completedDate: null },
  // Month 1
  { id: 14, phase: 'Month 1', title: '30-day check-in with manager', description: 'Review onboarding progress and set goals', priority: 'High', dueDate: '2025-07-31', assignee: 'Michael Scott', status: 'Not Started', completedDate: null },
  { id: 15, phase: 'Month 1', title: 'Complete all mandatory trainings', description: 'Finish React Advanced Patterns and GDPR modules', priority: 'High', dueDate: '2025-07-31', assignee: 'Alex Ramirez', status: 'Not Started', completedDate: null },
];

export const WELCOME_MESSAGES = [
  { id: 1, from: 'Rajiv Mehta', role: 'CEO', message: 'Welcome to the team, Alex! We\'re thrilled to have you join our journey. Your skills in full-stack development will be a great asset. Looking forward to the amazing things you\'ll build here!', hasVideo: true },
  { id: 2, from: 'Michael Scott', role: 'Manager', message: 'Hey Alex! I\'m excited to be your manager. Our engineering team is building some incredible products and you\'re joining at the perfect time. Let\'s catch up on your first day for a proper introduction.', hasVideo: false },
  { id: 3, from: 'Ravi Kumar', role: 'Buddy', message: 'Hi Alex! I\'ll be your onboarding buddy. Don\'t hesitate to reach out for anything — from finding the best lunch spots to understanding our codebase. Looking forward to working with you!', hasVideo: false },
  { id: 4, from: 'Priya Sharma', role: 'HR', message: 'Welcome aboard, Alex! All your onboarding documents are listed in your checklist. Feel free to reach out if you need any help with paperwork or have questions about company policies.', hasVideo: false },
];

export const ONBOARDING_TEAM = [
  { id: 1, name: 'Michael Scott', designation: 'Engineering Manager', bio: '10+ years in software engineering leadership. Passionate about building high-performance teams.', expertise: ['Team Leadership', 'System Design', 'Agile'], funFact: 'Has completed 3 marathons 🏃', introSent: true, welcomeSent: true },
  { id: 2, name: 'Ravi Kumar', designation: 'Frontend Developer', bio: 'React specialist with 4 years of experience. Open source contributor and coffee enthusiast.', expertise: ['React', 'TypeScript', 'CSS'], funFact: 'Makes the best chai in the office ☕', introSent: true, welcomeSent: true },
  { id: 3, name: 'Anjali Singh', designation: 'Backend Developer', bio: 'Node.js and .NET expert. Loves optimizing database queries and building scalable APIs.', expertise: ['Node.js', '.NET', 'PostgreSQL'], funFact: 'Amateur photographer 📸', introSent: true, welcomeSent: false },
  { id: 4, name: 'Tom Hardy', designation: 'QA Engineer', bio: 'Quality advocate with expertise in automated testing. Believes in breaking things to make them stronger.', expertise: ['Selenium', 'Jest', 'Cypress'], funFact: 'Board game champion 🎲', introSent: false, welcomeSent: false },
  { id: 5, name: 'Neha Patel', designation: 'DevOps Engineer', bio: 'Cloud infrastructure specialist. Kubernetes and AWS certified. Automates everything.', expertise: ['AWS', 'Kubernetes', 'CI/CD'], funFact: 'Plays drums in a band 🥁', introSent: false, welcomeSent: false },
];

export const RELOCATION_SUPPORT = {
  status: 'In Progress',
  visaStatus: 'H-1B Approved',
  accommodation: { status: 'Arranged', details: 'Company guest house for first 2 weeks, relocation allowance of ₹50,000 provided' },
  travel: { status: 'Booked', details: 'Flight booked for June 30, 2025. Airport pickup arranged.' },
  allowance: '₹50,000',
  localBuddy: { name: 'Ravi Kumar', phone: '+91 98765 43210', email: 'ravi@hrms.com' },
  tickets: [
    { id: 1, title: 'Need help with temporary accommodation extension', status: 'Open', priority: 'Medium', date: '2025-06-22' },
    { id: 2, title: 'Request for office parking pass', status: 'Resolved', priority: 'Low', date: '2025-06-20' },
  ],
};

export const ONBOARDING_MILESTONES = [
  { id: 1, title: 'Pre-Joining Complete', description: 'All documents submitted and verified', date: '2025-06-28', type: 'check-in', status: 'Upcoming' },
  { id: 2, title: 'Day 1 Welcome', description: 'Team welcome and setup complete', date: '2025-07-01', type: 'celebration', status: 'Upcoming' },
  { id: 3, title: 'Week 1 Check-in', description: 'First week review with manager', date: '2025-07-05', type: 'check-in', status: 'Upcoming' },
  { id: 4, title: '30-Day Review', description: 'First month performance check-in', date: '2025-07-31', type: 'review', status: 'Upcoming' },
  { id: 5, title: '60-Day Review', description: 'Mid-probation review', date: '2025-08-31', type: 'review', status: 'Upcoming' },
  { id: 6, title: '90-Day Celebration', description: 'Onboarding complete! Welcome party 🎉', date: '2025-09-30', type: 'celebration', status: 'Upcoming' },
];