'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:50001';
const INITIAL_PROJECTS_PER_PAGE = 6;
const INITIAL_TOTAL_PROJECTS = 30;
const ADDITIONAL_PROJECTS = 5;
const MAX_PROJECTS_PER_PAGE = 50;

export default function Suggestions() {
  const router = useRouter();
  const [allIdeas, setAllIdeas] = useState([]);
  const [displayedIdeas, setDisplayedIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(3);
  const [totalProjects, setTotalProjects] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const storedSavedProjects = localStorage.getItem('savedProjects');
    
    if (storedSavedProjects) {
      setSavedProjects(JSON.parse(storedSavedProjects));
    }
    
    handleRegenerate(); // Always generate fresh ideas on page load
    setLoading(false);
  }, []);

  const updateDisplayedIdeas = (ideas, page) => {
    const startIndex = (page - 1) * INITIAL_PROJECTS_PER_PAGE;
    const endIndex = startIndex + INITIAL_PROJECTS_PER_PAGE;
    const pageIdeas = ideas.slice(startIndex, endIndex);
    setDisplayedIdeas(pageIdeas);
    setCurrentPage(page);
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
      // Remove toast from DOM after animation
      setTimeout(() => setToast({ show: false, message: '' }), 300);
    }, 3000);
  };

  const handleSave = (idea) => {
    const updatedSavedProjects = [...savedProjects, idea];
    setSavedProjects(updatedSavedProjects);
    localStorage.setItem('savedProjects', JSON.stringify(updatedSavedProjects));
    showToast('Project saved successfully! 🎉');
  };

  const handleExport = (idea) => {
    // Create a markdown file with project details
    const markdown = `# ${idea.title}

## Description
${idea.description}

## Tech Stack
${idea.stack.join(', ')}



## Getting Started
1. Clone the repository
2. Install dependencies
3. Start the development server

## Next Steps
- [ ] Set up the project structure
- [ ] Implement core features
- [ ] Add styling and UI components
- [ ] Test and deploy
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${idea.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const storedData = localStorage.getItem('projectData');
      if (!storedData) {
        router.push('/select');
        return;
      }

      const { skills, time } = JSON.parse(storedData);
      
      // Convert time range to a number (average of the range)
      let timeValue;
      if (time === '1-2') timeValue = 1.5;
      else if (time === '3-5') timeValue = 4;
      else if (time === '6-10') timeValue = 8;
      else if (time === '11-15') timeValue = 13;
      else {
        throw new Error('Invalid time value');
      }
      
      const projectsToGenerate = isInitialLoad ? INITIAL_TOTAL_PROJECTS : ADDITIONAL_PROJECTS;
      
      const response = await fetch(`${API_URL}/api/generate-ideas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skills,
          time: timeValue,
          page: 1,
          projectsPerPage: projectsToGenerate
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate ideas');
      }

      const data = await response.json();
      
      if (!data.projects || data.projects.length === 0) {
        throw new Error('No ideas were generated');
      }
      
      if (isInitialLoad) {
        setAllIdeas(data.projects);
        setTotalPages(Math.ceil(data.projects.length / INITIAL_PROJECTS_PER_PAGE));
        setTotalProjects(data.projects.length);
        updateDisplayedIdeas(data.projects, 1);
        setIsInitialLoad(false);
      } else {
        const newIdeas = [...allIdeas, ...data.projects];
        const newTotalProjects = newIdeas.length;
        const newTotalPages = Math.ceil(newTotalProjects / INITIAL_PROJECTS_PER_PAGE);
        
        setAllIdeas(newIdeas);
        setTotalPages(newTotalPages);
        setTotalProjects(newTotalProjects);
        updateDisplayedIdeas(newIdeas, currentPage);
      }

      localStorage.setItem('projectIdeas', JSON.stringify({
        projects: isInitialLoad ? data.projects : [...allIdeas, ...data.projects],
        totalPages: isInitialLoad ? Math.ceil(data.projects.length / INITIAL_PROJECTS_PER_PAGE) : Math.ceil((allIdeas.length + data.projects.length) / INITIAL_PROJECTS_PER_PAGE),
        totalProjects: isInitialLoad ? data.projects.length : allIdeas.length + data.projects.length
      }));

      showToast(isInitialLoad ? 'Initial ideas generated successfully! 🎉' : 'More ideas generated successfully! 🎉');
    } catch (error) {
      console.error('Error generating ideas:', error);
      showToast(error.message || 'Failed to generate ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    updateDisplayedIdeas(allIdeas, newPage);
  };

  const filteredIdeas = displayedIdeas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.stack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>Loading ideas...</div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your Project Ideas</h1>
          <div className={styles.controls}>
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button 
              onClick={() => router.push('/saved')}
              className={styles.savedButton}
            >
              <span className={styles.savedIcon}>📚</span>
              Saved Ideas
            </button>
          </div>
        </div>
        
        <div className={styles.ideasGrid}>
          {filteredIdeas.map((idea, index) => (
            <div key={`${idea.title}-${index}`} className={styles.ideaCard}>
              <div className={styles.ideaHeader}>
                <h2 className={styles.ideaTitle}>{idea.title}</h2>
                <span className={styles.category}>
                  {idea.type.charAt(0).toUpperCase() + idea.type.slice(1)}
                </span>
              </div>
              
              <p className={styles.ideaDescription}>{idea.description}</p>
              
              <div className={styles.ideaDetails}>
                <div className={styles.stack}>
                  <h3>Tech Stack:</h3>
                  <div className={styles.stackTags}>
                    {idea.stack.map((tech, i) => (
                      <span key={i} className={styles.stackTag}>{tech}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.actionButton}
                  onClick={() => handleSave(idea)}
                  disabled={savedProjects.some(p => p.title === idea.title)}
                >
                  {savedProjects.some(p => p.title === idea.title) ? 'Saved' : 'Save'}
                </button>
                <button
                  className={styles.actionButton}
                  onClick={() => handleExport(idea)}
                >
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.bottomActions}>
          <div className={styles.paginationInfo}>
            <span>Page {currentPage} of {totalPages}</span>
            <span>Total Projects: {totalProjects}</span>
            <span>Showing: {filteredIdeas.length} projects</span>
          </div>
          
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
            
            <div className={styles.pageNumbers}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageNumber} ${currentPage === pageNum ? styles.active : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className={styles.paginationButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </div>

          <button
            className={styles.regenerateButton}
            onClick={handleRegenerate}
            disabled={loading}
            title={isInitialLoad ? "Click to generate initial ideas" : "Generate more ideas"}
          >
            {loading ? 'Loading...' : isInitialLoad ? 
              'Generate Initial Ideas' : 
              'Generate More Ideas'}
          </button>
        </div>

        {toast.show && (
          <div className={`${styles.toast} ${styles.success} ${!toast.show ? styles.toastHide : ''}`}>
            <span className={styles.toastIcon}>✓</span>
            <span className={styles.toastMessage}>{toast.message}</span>
          </div>
        )}
      </div>
    </main>
  );
} 