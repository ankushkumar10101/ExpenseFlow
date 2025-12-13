import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, Button, Form, Spinner, InputGroup, Badge } from 'react-bootstrap';
import { MdSend, MdSmartToy, MdDeleteOutline, MdLightbulbOutline, MdMenu } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function AIChat() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // Chat State
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm your financial assistant. Ask me anything about your spending, or request a budget plan!" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    "Did I spend more this week or last week?",
    "Summarize today's spending.",
    "Create a budget for March."
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await api.get("/dashboard", { withCredentials: true });
        if (userRes.data.user) {
          setCurrentUserId(userRes.data.user._id);
          const expenseRes = await api.get(`/dashboard/expense/${userRes.data.user._id}`, { withCredentials: true });
          setTransactions(expenseRes.data.allExpense);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Load chat history when User ID is available
  useEffect(() => {
    if (currentUserId) {
      const saved = localStorage.getItem(`chat_history_${currentUserId}`);
      if (saved) {
        try {
          setMessages(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse chat history", e);
        }
      }
    }
  }, [currentUserId]);

  // Save chat history when messages change, but only if we have a user ID
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(`chat_history_${currentUserId}`, JSON.stringify(messages));
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUserId]);

  const handleSendMessage = async (e, textOverride) => {
    if (e) e.preventDefault();
    const textToSend = textOverride || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMsg.text,
        history: transactions
      }, { withCredentials: true });

      setMessages(prev => [...prev, { sender: 'ai', text: response.data.reply }]);
    } catch (err) {
      console.error("Chat Error:", err);
      const errorMessage = err.response?.data?.error || "Sorry, I encountered an error processing your request.";
      setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
    } finally {
      setChatLoading(false);
    }
  };

  const clearChat = () => {
    const initialMsg = [{ sender: 'ai', text: "Chat cleared. How can I help you now?" }];
    setMessages(initialMsg);
    if (currentUserId) {
      localStorage.removeItem(`chat_history_${currentUserId}`);
    }
  };

  return (
    <div className="d-flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-grow-1 main-content main-content-shifted bg-light" style={{ height: '100vh', overflow: 'hidden' }}>
        <Container fluid className="p-2 p-md-4 h-100 d-flex flex-column">
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-3 pt-3 flex-shrink-0">
             <div className="d-flex align-items-center gap-3">
                <Button 
                  variant="link" 
                  className="d-md-none p-0 text-dark" 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <MdMenu size={28} />
                </Button>
                <div>
                   <h2 className="fw-bold mb-1 text-purple">AI Financial Assistant</h2>
                   <p className="text-muted mb-0">Ask me anything about your finances</p>
                </div>
             </div>
             <Button variant="outline-danger" size="sm" onClick={clearChat} title="Clear Chat History">
                <MdDeleteOutline size={20} /> <span className="d-none d-md-inline">Clear Chat</span>
             </Button>
          </div>

          {/* Chat Interface */}
          <Card className="card-custom border-0 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden">
            <Card.Body className="flex-grow-1 overflow-auto p-2 p-md-4">
                <div className="d-flex flex-column gap-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                            <div className={`d-flex flex-column ${msg.sender === 'user' ? 'align-items-end' : 'align-items-start'}`} style={{ maxWidth: '85%' }}>
                                <div 
                                    className={`p-3 rounded-4 ${msg.sender === 'user' ? 'bg-purple text-white' : 'bg-light text-dark'}`}
                                    style={{ 
                                        borderBottomRightRadius: msg.sender === 'user' ? '4px' : '20px', 
                                        borderBottomLeftRadius: msg.sender === 'ai' ? '4px' : '20px',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                        wordBreak: 'break-word', 
                                        overflowWrap: 'break-word',
                                        whiteSpace: 'pre-wrap'
                                    }}
                                >
                                    {msg.sender === 'ai' ? (
                                        <div className="markdown-content">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        msg.text
                                    )}
                                </div>
                                <small className="text-muted mt-1 mx-2" style={{ fontSize: '0.75rem' }}>
                                    {msg.sender === 'ai' ? 'AI Assistant' : 'You'}
                                </small>
                            </div>
                        </div>
                    ))}
                    {chatLoading && (
                        <div className="d-flex justify-content-start">
                            <div className="bg-light p-3 rounded-4">
                                <Spinner size="sm" animation="dots" variant="secondary" /> Typing...
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </Card.Body>

            <Card.Footer className="bg-white border-top-0 p-4 pt-2">
                {/* Suggested Questions */}
                <div className="d-flex gap-2 mb-3 flex-wrap"> 
                    {suggestedQuestions.map((q, idx) => (
                        <Badge 
                            key={idx} 
                            bg="light" 
                            text="dark" 
                            className="p-2 px-3 border cursor-pointer hover-shadow" 
                            style={{ cursor: 'pointer', fontWeight: '500' }}
                            onClick={() => handleSendMessage(null, q)}
                        >
                            <MdLightbulbOutline className="me-1 text-warning" /> {q}
                        </Badge>
                    ))}
                </div>

                <Form onSubmit={(e) => handleSendMessage(e)}>
                    <InputGroup className="shadow-sm rounded-pill overflow-hidden">
                        <Form.Control
                            placeholder="Ask about your spending..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            className="border-0 py-3 px-4 bg-light"
                            disabled={chatLoading}
                            style={{ fontSize: '1rem' }}
                        />
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="bg-purple border-0 px-4"
                            disabled={!inputMessage.trim() || chatLoading}
                        >
                            <MdSend size={24} />
                        </Button>
                    </InputGroup>
                </Form>
            </Card.Footer>
          </Card>
        </Container>
      </div>
    </div>
  );
}
