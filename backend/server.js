import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['https://hrms-workflow.onrender.com'],
  credentials: true,
}));
app.use(express.json());

// --- MongoDB Mongoose Connection with Graceful In-Memory Fallback ---
let isMongoConnected = false;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.50.1:27017/workflow_hrms';

// In-Memory Database Fallback
let inMemoryJobs = [
  {
    jobPostingId: "1",
    title: "Senior React Developer",
    department: "Engineering",
    location: "Bangalore",
    jobType: "Full Time",
    experienceRequired: "4-6 years",
    salaryRange: "18-25 LPA",
    status: "Active",
    description: "We are looking for a Senior React Developer who has strong experience in building rich user interfaces with React, Redux, and modern CSS frameworks.",
    totalCandidates: 2
  },
  {
    jobPostingId: "2",
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    jobType: "Full Time",
    experienceRequired: "5-8 years",
    salaryRange: "20-30 LPA",
    status: "Active",
    description: "Looking for an experienced Product Manager to lead team strategy, sprint planning, and drive features from concept to production.",
    totalCandidates: 1
  },
  {
    jobPostingId: "3",
    title: "UX Designer",
    department: "Design",
    location: "Mumbai",
    jobType: "Full Time",
    experienceRequired: "2-4 years",
    salaryRange: "10-15 LPA",
    status: "Active",
    description: "Join our design team to craft beautiful user experiences, build responsive prototypes, and collaborate with frontend engineers.",
    totalCandidates: 0
  }
];

let inMemoryCandidates = [
  {
    candidateId: "1",
    fullName: "Arjun Mehta",
    appliedRole: "Senior React Developer",
    status: "Shortlisted",
    rating: 4,
    skills: "React, TypeScript, Node.js",
    experienceYears: "5 years",
    expectedSalary: "22 LPA",
    noticePeriod: "30 days",
    notes: "Good communication skills, strong frontend knowledge."
  },
  {
    candidateId: "2",
    fullName: "Deepika Nair",
    appliedRole: "Senior React Developer",
    status: "Interview Scheduled",
    rating: 5,
    skills: "React, Redux, GraphQL",
    experienceYears: "6 years",
    expectedSalary: "24 LPA",
    noticePeriod: "60 days",
    notes: "Excellent architectural understanding, very strong coding test performance."
  },
  {
    candidateId: "3",
    fullName: "Rohan Das",
    appliedRole: "Product Manager",
    status: "New",
    rating: 3,
    skills: "Product Management, Agile, Jira",
    experienceYears: "4 years",
    expectedSalary: "18 LPA",
    noticePeriod: "15 days",
    notes: "Eager to learn, experience in agile frameworks."
  }
];

// Mongoose Models
const JobPostingSchema = new mongoose.Schema({
  jobPostingId: String,
  title: String,
  department: String,
  location: String,
  jobType: String,
  experienceRequired: String,
  salaryRange: String,
  status: String,
  description: String,
  totalCandidates: Number
});

const CandidateSchema = new mongoose.Schema({
  candidateId: String,
  fullName: String,
  appliedRole: String,
  status: String,
  rating: Number,
  skills: String,
  experienceYears: String,
  expectedSalary: String,
  noticePeriod: String,
  notes: String
});

const JobPostingModel = mongoose.model('JobPosting', JobPostingSchema);
const CandidateModel = mongoose.model('Candidate', CandidateSchema);

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 2000,
}).then(async () => {
  console.log('Successfully connected to MongoDB database!');
  isMongoConnected = true;

  // Auto Seed database if empty
  const jobsCount = await JobPostingModel.countDocuments();
  if (jobsCount === 0) {
    await JobPostingModel.insertMany(inMemoryJobs);
    console.log('Seeded JobPostings to MongoDB');
  }

  const candidatesCount = await CandidateModel.countDocuments();
  if (candidatesCount === 0) {
    await CandidateModel.insertMany(inMemoryCandidates);
    console.log('Seeded Candidates to MongoDB');
  }
}).catch((err) => {
  console.warn('MongoDB connection timed out/failed. Falling back to robust in-memory mock storage mode.');
  console.warn('Set MONGO_URI in backend/.env if you want custom persistent database connectivity.');
});

