# AI Chatbot Setup Guide

## Overview

This guide explains how to set up the AI chatbot integration using Google's Gemini API for the Indore Illegal Construction & Encroachment Reporting System.

## Backend Setup

### 1. Install Dependencies

The Gemini API package has been added to the backend. Make sure to run:

```bash
cd backend
npm install
```

### 2. Environment Configuration

Add the following to your `backend/.env` file:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Add it to your `.env` file

### 4. API Endpoint

The chatbot API is available at:

- **POST** `/api/chat`
- **Request Body**: `{ "message": "user message here" }`
- **Response**: `{ "success": true, "message": "AI response", "timestamp": "..." }`

## Frontend Setup

### 1. Components Added

- `Chatbot.jsx` - Main chatbot component with floating UI
- `chatService.js` - Service layer for API communication

### 2. Integration

The chatbot is automatically integrated into the Citizen Dashboard via `CitizenLayout.jsx`.

### 3. Features

- ✅ Floating chat button (bottom-left)
- ✅ Expandable chat window
- ✅ Real-time typing indicators
- ✅ Message history (local state)
- ✅ Error handling
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Keyboard shortcuts (Enter to send)

## Usage

### For Users

1. Navigate to the Citizen Dashboard
2. Click the chat icon in the bottom-left corner
3. Type your question about illegal construction, encroachment, or the reporting system
4. The AI will respond with relevant information

### For Developers

The chatbot is designed to:

- Answer questions about illegal construction and encroachment
- Explain the reporting system
- Provide information about land parcels and boundaries
- Help with dashboard navigation
- Refuse off-topic questions politely

## System Prompt

The AI is configured with a specific system prompt that:

- Limits responses to Indore construction/encroachment topics
- Provides helpful information about the system
- Politely refuses unrelated questions
- Maintains professional tone

## Error Handling

The system handles various error scenarios:

- API key missing
- Rate limiting
- Network errors
- Timeout errors
- General API failures

## Customization

You can modify the system prompt in `backend/src/routes/chat.js` to adjust the AI's behavior and knowledge base.

## Testing

1. Start the backend server: `npm run dev`
2. Start the frontend: `cd client1 && npm run dev`
3. Navigate to the Citizen Dashboard
4. Test the chatbot with various questions

## Troubleshooting

- **"AI service is not configured"**: Check your GEMINI_API_KEY in .env
- **"AI is unavailable"**: Check network connection and API key validity
- **Rate limiting**: Wait a few minutes and try again
- **Timeout errors**: Check your internet connection
- **"Please use a valid role"**: This was a Gemini API format issue that has been resolved
- **"models/gemini-pro is not found"**: This was a model compatibility issue that has been resolved by using `gemini-1.5-flash`

## ✅ Status: FULLY WORKING!

The chatbot integration is now working perfectly! All issues have been resolved:

1. ✅ **Gemini API format issue** - Fixed by using proper content generation method
2. ✅ **Model compatibility issue** - Fixed by using `gemini-1.5-flash` model
3. ✅ **Error handling** - Comprehensive error handling implemented
4. ✅ **API testing** - All tests passing successfully

The chatbot is ready for production use!

## Security Notes

- The API key is stored server-side only
- No sensitive data is sent to the AI
- All responses are filtered through the system prompt
- User messages are not stored permanently
