import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  ChevronRight,
  ChevronDown,
  Search,
  Home,
  ArrowLeft,
  Rocket,
  Layout,
  Briefcase,
  MessageSquare,
  HelpCircle,
  Users,
  Menu,
  Image,
  Settings,
  Monitor,
  Star,
  LayoutTemplate,
  Pencil,
  Layers,
  GripVertical,
  Folder,
  PlusCircle,
  List,
  Navigation,
  Upload,
  Sliders,
  RefreshCw,
  Info,
  UserPlus,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { 
  helpCategories, 
  searchHelpContent, 
  getTopicById, 
  getCategoryByTopicId,
  HelpTopic,
  HelpCategory,
  HelpSection
} from './helpContent';

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'rocket': Rocket,
  'layout': Layout,
  'briefcase': Briefcase,
  'message-square': MessageSquare,
  'help-circle': HelpCircle,
  'users': Users,
  'menu': Menu,
  'image': Image,
  'settings': Settings,
  'monitor': Monitor,
  'star': Star,
  'layout-template': LayoutTemplate,
  'layout-dashboard': Layout,
  'pencil': Pencil,
  'layers': Layers,
  'grip-vertical': GripVertical,
  'folder': Folder,
  'plus-circle': PlusCircle,
  'list': List,
  'navigation': Navigation,
  'upload': Upload,
  'sliders': Sliders,
  'refresh-cw': RefreshCw,
  'info': Info,
  'user-plus': UserPlus,
  'message-circle': MessageCircle,
  'home': Home,
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || HelpCircle;
};

