// app/services/dummyData.ts

export interface CaseScenario {
  context: string;
  question: string;
  options: string[];
  correct_option: string;
  rationale: string;
}

export interface ModuleData {
  _id: string;
  module_id: string;
  title: string;
  category: string;
  estimated_time_min: number;
  generated_summary: string;
  content: string;
  video_url?: string;
  external_resources: string[];
  case_scenario?: CaseScenario;
}

export interface Progress {
  _id: string;
  learner_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  completed_sections: string[];
  feedback?: string;
  score?: number;
}

export const dummyModuleData: ModuleData = {
  _id: "6836f65dfba9789582708b66",
  module_id: "04604e77-67c6-4d3a-9805-6edd5966dcb3",
  title: "भारतीय आणि अमेरिकन बाजारपेठा: गुंतवणुकीचे प्रवेशद्वार",
  category: "hard",
  estimated_time_min: 20,
  generated_summary: "या मॉड्यूलमध्ये, आपण भारतीय आणि अमेरिकन बाजारपेठांची मूलभूत तत्त्वे शिकणार आहोत.",
  content: `(१) **मूलभूत संकल्पना:** भारतीय बाजारपेठ (BSE, NSE) आणि अमेरिकन बाजारपेठ (NYSE, NASDAQ) या दोन्ही जगातील प्रमुख बाजारपेठा आहेत. BSE (Bombay Stock Exchange) भारतातील सर्वात जुना स्टॉक एक्सचेंज आहे, तर NSE (National Stock Exchange) हे भारतातील सर्वात मोठे स्टॉक एक्सचेंज आहे.

(२) **भारतीय संदर्भात व्यावहारिक उपयोग:** ग्रोमो पार्टनर्स म्हणून, आपल्याला भारतीय बाजारपेठेची चांगली माहिती असणे आवश्यक आहे. उदाहरणार्थ, जर एखादा क्लायंट ₹5,00,000 ची गुंतवणूक करू इच्छित असेल, तर आपण त्याला विविध पर्याय देऊ शकतो.

(३) **गैरसमज आणि चुका:** अनेकजण 'स्वस्त' शेअर्स चांगले असतात असा विचार करतात. परंतु, किंमत कमी असणे म्हणजे कंपनी चांगली आहे असे नाही.

(४) **प्रगत विचार आणि धोरणात्मक दृष्टी:** दीर्घकालीन गुंतवणुकीसाठी SIP (Systematic Investment Plan) हा एक चांगला पर्याय आहे.`,
  video_url: "https://www.youtube.com/watch?v=c19447aa-60",
  external_resources: [
    "https://www.sebi.gov.in",
    "https://www.rbi.org.in",
    "https://www.amfiindia.com"
  ],
  case_scenario: {
    context: "मुंबईमधील (Mumbai) सौ. शर्वाणी देसाई (वय: ५२ वर्षे) एक शिक्षिका आहेत. त्यांची मासिक कमाई ₹६०,००० आहे. त्यांनी त्यांच्या निवृत्तीसाठी (retirement) योजना बनवण्याचा निर्णय घेतला आहे.",
    question: "सौ. देसाई यांच्यासाठी सर्वोत्तम गुंतवणूक पर्याय कोणता असेल, ज्यामुळे त्यांना सुरक्षितता आणि चांगला परतावा (return) मिळेल?",
    options: [
      "पर्याय १: संपूर्ण रक्कम स्मॉल-कॅप शेअर्समध्ये (small-cap shares) गुंतवणे",
      "पर्याय २: संपूर्ण रक्कम सरकारी बाँड्समध्ये (government bonds) गुंतवणे",
      "पर्याय ३: ₹४,००,००० म्युच्युअल फंड्समध्ये (mutual funds) आणि ₹४,००,००० सरकारी बाँड्समध्ये गुंतवणे",
      "पर्याय ४: अमेरिकन बाजारात (American market) थेट गुंतवणूक करणे"
    ],
    correct_option: "पर्याय ३: ₹४,००,००० म्युच्युअल फंड्समध्ये आणि ₹४,००,००० सरकारी बाँड्समध्ये गुंतवणे",
    rationale: "सौ. देसाई यांची जोखीम घेण्याची क्षमता मध्यम आहे. त्यामुळे, संपूर्ण रक्कम एकाच ठिकाणी गुंतवणे योग्य नाही."
  }
};

export const dummyProgress: Progress = {
  _id: "6836f65dfba9789582708b68",
  learner_id: "fb5ac3e6-213a-41ef-aff7-3cc8cd7d14be",
  module_id: "04604e77-67c6-4d3a-9805-6edd5966dcb3",
  status: "in_progress",
  progress_percentage: 50,
  completed_sections: ["content_viewed"],
  feedback: "तुमचं उत्तर बरोबर नाही. कृपया एकदा मॉड्यूल पुन्हा तपासा.",
  score: 0
};

export const aiAssessmentQuestions = [
  {
    id: 1,
    question: "Tell me about your experience with the project. What were the main challenges you faced?",
    type: "open_ended"
  },
  {
    id: 2,
    question: "How would you apply the concepts learned in this module to a real-world scenario?",
    type: "open_ended"
  },
  {
    id: 3,
    question: "What aspect of investment planning do you find most challenging?",
    type: "open_ended"
  },
  {
    id: 4,
    question: "Rate your confidence level in explaining these concepts to a client.",
    type: "rating"
  },
  {
    id: 5,
    question: "Any additional questions or topics you'd like to explore further?",
    type: "open_ended"
  }
];