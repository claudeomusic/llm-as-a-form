import { ToolDefinition } from 'llm-as-a-form';

export const tools: ToolDefinition[] = [
  {
    name: 'collect_user_info',
    description: 'Collect basic information about the user',
    parameters: {
      name: {
        type: 'string',
        description: 'Full name',
        required: true,
      },
      email: {
        type: 'string',
        description: 'Email address',
        required: true,
      },
      age: {
        type: 'number',
        description: 'Age in years',
        required: false,
      },
      country: {
        type: 'string',
        description: 'Country of residence',
        required: true,
        enum: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Other'],
      },
      subscribe: {
        type: 'boolean',
        description: 'Subscribe to newsletter',
        required: false,
        default: false,
      },
    },
  },
  {
    name: 'schedule_appointment',
    description: 'Schedule an appointment or meeting',
    parameters: {
      title: {
        type: 'string',
        description: 'Title or purpose of the appointment',
        required: true,
      },
      date: {
        type: 'string',
        description: 'Preferred date (YYYY-MM-DD format)',
        required: true,
      },
      time: {
        type: 'string',
        description: 'Preferred time (HH:MM format)',
        required: true,
      },
      duration: {
        type: 'number',
        description: 'Expected duration in minutes',
        required: true,
        enum: [15, 30, 45, 60, 90, 120],
      },
      notes: {
        type: 'string',
        description: 'Any additional notes or special requirements',
        required: false,
      },
    },
  },
  {
    name: 'provide_feedback',
    description: 'Collect feedback or review',
    parameters: {
      rating: {
        type: 'number',
        description: 'Rating out of 5',
        required: true,
        enum: [1, 2, 3, 4, 5],
      },
      category: {
        type: 'string',
        description: 'What are you providing feedback about?',
        required: true,
        enum: ['Product', 'Service', 'Support', 'Website', 'Other'],
      },
      comments: {
        type: 'string',
        description: 'Your detailed feedback or suggestions',
        required: true,
      },
      wouldRecommend: {
        type: 'boolean',
        description: 'Would you recommend us to others?',
        required: true,
      },
    },
  },
];