// Render help section content
const RenderContent: React.FC<{ section: HelpSection }> = ({ section }) => {
  switch (section.type) {
    case 'heading':
      return (
        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3 first:mt-0">
          {section.content as string}
        </h3>
      );
    
    case 'paragraph':
      return (
        <p className="text-gray-600 mb-4 leading-relaxed">
          {section.content as string}
        </p>
      );
    
    case 'list':
      return (
        <ul className="space-y-2 mb-4">
          {(section.content as string[]).map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-600">
              <span className="mt-1" style={{ color: '#c9a962' }}>•</span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
    
    case 'steps':
      return (
        <ol className="space-y-3 mb-4">
          {(section.content as string[]).map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span 
                className="flex-shrink-0 w-6 h-6 text-white rounded-full flex items-center justify-center text-sm font-medium"
                style={{ backgroundColor: '#c9a962' }}
              >
                {index + 1}
              </span>
              <span className="text-gray-600 pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      );
    
    case 'tip':
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex gap-3">
          <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-blue-800 text-sm">{section.content as string}</p>
        </div>
      );
    
    case 'warning':
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">{section.content as string}</p>
        </div>
      );
    
    case 'table':
      const tableData = section.content as { header: string[]; rows: string[][] };
      return (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                {tableData.header.map((h, i) => (
                  <th key={i} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-gray-600 border-b">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    
    default:
      return null;
  }
};

// Topic content viewer
const TopicViewer: React.FC<{
  topic: HelpTopic;
  onBack: () => void;
  onNavigate: (topicId: string) => void;
  onClose: () => void;
}> = ({ topic, onBack, onNavigate, onClose }) => {
  const category = getCategoryByTopicId(topic.id);
  const Icon = getIcon(topic.icon);

  const handleGoToSection = () => {
    if (topic.link) {
      window.location.href = topic.link;
      onClose();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {category?.name || 'Help'}
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}>
            <span style={{ color: '#c9a962' }}><Icon className="w-5 h-5" /></span>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{topic.title}</h2>
            <p className="text-sm text-gray-500">{topic.shortDescription}</p>
          </div>
        </div>
        {/* Go to Section Button */}
        {topic.link && (
          <button
            onClick={handleGoToSection}
            className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all hover:shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #c9a962 0%, #d4b87a 100%)',
              boxShadow: '0 4px 12px rgba(201, 169, 98, 0.3)'
            }}
          >
            <ExternalLink className="w-4 h-4" />
            Go to {topic.title}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {topic.content.map((section, index) => (
          <RenderContent key={index} section={section} />
        ))}

        {/* Related Topics */}
        {topic.relatedTopics && topic.relatedTopics.length > 0 && (
          <div className="mt-8 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Related Topics</h4>
            <div className="space-y-2">
              {topic.relatedTopics.map(topicId => {
                const relatedTopic = getTopicById(topicId);
                if (!relatedTopic) return null;
                const RelatedIcon = getIcon(relatedTopic.icon);
                return (
                  <button
                    key={topicId}
                    onClick={() => onNavigate(topicId)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-left transition-colors"
                  >
                    <RelatedIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{relatedTopic.title}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Chatbot Component
const HelpChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['getting-started']);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [searchResults, setSearchResults] = useState<HelpTopic[]>([]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchHelpContent(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleTopicSelect = (topic: HelpTopic) => {
    setSelectedTopic(topic);
    setSearchQuery('');
  };

  const handleNavigate = (topicId: string) => {
    const topic = getTopicById(topicId);
    if (topic) {
      setSelectedTopic(topic);
    }
  };

  const handleBack = () => {
    setSelectedTopic(null);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ 
          background: 'linear-gradient(135deg, #c9a962 0%, #d4b87a 100%)',
          boxShadow: '0 10px 25px -5px rgba(201, 169, 98, 0.4)'
        }}
        aria-label="Open Help"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chatbot Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div 
            className="flex-shrink-0 text-white p-4"
            style={{ background: 'linear-gradient(135deg, #c9a962 0%, #d4b87a 50%, #c9a962 100%)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">CMS Help Center</h2>
                  <p className="text-white/80 text-sm">How can we help you?</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close Help"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:bg-white/30 transition-colors"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {selectedTopic ? (
              <TopicViewer
                topic={selectedTopic}
                onBack={handleBack}
                onNavigate={handleNavigate}
                onClose={() => setIsOpen(false)}
              />
            ) : searchQuery ? (
              // Search Results
              <div className="h-full overflow-y-auto p-4">
                <p className="text-sm text-gray-500 mb-3">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
                {searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No results found</p>
                    <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map(topic => {
                      const Icon = getIcon(topic.icon);
                      return (
                        <div key={topic.id} className="flex items-start gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                          <button
                            onClick={() => handleTopicSelect(topic)}
                            className="flex-1 flex items-start gap-3 text-left"
                          >
                            <span className="mt-0.5" style={{ color: '#c9a962' }}><Icon className="w-5 h-5" /></span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{topic.title}</p>
                              <p className="text-sm text-gray-500 truncate">{topic.shortDescription}</p>
                            </div>
                          </button>
                          {topic.link && (
                            <a
                              href={topic.link}
                              className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                              title={`Go to ${topic.title}`}
                            >
                              <span style={{ color: '#c9a962' }}><ExternalLink className="w-4 h-4" /></span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Category List
              <div className="h-full overflow-y-auto">
                {helpCategories.map(category => {
                  const CategoryIcon = getIcon(category.icon);
                  const isExpanded = expandedCategories.includes(category.id);

                  return (
                    <div key={category.id} className="border-b border-gray-100">
                      <div className="flex items-center gap-1 pr-2">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="flex-1 flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(201, 169, 98, 0.1)' }}>
                            <span style={{ color: '#c9a962' }}><CategoryIcon className="w-4 h-4" /></span>
                          </div>
                          <span className="flex-1 font-medium text-gray-900 text-left">
                            {category.name}
                          </span>
                          <span className="text-xs text-gray-400 mr-2">
                            {category.topics.length} topics
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {category.link && (
                          <a
                            href={category.link}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={`Go to ${category.name}`}
                          >
                            <span style={{ color: '#c9a962' }}><ExternalLink className="w-4 h-4" /></span>
                          </a>
                        )}
                      </div>

                      {/* Topics */}
                      {isExpanded && (
                        <div className="bg-gray-50 py-2">
                          {category.topics.map(topic => {
                            const TopicIcon = getIcon(topic.icon);
                            return (
                              <div
                                key={topic.id}
                                className="flex items-center gap-1 pr-2 hover:bg-gray-100 transition-colors"
                              >
                                <button
                                  onClick={() => handleTopicSelect(topic)}
                                  className="flex-1 flex items-center gap-3 px-4 py-2.5"
                                >
                                  <div className="w-6 h-6" />
                                  <TopicIcon className="w-4 h-4 text-gray-400" />
                                  <span className="flex-1 text-sm text-gray-700 text-left">
                                    {topic.title}
                                  </span>
                                </button>
                                {topic.link && (
                                  <a
                                    href={topic.link}
                                    className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                    title={`Go to ${topic.title}`}
                                  >
                                    <span style={{ color: '#c9a962' }}><ExternalLink className="w-3.5 h-3.5" /></span>
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>CMS v1.0</span>
              </div>
              <span>Need more help? Contact support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default HelpChatbot;
