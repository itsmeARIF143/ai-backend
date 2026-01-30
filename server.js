// Backend Server for Portfolio API
// Author: Md Ariful Islam
// Version: 3.0

const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '3.0'
    });
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address' });
        }
        
        // Simulate email sending
        console.log('Contact form submission:', { name, email, subject, message });
        
        // In production, you would:
        // 1. Save to database
        // 2. Send email notification
        // 3. Trigger workflow
        
        res.json({
            success: true,
            message: 'Thank you for your message! I will get back to you soon.',
            data: {
                name,
                email,
                subject,
                message,
                receivedAt: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Mock AI response (replace with actual OpenAI API)
        const response = generateMockAIResponse(message);
        
        // Simulate AI processing delay
        setTimeout(() => {
            res.json({
                success: true,
                response,
                conversationId: conversationId || Date.now().toString(),
                timestamp: new Date().toISOString()
            });
        }, 800 + Math.random() * 400);
        
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: 'AI service unavailable' });
    }
});

app.post('/api/projects/recommend', (req, res) => {
    const { interests, skillLevel } = req.body;
    
    const projects = [
        {
            id: 1,
            title: "NeuralScript Pro",
            description: "AI-powered scriptwriting assistant",
            category: "ai",
            matchScore: 95,
            skills: ["Python", "TensorFlow", "NLP"],
            estimatedTime: "3-4 months",
            complexity: "Advanced"
        },
        {
            id: 2,
            title: "Quantum Architecture",
            description: "3D visualization of futuristic designs",
            category: "design",
            matchScore: 88,
            skills: ["Blender", "Three.js", "WebGL"],
            estimatedTime: "2-3 months",
            complexity: "Intermediate"
        },
        {
            id: 3,
            title: "Content AI Platform",
            description: "AI-assisted content creation system",
            category: "content",
            matchScore: 92,
            skills: ["React", "Node.js", "OpenAI API"],
            estimatedTime: "3-4 months",
            complexity: "Intermediate"
        },
        {
            id: 4,
            title: "DataFlow AI",
            description: "Intelligent data processing platform",
            category: "data",
            matchScore: 90,
            skills: ["Python", "Pandas", "FastAPI"],
            estimatedTime: "2-3 months",
            complexity: "Advanced"
        }
    ];
    
    // Filter based on interests
    let recommendations = projects;
    if (interests && interests.length > 0) {
        recommendations = projects.filter(p => 
            interests.includes(p.category) || 
            p.skills.some(skill => interests.includes(skill.toLowerCase()))
        );
    }
    
    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({
        success: true,
        recommendations,
        totalMatches: recommendations.length,
        interests,
        skillLevel: skillLevel || 'intermediate'
    });
});

// AI Microservice Proxy
app.post('/api/ai/process', (req, res) => {
    const { data, action } = req.body;
    
    // Call Python AI service
    const pythonProcess = spawn('python', [
        path.join(__dirname, 'ai-service.py'),
        action,
        JSON.stringify(data)
    ]);
    
    let result = '';
    let error = '';
    
    pythonProcess.stdout.on('data', (data) => {
        result += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
        if (code === 0) {
            try {
                const parsedResult = JSON.parse(result);
                res.json({
                    success: true,
                    result: parsedResult
                });
            } catch (e) {
                res.json({
                    success: true,
                    result: result
                });
            }
        } else {
            res.status(500).json({
                success: false,
                error: error || 'AI processing failed'
            });
        }
    });
});

// Analytics Endpoint
app.get('/api/analytics', (req, res) => {
    const mockAnalytics = {
        totalVisitors: 1520,
        uniqueVisitors: 1124,
        avgSessionTime: '4:15',
        pageViews: 4580,
        bounceRate: '32%',
        popularSections: [
            { section: 'Projects', views: 1250 },
            { section: 'Services', views: 980 },
            { section: 'AI Assistant', views: 850 },
            { section: 'Skills', views: 720 }
        ],
        aiInteractions: 425,
        formSubmissions: 89,
        performanceScore: 96
    };
    
    res.json({
        success: true,
        analytics: mockAnalytics,
        period: 'last-30-days'
    });
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Helper functions
function generateMockAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    const responses = {
        'services': "I offer four main services: AI Solutions, 3D Design, Content Creation, and Data Solutions. Each service combines technical expertise with creative vision to deliver exceptional results.",
        'projects': "My portfolio includes projects like NeuralScript AI, Quantum Visualization, Content AI Platform, and DataFlow AI. Each project showcases different aspects of my skills in AI, design, and development.",
        'skills': "My technical proficiency includes AI & Machine Learning (94%), 3D Design (88%), Content Strategy (96%), Data Analysis (91%), Web Development (86%), and Graphic Design (89%).",
        'experience': "With over 7 years in the industry, I've served as Lead AI Solutions Architect, 3D Design Director, and Content Strategy Lead, working on diverse projects across multiple domains.",
        'contact': "You can reach me at contact@itsmearif.info or +880 1234 567890. I'm based in Dhaka, Bangladesh and available for freelance projects and collaborations.",
        'default': "I understand you're asking about my work. I specialize in creating AI-powered solutions combined with compelling design and content. How can I assist you further?"
    };
    
    if (lowerMessage.includes('service') || lowerMessage.includes('what do you do')) {
        return responses.services;
    } else if (lowerMessage.includes('project') || lowerMessage.includes('work')) {
        return responses.projects;
    } else if (lowerMessage.includes('skill') || lowerMessage.includes('expert')) {
        return responses.skills;
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
        return responses.contact;
    } else if (lowerMessage.includes('experience') || lowerMessage.includes('background')) {
        return responses.experience;
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm your AI assistant. I can help you learn more about Md Ariful Islam's work, projects, and services.";
    } else {
        return responses.default;
    }
}

// WebSocket Server for real-time updates
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (message) => {
        console.log('Received:', message);
        
        // Echo back for now
        ws.send(JSON.stringify({
            type: 'echo',
            data: message.toString(),
            timestamp: new Date().toISOString()
        }));
    });
    
    // Send periodic updates
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                type: 'update',
                data: {
                    visitors: Math.floor(Math.random() * 100) + 50,
                    aiRequests: Math.floor(Math.random() * 20) + 5,
                    systemStatus: 'operational'
                },
                timestamp: new Date().toISOString()
            }));
        }
    }, 5000);
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clearInterval(interval);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket server on port 8080`);
    console.log(`Frontend available at http://localhost:${PORT}`);
});

// Export for testing
module.exports = app;