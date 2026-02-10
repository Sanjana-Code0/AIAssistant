
export enum AccessibilityMode {
  NORMAL = 'NORMAL',
  HIGH_CONTRAST = 'HIGH_CONTRAST',
  DARK_MODE = 'DARK_MODE',
  GRAYSCALE = 'GRAYSCALE',
  PROTANOPIA = 'PROTANOPIA',
  DEUTERANOPIA = 'DEUTERANOPIA',
  TRITANOPIA = 'TRITANOPIA'
}

export interface NavStep {
  selector: string;
  instruction: string;
  action: 'click' | 'hover' | 'type';
  targetPage: string; 
  contextHint?: string; // e.g., "in the top navigation bar", "at the bottom of the form"
  elementDescription?: string; // Physical description of the element for better matching
  expectedOutcome?: string;
  confidenceScore: number;
}

export interface SummaryResult {
  title: string;
  content: string;
  keyTakeaways: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export enum ToolTab {
  CHAT = 'CHAT',
  SUMMARIZE = 'SUMMARIZE',
  ACCESSIBILITY = 'ACCESSIBILITY',
  NAVIGATE = 'NAVIGATE'
}
