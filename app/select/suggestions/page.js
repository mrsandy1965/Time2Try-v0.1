'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import projectIdeas from '../../data/projectIdeas.json';

const INITIAL_PROJECTS_PER_PAGE = 6;
const DEFAULT_TOTAL_PROJECTS = 15;
const ADDITIONAL_PROJECTS = 5;
const MAX_PROJECTS_PER_PAGE = 50;
const PROJECTS_EXPIRY_HOURS = 24; // Projects will refresh after 24 hours

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
  const [techStackPreferences, setTechStackPreferences] = useState([]);
  const [previouslyShownProjects, setPreviouslyShownProjects] = useState([]);

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Load saved projects and preferences from localStorage
        const storedSavedProjects = localStorage.getItem('savedProjects');
        const storedPreferences = localStorage.getItem('selectedTechStack');
        const storedPreviouslyShown = localStorage.getItem('previouslyShownProjects');
        
        if (storedSavedProjects) {
          setSavedProjects(JSON.parse(storedSavedProjects));
        }
        
        let preferences = [];
        if (storedPreferences) {
          try {
            preferences = JSON.parse(storedPreferences);
            if (!preferences || preferences.length === 0) {
              console.log('No valid tech stack preferences found');
              router.push('/select');
              return;
            }
          } catch (error) {
            console.error('Error parsing tech stack preferences:', error);
            router.push('/select');
            return;
          }
        } else {
          console.log('No tech stack preferences found');
          router.push('/select');
          return;
        }

        setTechStackPreferences(preferences);
        console.log('Loaded tech stack preferences:', preferences);
        
        if (storedPreviouslyShown) {
          try {
            setPreviouslyShownProjects(JSON.parse(storedPreviouslyShown));
          } catch (error) {
            console.error('Error parsing previously shown projects:', error);
            setPreviouslyShownProjects([]);
          }
        }
        
        // Load current projects from localStorage
        const storedProjects = localStorage.getItem('currentProjects');
        const storedProjectsTimestamp = localStorage.getItem('currentProjectsTimestamp');
        
        if (storedProjects && storedProjectsTimestamp) {
          try {
            const timestamp = parseInt(storedProjectsTimestamp);
            const now = new Date().getTime();
            const hoursSinceLastLoad = (now - timestamp) / (1000 * 60 * 60);
            
            if (hoursSinceLastLoad < PROJECTS_EXPIRY_HOURS) {
              const parsedProjects = JSON.parse(storedProjects);
              setAllIdeas(parsedProjects);
              setTotalPages(Math.ceil(parsedProjects.length / INITIAL_PROJECTS_PER_PAGE));
              setTotalProjects(parsedProjects.length);
              updateDisplayedIdeas(parsedProjects, 1);
              setIsInitialLoad(false);
              setLoading(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing stored projects:', error);
          }
        }
        
        await handleRegenerate();
        setLoading(false);
      } catch (error) {
        console.error('Error initializing page:', error);
        setLoading(false);
      }
    };

    initializePage();
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
      setTimeout(() => setToast({ show: false, message: '' }), 300);
    }, 3000);
  };

  const handleSave = (idea) => {
    if (savedProjects.some(p => p.title === idea.title)) {
      showToast('Project already saved!');
      return;
    }

    const updatedSavedProjects = [...savedProjects, idea];
    setSavedProjects(updatedSavedProjects);
    localStorage.setItem('savedProjects', JSON.stringify(updatedSavedProjects));
    showToast('Project saved successfully! 🎉');
  };

  const handleExport = (idea) => {
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

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const filterProjectsByTechStack = (projects) => {
    if (!techStackPreferences || techStackPreferences.length === 0) {
      console.log('No tech stack preferences to filter by');
      return projects;
    }
    
    console.log('Filtering projects with preferences:', techStackPreferences);
    const filtered = projects.filter(project => {
      const matches = project.stack.some(tech => 
        techStackPreferences.some(pref => 
          tech.toLowerCase().includes(pref.toLowerCase())
        )
      );
      console.log(`Project ${project.title} matches:`, matches);
      return matches;
    });
    
    console.log('Filtered projects count:', filtered.length);
    return filtered;
  };

  const getUniqueProjects = (projects) => {
    const unique = projects.filter(project => 
      !previouslyShownProjects.some(shown => shown.title === project.title)
    );
    console.log('Unique projects count:', unique.length);
    return unique;
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      
      const projectsToGenerate = isInitialLoad ? DEFAULT_TOTAL_PROJECTS : ADDITIONAL_PROJECTS;
      const allAvailableIdeas = projectIdeas.projects;
      
      if (!allAvailableIdeas || allAvailableIdeas.length === 0) {
        throw new Error('No ideas were found');
      }

      // Filter projects based on tech stack preferences
      let filteredIdeas = filterProjectsByTechStack(allAvailableIdeas);
      
      // Get unique projects that haven't been shown before
      filteredIdeas = getUniqueProjects(filteredIdeas);
      
      if (filteredIdeas.length === 0) {
        showToast('No more unique ideas available for your tech stack preferences!');
        // Clear previously shown projects to start fresh
        setPreviouslyShownProjects([]);
        localStorage.removeItem('previouslyShownProjects');
        filteredIdeas = filterProjectsByTechStack(allAvailableIdeas);
      }

      // Shuffle the filtered array
      const shuffledIdeas = shuffleArray(filteredIdeas);
      
      if (isInitialLoad) {
        const initialIdeas = shuffledIdeas.slice(0, projectsToGenerate);
        setAllIdeas(initialIdeas);
        setTotalPages(Math.ceil(initialIdeas.length / INITIAL_PROJECTS_PER_PAGE));
        setTotalProjects(initialIdeas.length);
        updateDisplayedIdeas(initialIdeas, 1);
        setIsInitialLoad(false);

        // Store the initial projects and update previously shown projects
        localStorage.setItem('currentProjects', JSON.stringify(initialIdeas));
        localStorage.setItem('currentProjectsTimestamp', new Date().getTime().toString());
        const updatedPreviouslyShown = [...previouslyShownProjects, ...initialIdeas];
        setPreviouslyShownProjects(updatedPreviouslyShown);
        localStorage.setItem('previouslyShownProjects', JSON.stringify(updatedPreviouslyShown));
      } else {
        const newIdeas = shuffledIdeas.slice(0, projectsToGenerate);
        
        if (newIdeas.length === 0) {
          showToast('No more unique ideas available!');
          return;
        }

        const combinedIdeas = [...allIdeas, ...newIdeas];
        const newTotalProjects = combinedIdeas.length;
        const newTotalPages = Math.ceil(newTotalProjects / INITIAL_PROJECTS_PER_PAGE);
        
        setAllIdeas(combinedIdeas);
        setTotalPages(newTotalPages);
        setTotalProjects(newTotalProjects);
        updateDisplayedIdeas(combinedIdeas, currentPage);

        // Update stored projects and previously shown projects
        localStorage.setItem('currentProjects', JSON.stringify(combinedIdeas));
        localStorage.setItem('currentProjectsTimestamp', new Date().getTime().toString());
        const updatedPreviouslyShown = [...previouslyShownProjects, ...newIdeas];
        setPreviouslyShownProjects(updatedPreviouslyShown);
        localStorage.setItem('previouslyShownProjects', JSON.stringify(updatedPreviouslyShown));
      }

      showToast(isInitialLoad ? 'Initial ideas loaded successfully! 🎉' : 'More ideas loaded successfully! 🎉');
    } catch (error) {
      console.error('Error loading ideas:', error);
      showToast(error.message || 'Failed to load ideas. Please try again.');
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
      <main className={styles.main} >
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
            title={isInitialLoad ? "Click to load initial ideas" : "Load more ideas"}
          >
            {loading ? 'Loading...' : isInitialLoad ? 
              'Load Initial Ideas' : 
              'Load More Ideas'}
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