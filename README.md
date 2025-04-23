# Time2Try

Time2Try is a web application that suggests personalized project ideas based on your skills and available time. It uses AI to generate unique project suggestions that match your expertise and time constraints.

## Features

- 🎯 Personalized project suggestions based on skills and time
- 🎨 Modern, responsive UI
- 💾 Save your favorite project ideas
- 📤 Export project ideas as PDF
- 🔄 Regenerate suggestions with different parameters

## Tech Stack

### Frontend
- Next.js
- JavaScript
- CSS Modules

### Backend
- Express.js
- OpenRouter API (AI suggestions)
- Firebase (authentication and data storage)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/time2try.git
cd time2try
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd time2try-backend
npm install
```

4. Create a `.env` file in the backend directory:
```env
PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key
FRONTEND_URL=http://localhost:3000
```

5. Start the backend server:
```bash
npm run dev
```

6. In a new terminal, start the frontend development server:
```bash
cd time2try
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend (.env)
```env
PORT=5000
OPENROUTER_API_KEY=your_openrouter_api_key
FRONTEND_URL=http://localhost:3000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenRouter API for AI-powered suggestions
- Next.js team for the amazing framework
- All contributors who help improve this project
