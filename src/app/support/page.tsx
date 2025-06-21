"use client";

import React, { useState } from 'react';
import { ProfileSidebar } from '@/components/ui/profile-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/useUser';
import { 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  MessageCircle, 
  HelpCircle, 
  Search,
  Send,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'billing' | 'technical' | 'teams' | 'api';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'general',
    question: 'What is this AI coding platform?',
    answer: 'Our platform is an AI-powered development environment that helps you create websites, applications, and code using advanced AI models like GPT-4 and Claude. You can generate, edit, and deploy projects through natural language conversations.'
  },
  {
    id: '2',
    category: 'general',
    question: 'How do I get started?',
    answer: 'Simply connect your Solana wallet, and you&apos;ll receive 5 free credits to start. You can then create a new project by describing what you want to build, and our AI will generate the code for you.'
  },
  {
    id: '3',
    category: 'billing',
    question: 'How do credits work?',
    answer: 'Credits are used to access AI models. Different models cost different amounts: GPT-4o costs 1 credit, Claude 3.5 Sonnet costs 2 credits, and Claude 3 Opus costs 3 credits. You can purchase more credits or upgrade to a Pro plan for more credits.'
  },
  {
    id: '4',
    category: 'billing',
    question: 'What are the pricing plans?',
    answer: 'We offer three plans: Free (5 credits), Pro (100 credits + advanced features), and Premium (unlimited credits). You can also earn credits through our referral program - get 10 credits for each friend you refer!'
  },
  {
    id: '5',
    category: 'technical',
    question: 'What programming languages are supported?',
    answer: 'Our AI can generate code in JavaScript, TypeScript, Python, HTML, CSS, React, Next.js, and many other languages and frameworks. Just describe what you want to build, and the AI will choose the appropriate technologies.'
  },
  {
    id: '6',
    category: 'technical',
    question: 'Can I edit the generated code?',
    answer: 'Yes! You can edit any generated code directly in our built-in code editor. The platform also supports real-time preview of your changes, so you can see how your modifications affect the final result.'
  },
  {
    id: '7',
    category: 'technical',
    question: 'How do I deploy my projects?',
    answer: 'You can deploy your projects to various platforms directly from the interface. We support deployment to Vercel, Netlify, and other popular hosting services. Just click the deploy button and follow the instructions.'
  },
  {
    id: '8',
    category: 'teams',
    question: 'How do teams work?',
    answer: 'Teams allow multiple users to collaborate on AI projects with shared credits. You can create a team, invite members via email or shareable links, and work together on projects. Team plans include Free (3 members), Pro (10 members), and Enterprise (50 members).'
  },
  {
    id: '9',
    category: 'teams',
    question: 'How do I invite team members?',
    answer: 'Go to Settings > Team > Create a team, then follow the wizard to set up your team and invite members. You can invite people via email addresses or by sharing an invite link.'
  },
  {
    id: '10',
    category: 'api',
    question: 'Do I need my own API keys?',
    answer: 'No, you don&apos;t need your own API keys to get started. We provide access to AI models through our credit system. However, if you have your own OpenAI or Anthropic API keys, you can add them in Settings > Tokens for direct access.'
  },
  {
    id: '11',
    category: 'general',
    question: 'How do I earn free credits?',
    answer: 'You can earn free credits through our referral program. Share your referral link with friends - when they sign up, both of you get 10 credits. If they upgrade to Pro within 30 days, you both get an additional 50 credits!'
  },
  {
    id: '12',
    category: 'technical',
    question: 'What if the AI makes a mistake in the code?',
    answer: 'You can simply ask the AI to fix or modify the code by describing what&apos;s wrong or what you want changed. The AI will update the code accordingly. You can also edit the code manually in the editor.'
  },
  {
    id: '13',
    category: 'billing',
    question: 'How do I know my payments are secure?',
    answer: 'We don&apos;t store your payment information on our servers. All payments are processed securely through our payment partners.'
  },
  {
    id: '14',
    category: 'billing',
    question: 'What if I&apos;m experiencing issues with my payment?',
    answer: 'If you&apos;re experiencing issues, try refreshing the page, clearing your browser cache, or contacting our support team. We&apos;re here to help!'
  }
];

const categories = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'general', label: 'General', icon: MessageCircle },
  { id: 'billing', label: 'Billing & Credits', icon: MessageCircle },
  { id: 'technical', label: 'Technical', icon: MessageCircle },
  { id: 'teams', label: 'Teams', icon: MessageCircle },
  { id: 'api', label: 'API & Integration', icon: MessageCircle }
];

export default function SupportPage() {
  const { user } = useUser();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create email content
      const emailContent = `
Name: ${contactForm.name}
Email: ${contactForm.email}
User Wallet: ${user?.walletAddress || 'Not connected'}
Subject: ${contactForm.subject}

Message:
${contactForm.message}

---
Sent from AI Coding Platform Support
Time: ${new Date().toLocaleString()}
      `.trim();

      // In a real application, you would send this to your backend
      // For now, we'll simulate the email sending
      console.log('Email to jinwoo5385@naver.com:', emailContent);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowContactForm(false);
      }, 3000);

    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ProfileSidebar />
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="border-b border-gray-700 bg-gray-800">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-white mb-4">Help Center</h1>
            <p className="text-xl text-gray-400 mb-6">
              Find answers to common questions or contact our support team
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 text-lg bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                <nav className="space-y-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{category.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Contact Support */}
                <div className="mt-8 pt-6 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-white mb-3">Need more help?</h4>
                  <Button
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              {showContactForm ? (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Contact Support</h2>
                    <Button
                      variant="ghost"
                      onClick={() => setShowContactForm(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>

                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
                      <p className="text-gray-400">
                        We've received your message and will get back to you soon at {contactForm.email}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Name</label>
                          <Input
                            required
                            value={contactForm.name}
                            onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Your name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Email</label>
                          <Input
                            type="email"
                            required
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="your@email.com"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Subject</label>
                        <Input
                          required
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="What can we help you with?"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Message</label>
                        <Textarea
                          required
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="bg-gray-700 border-gray-600 text-white resize-none"
                          rows={6}
                          placeholder="Please describe your issue or question in detail..."
                        />
                      </div>

                      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                        <p className="text-sm text-blue-300">
                          <strong>Note:</strong> Your message will be sent to our support team at jinwoo5385@naver.com. 
                          We typically respond within 24 hours.
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowContactForm(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmitting ? (
                            'Sending...'
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      {activeCategory === 'all' ? 'Frequently Asked Questions' : 
                       categories.find(c => c.id === activeCategory)?.label + ' Questions'}
                    </h2>
                    <span className="text-sm text-gray-400">
                      {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {filteredFAQs.length === 0 ? (
                    <div className="text-center py-12">
                      <HelpCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No questions found</h3>
                      <p className="text-gray-400 mb-4">
                        Try adjusting your search or category filter
                      </p>
                      <Button
                        onClick={() => setShowContactForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Contact Support
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFAQs.map((faq) => (
                        <div key={faq.id} className="bg-gray-800 rounded-lg">
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-750 transition-colors"
                          >
                            <h3 className="text-lg font-medium text-white pr-4">
                              {faq.question}
                            </h3>
                            {expandedFAQ === faq.id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          
                          {expandedFAQ === faq.id && (
                            <div className="px-6 pb-6">
                              <div className="border-t border-gray-700 pt-4">
                                <p className="text-gray-300 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Still need help section */}
                  <div className="mt-12 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg p-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Still need help?</h3>
                    <p className="text-gray-300 mb-6">
                      Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <Button
                      onClick={() => setShowContactForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Support Team
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 