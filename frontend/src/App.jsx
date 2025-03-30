import { useState, useEffect } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import "highlight.js/styles/atom-one-dark.css";
import axios from "axios";

function App() {
  const [code, setCode] = useState(`def sum():  \n  return a + b \n`);
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState("python");
  const [theme, setTheme] = useState("dark");

  const languageOptions = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "typescript", label: "TypeScript" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
  ];

  useEffect(() => {
    prism.highlightAll();
  }, []);

  async function reviewCode() {
    setIsLoading(true);
    try {
      const response = await axios.post("https://ai-code-reviewer-r3pv.onrender.com/ai/get-review/", { 
        code,
        language
      });
      
      if (typeof response.data === 'object') {
        if (response.data.review) {
          setReview(response.data.review);
        } else if (response.data.message) {
          setReview(response.data.message);
        } else {
          setReview(JSON.stringify(response.data, null, 2));
        }
      } else {
        setReview(response.data);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      setReview("Error fetching review. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target.result);
        
        // Auto-detect language based on file extension
        const extension = file.name.split('.').pop().toLowerCase();
        const extensionMap = {
          'js': 'javascript',
          'py': 'python',
          'java': 'java',
          'cpp': 'cpp',
          'cs': 'csharp',
          'ts': 'typescript',
          'html': 'html',
          'css': 'css'
        };
        
        if (extensionMap[extension]) {
          setLanguage(extensionMap[extension]);
        }
      };
      reader.readAsText(file);
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Dynamically set classes based on theme
  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const containerBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const editorBg = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const buttonHoverBg = theme === 'dark' 
    ? 'hover:from-purple-500 hover:to-blue-600' 
    : 'hover:from-blue-600 hover:to-purple-700';

  return (
    <div className={`flex flex-col items-center min-h-screen ${bgColor} ${textColor} p-6 gap-6 transition-colors duration-300`}>
      {/* Header with Theme Toggle */}
      <header className="w-full flex justify-between items-center p-4 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="text-3xl font-bold text-white">AI Code Reviewer 🤖</div>
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full bg-opacity-20 bg-white hover:bg-opacity-30 transition-all"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        {/* Code Editor Side */}
        <div className={`w-full md:w-1/2 ${containerBg} p-6 rounded-lg shadow-lg border ${borderColor} overflow-auto transition-colors duration-300`}>
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
            {/* File Upload Button */}
            <label className="flex items-center gap-2 cursor-pointer bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Code
              <input
                type="file"
                accept=".js, .py, .css, .cpp, .cs, .ts, .html, .json, .java"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${borderColor} ${containerBg} ${textColor} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Code Editor */}
          <div className={`border ${borderColor} rounded-lg p-4 ${editorBg} transition-colors duration-300`}>
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) => prism.highlight(code, prism.languages[language] || prism.languages.javascript, language)}
              padding={10}
              style={{ 
                fontFamily: "'Fira Code', monospace", 
                fontSize: 16,
                minHeight: "300px"
              }}
              className="min-h-64"
            />
          </div>

          {/* Review Button */}
          <button
            onClick={reviewCode}
            disabled={isLoading}
            className={`w-full mt-4 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 ${buttonHoverBg} rounded-lg shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 cursor-pointer`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Code...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Review Code
              </div>
            )}
          </button>
        </div>

        {/* Review Display Side */}
        <div className={`w-full md:w-1/2 ${containerBg} p-6 rounded-lg shadow-lg border ${borderColor} overflow-auto transition-colors duration-300 min-h-64`}>
          <h2 className="text-xl font-bold mb-4 border-b pb-2 border-gray-600">Review Results</h2>
          <div className={`prose ${theme === 'dark' ? 'prose-invert' : ''} max-w-none`}>
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                <p>AI is analyzing your code...</p>
              </div>
            ) : review ? (
              <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <div className={`${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-200'} rounded-md overflow-hidden`}>
                        <pre className={className}>
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code className={`${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-800'} px-1 py-0.5 rounded`} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {review}
              </Markdown>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p>Click "Review Code" to get AI feedback on your code</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-6 w-full text-center text-gray-500 text-sm">
        <p>AI Code Reviewer • Made with ❤️ for developers</p>
      </footer>
    </div>
  );
}

export default App;