// --- GraphQL Apollo Server Schema ---
const typeDefs = `#graphql
  type JobPosting {
    jobPostingId: ID!
    title: String!
    department: String!
    location: String!
    jobType: String!
    experienceRequired: String!
    salaryRange: String!
    status: String!
    description: String!
    totalCandidates: Int
  }

  type Candidate {
    candidateId: ID!
    fullName: String!
    appliedRole: String!
    status: String!
    rating: Int!
    skills: String!
    experienceYears: String!
    expectedSalary: String!
    noticePeriod: String!
    notes: String!
  }

  type JobPostingsData {
    jobPostings: [JobPosting!]!
  }

  type CandidatesData {
    candidates: [Candidate!]!
  }

  type GetAllJobPostingsResponse {
    data: JobPostingsData!
  }

  type GetAllCandidatesResponse {
    data: CandidatesData!
  }

  type UpdateCandidateStageData {
    candidateId: ID!
  }

  type UpdateCandidateStageResponse {
    data: UpdateCandidateStageData
    success: Boolean!
    message: String
  }

  input UpdateCandidateStageRequestInput {
    candidateId: ID!
    status: String!
  }

  input GetAllJobPostingsRequestInput {
    dummy: String
  }

  input GetAllCandidatesRequestInput {
    dummy: String
  }

  type Query {
    getAllJobPostings(request: GetAllJobPostingsRequestInput): GetAllJobPostingsResponse!
    getAllCandidates(request: GetAllCandidatesRequestInput): GetAllCandidatesResponse!
  }

  type Mutation {
    updateCandidateStage(request: UpdateCandidateStageRequestInput!): UpdateCandidateStageResponse!
  }
`;

const resolvers = {
  Query: {
    getAllJobPostings: async () => {
      let jobs = [];
      if (isMongoConnected) {
        jobs = await JobPostingModel.find({});
      } else {
        jobs = inMemoryJobs;
      }
      return {
        data: {
          jobPostings: jobs
        }
      };
    },
    getAllCandidates: async () => {
      let candidates = [];
      if (isMongoConnected) {
        candidates = await CandidateModel.find({});
      } else {
        candidates = inMemoryCandidates;
      }
      return {
        data: {
          candidates
        }
      };
    }
  },
  Mutation: {
    updateCandidateStage: async (_, { request }) => {
      const { candidateId, status } = request;
      if (isMongoConnected) {
        await CandidateModel.updateOne({ candidateId }, { status });
      } else {
        const candidate = inMemoryCandidates.find(c => c.candidateId === candidateId);
        if (candidate) {
          candidate.status = status;
        }
      }
      return {
        data: { candidateId },
        success: true,
        message: `Candidate status successfully updated to ${status}`
      };
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();
app.use('/graphql', expressMiddleware(server));

// --- REST Endpoint: AI HR Copilot ---
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_api_key_for_build_validation',
});

app.post('/api/copilot', async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `You are an expert HR Copilot assistant for WorkFlow HRMS. You help employees with HR-related questions.
User details:
- Name: ${userContext?.name || 'Employee'}
- Role: ${userContext?.role || 'Employee'}
- Department: ${userContext?.department || 'N/A'}
- Designation: ${userContext?.designation || 'N/A'}

Key company policies:
- Leave: Casual Leave 12 days, Sick Leave 10 days, Earned Leave 15 days per year
- Attendance: Office hours 9 AM to 6 PM, grace period 15 minutes
- Salary: Paid on last working day of each month
- Expenses: Submit within 30 days with receipt attached
- Work from home: 2 days per week with manager approval
- Performance reviews: Quarterly and Annual

Keep responses concise, friendly and helpful. Use bullet points where appropriate. Answer only HR-related questions.`,
        },
        ...messages,
      ],
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
    res.json({ reply });
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
});
