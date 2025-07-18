// services/api.ts
const SERVER_BASE = 'http://192.168.76.66:5000';
const API_PATHS = {
  GP: '/api/gp',
  LMS: '/api/lms',
  NORMAL :'/api'
};

export interface RegisterRequest {
  name: string;
  age: number;
  phone: string;
  email: string;
  password: string;
  language_preferred: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  _id: string;
  token: string;
  learner_id: string;
  message: string;
  modules_status?: string;
  language?: string;
}

export interface LoginResponse {
  _id: string;
  token: string;
  learner_id: string;
  modules_generated: boolean;
  modules_count: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  language_preferred: string;
  learner_id: string;
  wallet_balance: number;
  conversation_ids: string[];
  purchased_lead_ids: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProfileResponse {
  message: string;
  gp: UserProfile;
}

export interface Course {
  _id: string;
  course_id: string;
  learner_id: string;
  title: string;
  topic: string;
  module_ids: string[];
  status: string;
  progress_percentage: number;
  language: string;
  created_at: string;
  modules?: any[];
}

export interface CoursesResponse {
  success: boolean;
  message: string;
  courses: Course[];
  summary: {
    total: number;
    completed: number;
    in_progress: number;
    not_started: number;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Add new interfaces for course details
export interface ModuleProgress {
  _id: string;
  learner_id: string;
  module_id: string;
  status: string;
  progress_percentage: number;
  completed_sections: string[];
  createdAt: string;
  updatedAt: string;
  last_accessed?: string;
  feedback?: string;
  score?: number;
  completed_at?: string;
}

export interface CaseScenario {
  context: string;
  question: string;
  options: string[];
  correct_option: string;
  rationale: string;
}

export interface Module {
  _id: string;
  module_id: string;
  title: string;
  category: string;
  estimated_time_min: number;
  generated_summary: string;
  content: StructuredContent | string; // Support both new and legacy format
  original_content?: string; // Fallback for legacy content
  video_url?: string;
  external_resources?: string[];
  case_scenario?: CaseScenario;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleDetailsResponse {
  module: Module;
  progress: ModuleProgress;
}

export interface CourseStartResponse {
  success: boolean;
  message: string;
  course: Course;
}

// Add new interfaces for lead creation
export interface LeadContact {
  name: string;
  phone: string;
  email?: string;
  age?: number;
  region?: string;
  preferred_language?: string;
}

export interface LeadInterest {
  products?: string[];
  interest_level?: 'low' | 'medium' | 'high';
  budget_range?: string;
  urgency_level?: 'no_urgency' | 'within_year' | 'within_month' | 'immediate';
}

export interface CreateLeadRequest {
  contact: LeadContact;
  interest: LeadInterest;
  notes?: string;
}

export interface CreateLeadResponse {
  success: boolean;
  message: string;
  lead: any; // You can define a more specific type if needed
}

// Add after existing interfaces
export interface ModuleStartResponse {
  success: boolean;
  message: string;
  progress: ModuleProgress;
}

export interface SubmitAnswerRequest {
  answer: string;
}

export interface SubmitAnswerResponse {
  message: string;
  progress: ModuleProgress;
  conversation_id: string;
  initial_question: string;
  language: string;
}

export interface ChatbotRequest {
  answer: string;
}

export interface ChatbotResponse {
  success: boolean;
  message?: string;
  bot_response?: string;
  next_question?: string;
  conversation_id?: string;
  is_completed?: boolean;
  final_score?: number;
  assessment?: string;
  feedback?: string;
  current_score?: number;
  evaluation?: string;
  interaction_count?: number;
  interaction?: {
    _id: string;
    learner_id: string;
    module_id: string;
    conversation_id: string;
    messages: string[];
    timestamp: string;
    createdAt: string;
    updatedAt: string;
    feedback_score?: number;
    evaluation_history?: Array<{
      response: string;
      evaluation: string;
      score: number;
      timestamp: string;
    }>;
    status?: string;
    final_evaluation?: {
      average_comprehension: number;
      total_interactions: number;
      completion_date: string;
      overall_assessment: string;
    };
  };
  progress?: {
    _id: string;
    learner_id: string;
    module_id: string;
    status: string;
    progress_percentage: number;
    completed_sections: string[];
    createdAt: string;
    updatedAt: string;
    last_accessed?: string;
    feedback?: string;
    score?: number;
    completed_at?: string;
  };
  language?: string;
}
// Add new interfaces for case study submission
export interface CaseStudySubmissionRequest {
  selected_option: string;
}

export interface ContentSection {
  title: string;
  content: string;
  icon: string;
  estimatedTime: number;
}

export interface StructuredContent {
  introduction: ContentSection;
  keyConcepts: ContentSection;
  practicalExamples: ContentSection;
  risksAndProcess: ContentSection;
}

export interface CaseStudySubmissionResponse {
  message: string;
  progress: ModuleProgress;
  conversation_id: string;
  initial_question: string;
  language: string;
}

/**
 * Interface for bulk call request payload
 */
export interface BulkCallRequest {
  call_to: {
    id: string;
    name: string;
    phonenumber: string;
  }[];
  name: string;
  additional_info: string;
  token: string;
}

/**
 * Interface for bulk call response
 */
export interface BulkCallResponse {
  success: boolean;
  message: string;
  calls: {
    id: string;
    status: string;
    call_id?: string;
    error?: string;
  }[];
}

export interface VectorLeadCreateResponse {
  message: string;
}

export interface RecommendedLead {
  _id: string;
  buyer_gp_ids: string[];
  contact: {
    name: string;
    phone: string;
  };
  createdAt: string;
  interest: {
    interest_level: 'low' | 'medium' | 'high';
    products: string[];
  };
  is_sellable: boolean;
  notes: string;
  personal_data: {
    age: number;
    income: string;
    occupation: string;
    state: string;
  };
  referrer_gp_id: string;
  score: number;
  status: string;
  summary: string;
  updatedAt: string;
}

export interface RecommendationResponse {
  gp_id: string;
  recommendations: RecommendedLead[];
  used_language_filter: string | null;
  used_product_filters: string[] | null;
}

export interface QueryRecommendationResponse {
  query: string;
  recommendations: RecommendedLead[];
}

export interface AddCoinsResponse {
  success: boolean;
  message: string;
  newBalance?: number;
}

// Add this interface
export interface UseCoinsResponse {
  message: string;
  currentCoins: number;
  used: number;
}

// Add these interfaces for the bulk call requests API
export interface CallDetails {
  lead_id: string;
  phonenumber: string;
  status: string;
  callSid: string | null;
  conversation_id: string | null;
  error: string | null;
  updatedAt: string;
  conversation_details: any | null;
}

export interface AllBulkCallRequest {
  request_id: string;
  status: string;
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  no_answer_calls: number;
  additional_info: string;
  createdAt: string;
  updatedAt: string;
  calls: CallDetails[];
  summary: {
    pending: number;
    queued: number;
    initiated: number;
    completed: number;
    no_answer: number;
    failed: number;
    high_priority: number;
    interested_leads: number;
    positive_sentiment: number;
  };
  performance_metrics: {
    completion_rate: string;
    answer_rate: string;
    success_rate: string;
  };
}

export interface BulkCallRequestsResponse {
  success: boolean;
  bulk_requests: AllBulkCallRequest[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  filters_applied: Record<string, any>;
  sort: {
    by: string;
    order: string;
  };
}

// Add this interface for the lead data response
export interface LeadDetailsResponse {
  message: string;
  lead: {
    contact: {
      name: string;
      phone: string;
    };
    interest: {
      products: string[];
    };
    _id: string;
    referrer_gp_id: string;
    buyer_gp_ids: string[];
    isSellable: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    referrer?: {
      _id: string;
      name: string;
      email: string;
    };
    buyers: any[];
    id: string;
  };
}

// Add these interfaces
export interface ChatMessage {
  text: string;
  isCustomer: boolean;
}

export interface RecommendationsResponse {
  message: string;
  recommendations: {
    suggestedReplies: string[];
    insights: string[];
    recommendations: string[];
  };
  raw: string;
}

export interface ConversationAnalysisResponse {
  message: string;
  analysis: any;
}

// Add this interface near the other interfaces in api.ts
export interface ConversationsResponse {
  success: boolean;
  conversations: Array<{
    _id: string;
    conversation_id: string;
    callSid: string;
    lead_id: string;
    status: string;
    call_duration: number;
    summary: string;
    interests: string[];
    createdAt: string;
    updatedAt: string;
    interest: {
      products: string[];
      interest_level: string;
      budget_range: string;
      urgency_level: string;
    };
    personal_data: {
      occupation: string;
      age: number | null;
      income: number | null;
      state: string;
    };
    transcript: Array<{
      type: string;
      text: string;
      timestamp: string;
      _id: string;
    }>;
    sentiment_analysis?: {
      overall_sentiment: string;
      user_sentiment: string;
      agent_performance: string;
    };
    key_insights?: {
      main_topics: string[];
      user_concerns: string[];
      next_steps: string[];
      product_interest_level: string;
      decision_timeline: string;
    };
  }>;
  total: number;
  filters_applied: Record<string, any>;
}

export interface ConversationAnalysisResult {
  analysis: {
    bad_points: string[];
    bad_transcript: string;
    good_points: string[];
    intent: string;
    problematic_messages: Array<{
      issue: string;
      message_number: number;
      message_text: string;
      suggestion: string;
    }>;
    sentiment: string;
    theory: string;
    topic: string;
  };
  analysis_id: string;
  created_at: string;
  lead_id: string;
  status: string;
  summary: {
    agent_messages: number;
    total_issues: number;
    total_messages: number;
    user_messages: number;
  };
}

export interface CreateCourseFromPromptResponse {
  success: boolean;
  message: string;
  course_id?: string;
}

export interface CopilotAnalysisItem {
  _id: string;
  agent_messages: number;
  agent_name: string | null;
  analysis: {
    bad_points: string[];
    bad_transcript: string;
    good_points: string[];
    intent: string;
    problematic_messages: Array<{
      issue: string;
      message_number: number;
      message_text: string;
      suggestion: string;
    }>;
    sentiment: string;
    theory: string;
    topic: string;
  };
  analysis_id: string;
  call_duration: number | null;
  created_at: string;
  department: string | null;
  lead_id: string;
  total_issues: number;
  total_messages: number;
  transcript: Array<{
    message: string;
    role: string;
  }>;
  user_messages: number;
}

export interface CopilotAnalysisResponse {
  count: number;
  data: CopilotAnalysisItem[];
  status: string;
}

class ApiService {
  public async getAuthToken(): Promise<string | null> {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private getAuthHeaders(): Record<string, string> {
    // Create empty headers object
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Try to get token synchronously
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = AsyncStorage.getItem('userToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth headers:', error);
    }
    
    return headers;
  }

  private async makeRequest<T>(
    path: string,
    endpoint: string,
    options: RequestInit,
    requireAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      };

      if (requireAuth) {
        const token = await this.getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else {
          return {
            success: false,
            error: 'Authentication token not found',
          };
        }
      }
      
      // Ensure paths are correctly formatted
      const formattedPath = path.startsWith('/') ? path : `/${path}`;
      const formattedEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
      
      const url = `${SERVER_BASE}${formattedPath}/${formattedEndpoint}`;
      console.log(`Making request to: ${url}`);
      console.log('Headers:', JSON.stringify(headers, null, 2));
      
      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
      
      const response = await fetch(url, {
        headers,
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', contentType);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200) + '...'); // Log first 200 chars
        return {
          success: false,
          error: `Invalid response format (${contentType}). Expected JSON. Server returned: ${text.substring(0, 100)}...`,
        };
      }

      const data = await response.json();
      console.log('Response data:', JSON.stringify(data, null, 2).substring(0, 200) + '...');

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || `HTTP Error: ${response.status} ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error: unknown) {
      // Check for timeout
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out');
        return {
          success: false,
          error: 'Request timed out. The server took too long to respond.',
        };
      }
      
      console.error('API request error:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return {
          success: false,
          error: 'Invalid JSON response from server. Please check your connection or try again later.',
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // GP API endpoints
  async register(userData: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
    return this.makeRequest(API_PATHS.GP, '/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest(API_PATHS.GP, '/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    return this.makeRequest(API_PATHS.GP, '/profile', {
      method: 'GET',
    }, true);
  }

  // LMS API endpoints
  async getCourses(): Promise<ApiResponse<CoursesResponse>> {
    console.log('Fetching courses...');
    return this.makeRequest(API_PATHS.LMS, '/courses', {
      method: 'GET',
    }, true);
  }

  async createCourseFromPrompt(topic: string): Promise<ApiResponse<CreateCourseFromPromptResponse>> {
  console.log('Creating course from prompt:', topic);
  try {
    const token = await this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      return {
        success: false,
        error: 'Authentication token not found'
      };
    }
    
    return this.makeRequest(API_PATHS.NORMAL, '/priority-queue', {
      method: 'POST',
      headers,
      body: JSON.stringify({ term: `${topic}` , priority : 10 }),
    }, true);
  } catch (error) {
    console.error('Error in createCourseFromPrompt:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

  async startCourse(courseId: string): Promise<ApiResponse<CourseStartResponse>> {
    console.log('Starting course:', courseId);
    return this.makeRequest(API_PATHS.LMS, `/courses/${courseId}/start`, {
      method: 'POST',
    }, true);
  }

  async getModuleDetails(moduleId: string): Promise<ApiResponse<ModuleDetailsResponse>> {
    console.log('Fetching module details:', moduleId);
    return this.makeRequest(API_PATHS.LMS, `/module/${moduleId}`, {
      method: 'GET',
    }, true);
  }

  // Connection testing methods
  async testConnection(): Promise<boolean> {
    try {
      console.log(`Testing connection to ${SERVER_BASE}...`);
      const response = await fetch(SERVER_BASE, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      console.log(`Connection test status: ${response.status}`);
      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async testEndpoint(path: string): Promise<string> {
    try {
      const url = `${SERVER_BASE}${path}`;
      console.log(`Testing endpoint: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const text = await response.text();
      console.log(`Endpoint test result (${response.status}):`, text.substring(0, 200));
      return `Status: ${response.status}, Response: ${text.substring(0, 100)}...`;
    } catch (error) {
      console.error('Endpoint test failed:', error);
      return `Error: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  // Add this method to the ApiService class
 // Update the createLead method

async createLead(leadData: CreateLeadRequest): Promise<ApiResponse<CreateLeadResponse>> {
  console.log('Creating lead:', leadData.contact.name);
  
  // Filter out undefined fields to avoid sending empty values
  const filteredLeadData = {
    contact: Object.fromEntries(
      Object.entries(leadData.contact).filter(([_, value]) => value !== undefined)
    ),
    interest: Object.fromEntries(
      Object.entries(leadData.interest || {}).filter(([_, value]) => value !== undefined)
    ),
    notes: leadData.notes
  };

  // Only include notes if it's defined
  if (!filteredLeadData.notes) {
    delete filteredLeadData.notes;
  }
  
  return this.makeRequest('/api', '/leads', {
    method: 'POST',
    body: JSON.stringify(filteredLeadData),
  }, true);
}

// Add to your ApiService class in api.ts
async getLeads(): Promise<ApiResponse<any>> {
  return this.makeRequest('/api', '/leads', {
    method: 'GET',
  }, true);
  }

  // Add these methods after getModuleDetails
  async startModule(moduleId: string): Promise<ApiResponse<ModuleStartResponse>> {
    console.log('Starting module:', moduleId);
    return this.makeRequest(API_PATHS.LMS, `/modules/${moduleId}/start`, {
      method: 'POST',
    }, true);
  }

async submitAnswer(moduleId: string, answer: string): Promise<ApiResponse<SubmitAnswerResponse>> {
  console.log('Submitting answer for module:', moduleId, 'Answer:', answer);
  
  // Special handling for chatbot_completed
  if (answer === 'chatbot_completed') {
    console.log('Submitting chatbot_completed - this will mark module as 100% done');
  }
  
  return this.makeRequest(API_PATHS.LMS, `/modules/${moduleId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  }, true);
}

  async submitChatbotResponse(conversationId: string, answer: string): Promise<ApiResponse<ChatbotResponse>> {
    console.log('Submitting chatbot response for conversation:', conversationId);
    return this.makeRequest(API_PATHS.LMS, `/chatbot/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }, true);
  }

  // NEW: Case Study Submission Method
  async submitCaseStudy(moduleId: string, selectedOption: string): Promise<ApiResponse<CaseStudySubmissionResponse>> {
    console.log('Submitting case study for module:', moduleId, 'with option:', selectedOption);
    return this.makeRequest(API_PATHS.LMS, `/module/${moduleId}/case-study`, {
      method: 'POST',
      body: JSON.stringify({ selected_option: selectedOption }),
    }, true);
  }

  // Alternative method if the endpoint structure is different
  async submitCaseStudyAlternative(moduleId: string, selectedOption: string): Promise<ApiResponse<CaseStudySubmissionResponse>> {
    console.log('Submitting case study (alternative endpoint) for module:', moduleId);
    return this.makeRequest(API_PATHS.LMS, `/modules/${moduleId}/case-study/submit`, {
      method: 'POST',
      body: JSON.stringify({ selected_option: selectedOption }),
    }, true);
}

async modifyLead(leadId: string, data: any): Promise<ApiResponse<any>> {
  return this.makeRequest('/api', `/leads/${leadId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }, true);
}



/**
 * Schedules bulk AI calls for multiple leads
 * @param callData - The bulk call request data
 * @returns A promise with the API response
 */
async scheduleBulkAICalls(callData: BulkCallRequest): Promise<ApiResponse<BulkCallResponse>> {
  try {
    console.log('Scheduling bulk AI calls with data:', JSON.stringify(callData, null, 2));
    
    // Make request with NO headers at all
    const response = await fetch('https://resolutions-consequently-covered-gathered.trycloudflare.com/bulk-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        
      },
      body: JSON.stringify(callData)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Bulk call API error:', data);
      return {
        success: false,
        error: data.message || 'Failed to schedule AI calls',
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error scheduling bulk AI calls:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Add this new interface after your other interfaces


// Add this new method to the ApiService class
async createVectorLead(mongoId: string): Promise<ApiResponse<VectorLeadCreateResponse>> {
  console.log('Creating vector lead for mongo ID:', mongoId);
  try {
    const response = await fetch('http://3.108.174.161:5000/vector-lead-create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mongo_id: mongoId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to create vector lead',
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating vector lead:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async getRecommendedLeads(gpId: string): Promise<ApiResponse<RecommendationResponse>> {
  console.log('Fetching recommended leads for GP ID:', gpId);
  try {
    const response = await fetch('http://3.108.174.161:5000/gp-profile-recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gp_id: gpId }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch recommended leads',
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching recommended leads:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async getQueryRecommendedLeads(query: string): Promise<ApiResponse<QueryRecommendationResponse>> {
  console.log('Fetching leads for query:', query);
  try {
    const response = await fetch('http://3.108.174.161:5000/query-recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch query-based leads',
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching query-based leads:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

async addCoins(amount: number): Promise<ApiResponse<AddCoinsResponse>> {
  console.log(`Adding ${amount} coins to user profile`);
  return this.makeRequest(API_PATHS.GP, '/coins/add', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }, true);
}

async useCoins(amount: number): Promise<ApiResponse<UseCoinsResponse>> {
  console.log(`Using ${amount} coins from user profile`);
  return this.makeRequest(API_PATHS.GP, '/coins/use', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }, true);
}

// Add this method to fetch bulk call requests
async getBulkCallRequests(): Promise<ApiResponse<BulkCallRequestsResponse>> {
  try {
    const response = await fetch('https://resolutions-consequently-covered-gathered.trycloudflare.com/bulk-call-requests', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to fetch call requests',
      };
    }
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error fetching bulk call requests:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}



// Add this method to the ApiService class
async getLeadById(leadId: string): Promise<ApiResponse<LeadDetailsResponse>> {
  console.log('Fetching lead details for ID:', leadId);
  return this.makeRequest('/api', `/leads/${leadId}`, {
    method: 'GET',
  }, true);
}


// Add this method to the ApiService class
async getConversations(): Promise<ApiResponse<ConversationsResponse>> {
  console.log('Fetching conversations...');
  try {
    
    
    // Make the request to the API endpoint
    const response = await fetch('https://resolutions-consequently-covered-gathered.trycloudflare.com/conversations', {
      method: 'GET',
      
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching conversations:', errorText);
      return {
        success: false,
        error: `HTTP Error: ${response.status} ${response.statusText}`
      };
    }
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Non-JSON response received:', contentType);
      const text = await response.text();
      console.error('Response text:', text.substring(0, 200) + '...');
      return {
        success: false,
        error: `Invalid response format (${contentType}). Expected JSON.`
      };
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log('Conversations fetched successfully:', JSON.stringify(data, null, 2).substring(0, 200) + '...');
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in getConversations:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

async getConversationAnalysis(analysisId: string): Promise<ApiResponse<ConversationAnalysisResult>> {
  console.log('Fetching conversation analysis for ID:', analysisId);
  try {
    const response = await fetch(`https://resolutions-consequently-covered-gathered.trycloudflare.com/conversation-analysis/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching conversation analysis:', errorText);
      return {
        success: false,
        error: `HTTP Error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in getConversationAnalysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}



async getCopilotAnalysisItems(): Promise<ApiResponse<CopilotAnalysisResponse>> {
  console.log('Fetching co-pilot analysis items...');
  try {
    const response = await fetch('http://52.66.90.177:5000/get-analysis-items', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching co-pilot analysis:', errorText);
      return {
        success: false,
        error: `HTTP Error: ${response.status} ${response.statusText}`
      };
    }
    
    const data = await response.json();
    console.log('Co-pilot analysis items fetched successfully:', data.count);
    
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in getCopilotAnalysisItems:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
}

export const apiService = new ApiService();

export const isStructuredContent = (content: any): content is StructuredContent => {
  return content && 
         typeof content === 'object' && 
         content.introduction && 
         content.keyConcepts && 
         content.practicalExamples && 
         content.risksAndProcess;
};

// Helper function to convert legacy content to structured format
export const convertToStructuredContent = (legacyContent: string, title: string): StructuredContent => {
  const sections = legacyContent.split('\n\n');
  
  return {
    introduction: {
      title: "Introduction & Overview",
      content: `# Introduction\n\n${title}\n\n${sections[0] || 'Welcome to this comprehensive learning module.'}`,
      icon: "book-open-page-variant",
      estimatedTime: 5
    },
    keyConcepts: {
      title: "Key Concepts",
      content: `## Core Concepts\n\n${sections[1] || 'Key learning concepts will be covered in this section.'}`,
      icon: "lightbulb-outline", 
      estimatedTime: 7
    },
    practicalExamples: {
      title: "Practical Examples",
      content: `## Real-World Applications\n\n${sections[2] || 'Practical examples and real-world scenarios.'}`,
      icon: "chart-line",
      estimatedTime: 5
    },
    risksAndProcess: {
      title: "Risks & Process", 
      content: `## Implementation Guide\n\n${sections[3] || 'Step-by-step process and risk considerations.'}`,
      icon: "shield-check",
      estimatedTime: 3
    }
  };
};